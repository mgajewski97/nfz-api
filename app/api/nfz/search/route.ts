import { NextRequest } from "next/server";
import { getBenefits, getIndexOfTables } from "@/lib/nfz-client";
import { CATALOG_LABELS } from "@/lib/data-mappers";
import {
  err,
  handleNfzError,
  ok,
  parsePositiveInt,
  validateCatalog,
} from "@/lib/api-response";
import type { CatalogCode } from "@/types/nfz";

// ─── Result shape returned to the client ─────────────────────────────────────

export interface SearchResult {
  code: string;
  name: string;
  catalog: CatalogCode;
  catalogLabel: string;
  tableSummary?: {
    tableCount: number;
    years: number[];
    latestYear: number | null;
    labels: string[];
  };
}

export interface SearchMeta {
  query: string;
  total: number;
  page: number;
  limit: number;
  catalogs: CatalogCode[];
  section: string | null;
  mode: "default" | "tables" | "icd";
}

const ALL_CATALOGS: CatalogCode[] = ["1a", "1b", "1c", "1d", "1w"];
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;
const TABLE_BROWSER_QUERY = "5.";

const TABLE_TYPE_LABELS: Record<string, string> = {
  "general-data": "Dane ogólne",
  "hospitalization-by-gender": "Według płci",
  "hospitalization-by-age": "Według wieku",
  "hospitalization-by-admission": "Tryb przyjęcia",
  "hospitalization-by-discharge": "Tryb wypisu",
  "hospitalization-by-service": "Zakres świadczeń",
  "icd-9-procedures": "Procedury ICD-9",
  "icd-10-diseases": "Rozpoznania ICD-10",
  "product-categories": "Kategorie produktów",
  histograms: "Histogram czasu pobytu",
};

/**
 * GET /api/nfz/search
 *
 * Searches NFZ benefits dictionary by substring match on benefit name.
 *
 * Real API constraints (verified against live API):
 *   - Minimum query length: 2 characters (API returns error 4201032 for 1 char)
 *   - Search is case-insensitive substring match
 *   - Polish diacritics in query are silently dropped by NFZ — ASCII-only searches
 *     return meaningful results (e.g. "zawał" → search as "zawal" or by JGP code "E6")
 *   - Default: searches all 5 catalogs in parallel and merges results
 *
 * Query params:
 *   q       – required; search term, min 2 characters
 *   catalog – optional; filter to one catalog: 1a | 1b | 1c | 1d | 1w
 *   page    – page number (default: 1, applied per-catalog before merge)
 *   limit   – results per page, max 25 (default: 25)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode =
    sp.get("view") === "tables"
      ? "tables"
      : sp.get("type") === "icd"
        ? "icd"
        : "default";

  // Validate q
  const rawQ =
    mode === "tables" && !sp.get("q")
      ? TABLE_BROWSER_QUERY
      : (sp.get("q")?.trim() ?? "");
  if (rawQ.length < MIN_QUERY_LENGTH) {
    return err(
      `Zapytanie musi mieć co najmniej ${MIN_QUERY_LENGTH} znaki.`,
      "QUERY_TOO_SHORT",
      400,
    );
  }
  if (rawQ.length > MAX_QUERY_LENGTH) {
    return err(
      `Zapytanie nie może być dłuższe niż ${MAX_QUERY_LENGTH} znaków.`,
      "QUERY_TOO_LONG",
      400,
    );
  }

  // Optional catalog filter
  const rawCatalog = sp.get("catalog");
  let catalogsToSearch: CatalogCode[];
  if (rawCatalog) {
    const result = validateCatalog(rawCatalog);
    if (!result.ok) return result.response;
    catalogsToSearch = [result.value];
  } else if (mode === "tables") {
    catalogsToSearch = ["1a"];
  } else {
    catalogsToSearch = ALL_CATALOGS;
  }

  const section = sp.get("section")?.trim() || null;

  const pageResult = parsePositiveInt(sp.get("page"), "page", 1);
  if (!pageResult.ok) return pageResult.response;

  const limitResult = parsePositiveInt(sp.get("limit"), "limit", 25, 25);
  if (!limitResult.ok) return limitResult.response;

  try {
    // Search all requested catalogs in parallel
    const settled = await Promise.allSettled(
      catalogsToSearch.map((catalog) =>
        getBenefits({
          benefit: rawQ,
          catalog,
          section: section ?? undefined,
          page: pageResult.value,
          limit: limitResult.value,
        }).then((res) => ({ catalog, res })),
      ),
    );

    const results: SearchResult[] = [];
    let totalCount = 0;

    for (const outcome of settled) {
      if (outcome.status === "rejected") continue; // silently skip failed catalogs
      const { catalog, res } = outcome.value;
      totalCount += res.meta.count;

      for (const benefit of res.data ?? []) {
        if (!benefit.code || !benefit.name) continue;
        results.push({
          code: benefit.code,
          name: benefit.name,
          catalog,
          catalogLabel: CATALOG_LABELS[catalog],
        });
      }
    }

    // Sort: exact-prefix matches first (name starts with query, case-insensitive)
    const qUpper = rawQ.toUpperCase();
    results.sort((a, b) => {
      const aPrefix = a.name.startsWith(qUpper) ? 0 : 1;
      const bPrefix = b.name.startsWith(qUpper) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      return a.name.localeCompare(b.name, "pl");
    });

    if (mode === "tables" && results.length) {
      const summaries = await Promise.allSettled(
        results.slice(0, 10).map((result) =>
          getIndexOfTables({
            catalog: result.catalog,
            name: result.name,
          }).then((res) => {
            const years = (res.data?.attributes?.years ?? [])
              .map((entry) => entry.year)
              .filter((year) => year >= 2015)
              .sort((a, b) => b - a);
            const labels = Array.from(
              new Set(
                (res.data?.attributes?.years ?? [])
                  .flatMap((entry) => entry.tables ?? [])
                  .map((table) => TABLE_TYPE_LABELS[table.type] ?? table.attributes.header ?? null)
                  .filter((label): label is string => Boolean(label)),
              ),
            ).slice(0, 6);
            return {
              code: result.code,
              catalog: result.catalog,
              summary: {
                tableCount: (res.data?.attributes?.years ?? []).reduce(
                  (count, entry) => count + (entry.tables?.length ?? 0),
                  0,
                ),
                years,
                latestYear: years[0] ?? null,
                labels,
              },
            };
          }),
        ),
      );

      for (const outcome of summaries) {
        if (outcome.status !== "fulfilled") continue;
        const target = results.find(
          (result) =>
            result.code === outcome.value.code &&
            result.catalog === outcome.value.catalog,
        );
        if (target) target.tableSummary = outcome.value.summary;
      }
    }

    const meta: SearchMeta = {
      query: rawQ,
      total: totalCount,
      page: pageResult.value,
      limit: limitResult.value,
      catalogs: catalogsToSearch,
      section,
      mode,
    };

    return ok(results, meta);
  } catch (error) {
    return handleNfzError(error);
  }
}
