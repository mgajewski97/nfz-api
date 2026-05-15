import { NextResponse } from "next/server";
import { NfzApiClientError } from "./nfz-client";
import type { CatalogCode } from "@/types/nfz";

// ─── Unified response envelope ────────────────────────────────────────────────

export interface ApiMeta {
  page?: number;
  limit?: number;
  count?: number;
  dateModified?: string;
}

export type ApiResponse<T> =
  | { data: T; meta: ApiMeta; error: null }
  | { data: null; meta: null; error: { message: string; code: string } };

export function ok<T>(data: T, meta: ApiMeta = {}): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ data, meta, error: null });
}

export function err(
  message: string,
  code: string,
  status: number,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ data: null, meta: null, error: { message, code } }, { status });
}

// ─── NFZ error → friendly Polish message ─────────────────────────────────────

const NFZ_ERROR_MESSAGES: Record<number, string> = {
  4200004: "Zasób NFZ jest tymczasowo niedostępny (tryb konserwacji). Spróbuj ponownie później.",
  4201001: "Brakuje wymaganego parametru zapytania.",
  4201002: "Podany parametr ma nieprawidłową wartość.",
  4201003: "Nie znaleziono żądanego zasobu.",
  4201004: "Przekroczono limit wyników na stronie (maksymalnie 25).",
  4201023: "Wybrane filtry nie są obsługiwane dla tej tabeli. Zmień filtry i spróbuj ponownie.",
};

export function handleNfzError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof NfzApiClientError) {
    const firstCode = error.apiErrors?.[0]?.["error-code"];
    const fallbackByStatus =
      error.status === 404
        ? "Nie znaleziono danych dla wybranego zestawu. Wróć do wyników i wybierz inną tabelę."
        : error.status === 400
          ? "NFZ odrzucił parametry zapytania. Sprawdź wybrane filtry."
          : "Zasób NFZ jest chwilowo niedostępny. Spróbuj ponownie później.";
    const friendly: string =
      (firstCode !== undefined && NFZ_ERROR_MESSAGES[firstCode]) ||
      error.apiErrors?.[0]?.["error-reason"] ||
      fallbackByStatus;

    const httpStatus =
      error.status === 500 && firstCode === 4200004
        ? 503
        : error.status === 400
          ? 400
          : error.status === 404
            ? 404
            : 502;

    return err(friendly, `NFZ_${firstCode !== undefined ? String(firstCode) : "UNKNOWN"}`, httpStatus);
  }

  console.error("[NFZ API Route] Unexpected error:", error);
  return err("Wystąpił nieoczekiwany błąd serwera.", "INTERNAL_ERROR", 500);
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_CATALOGS: CatalogCode[] = ["1a", "1b", "1c", "1d", "1w"];

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; response: NextResponse<ApiResponse<never>> };

export function validateUuid(raw: string): ValidationResult<string> {
  if (!UUID_RE.test(raw)) {
    return {
      ok: false,
      response: err("Nieprawidłowy format identyfikatora (oczekiwany UUID).", "INVALID_UUID", 400),
    };
  }
  return { ok: true, value: raw };
}

export function validateCatalog(raw: string | null): ValidationResult<CatalogCode> {
  if (!raw) {
    return {
      ok: false,
      response: err(
        `Parametr "catalog" jest wymagany. Dozwolone wartości: ${VALID_CATALOGS.join(", ")}.`,
        "MISSING_CATALOG",
        400,
      ),
    };
  }
  if (!VALID_CATALOGS.includes(raw as CatalogCode)) {
    return {
      ok: false,
      response: err(
        `Nieprawidłowy katalog "${raw}". Dozwolone wartości: ${VALID_CATALOGS.join(", ")}.`,
        "INVALID_CATALOG",
        400,
      ),
    };
  }
  return { ok: true, value: raw as CatalogCode };
}

export function validateRequiredString(
  raw: string | null,
  paramName: string,
): ValidationResult<string> {
  if (!raw || raw.trim() === "") {
    return {
      ok: false,
      response: err(`Parametr "${paramName}" jest wymagany.`, `MISSING_${paramName.toUpperCase()}`, 400),
    };
  }
  return { ok: true, value: raw.trim() };
}

export function parsePositiveInt(
  raw: string | null,
  paramName: string,
  defaultValue: number,
  max?: number,
): ValidationResult<number> {
  if (raw === null) return { ok: true, value: defaultValue };

  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    return {
      ok: false,
      response: err(
        `Parametr "${paramName}" musi być dodatnią liczbą całkowitą.`,
        `INVALID_${paramName.toUpperCase()}`,
        400,
      ),
    };
  }
  if (max !== undefined && n > max) {
    return {
      ok: false,
      response: err(
        `Parametr "${paramName}" nie może przekraczać ${max}.`,
        `INVALID_${paramName.toUpperCase()}`,
        400,
      ),
    };
  }
  return { ok: true, value: n };
}

export function parseBoolean(raw: string | null): boolean | undefined {
  if (raw === null) return undefined;
  return raw === "true" || raw === "1";
}

export function parseYear(raw: string | null): ValidationResult<number | undefined> {
  if (raw === null) return { ok: true, value: undefined };

  const n = Number(raw);
  if (!Number.isInteger(n) || n < 2000 || n > new Date().getFullYear()) {
    return {
      ok: false,
      response: err(
        `Parametr "year" musi być rokiem z zakresu 2000–${new Date().getFullYear()}.`,
        "INVALID_YEAR",
        400,
      ),
    };
  }
  return { ok: true, value: n };
}

// ─── Build ApiMeta from NFZ paginated metadata ────────────────────────────────

export function buildMeta(meta: {
  count?: number;
  page?: number;
  limit?: number;
  "date-modified"?: string;
}): ApiMeta {
  return {
    ...(meta.count !== undefined && { count: meta.count }),
    ...(meta.page !== undefined && { page: meta.page }),
    ...(meta.limit !== undefined && { limit: meta.limit }),
    ...(meta["date-modified"] && { dateModified: meta["date-modified"] }),
  };
}
