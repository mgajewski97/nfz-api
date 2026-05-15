import axios, { AxiosError, AxiosInstance } from "axios";
import type {
  BasicDataParams,
  BasicDataResponse,
  BenefitsResponse,
  HospitalizationByAdmissionTypeResponse,
  HospitalizationByAgeResponse,
  HospitalizationByDischargeTypeResponse,
  HospitalizationByGenderResponse,
  HospitalizationByHealthcareServicesResponse,
  HospitalizationParams,
  CatalogCode,
  IndexOfTablesParams,
  IndexOfTablesResponse,
  NfzApiError,
  PaginationParams,
  SectionsResponse,
} from "@/types/nfz";

// ─── Client error ─────────────────────────────────────────────────────────────

export class NfzApiClientError extends Error {
  constructor(
    message: string,
    public readonly apiErrors?: NfzApiError[],
    public readonly status?: number,
  ) {
    super(message);
    this.name = "NfzApiClientError";
  }
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const BASE_URL = "https://api.nfz.gov.pl/app-stat-api-jgp";

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
  params: {
    format: "json",
    "api-version": "1.1",
  },
  timeout: 15_000,
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ errors?: NfzApiError[] }>) => {
    const apiErrors = err.response?.data?.errors;
    const status = err.response?.status;

    if (apiErrors?.length) {
      const first = apiErrors[0];
      throw new NfzApiClientError(
        `NFZ API error ${first["error-code"]}: ${first["error-result"]} — ${first["error-reason"]}`,
        apiErrors,
        status,
      );
    }

    throw new NfzApiClientError(
      err.message ?? "Unknown NFZ API error",
      undefined,
      status,
    );
  },
);

// ─── Helper ───────────────────────────────────────────────────────────────────

function clean<T extends Record<string, unknown>>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
  ) as Partial<T>;
}

// ─── /sections ───────────────────────────────────────────────────────────────

/**
 * Returns the list of JGP sections (e.g. "A - Choroby układu nerwowego").
 * Paginated — default limit=10, 19 sections across 2 pages.
 */
export async function getSections(
  params: PaginationParams = {},
): Promise<SectionsResponse> {
  const { data } = await http.get<SectionsResponse>("/sections", {
    params: clean({ page: params.page ?? 1, limit: params.limit ?? 25 }),
  });
  return data;
}

/**
 * Fetches all sections across all pages in a single call.
 * Returns a flat string array.
 */
export async function getAllSections(): Promise<string[]> {
  const first = await getSections({ page: 1, limit: 25 });
  if (!first.links.next) return first.data;

  const totalPages = Math.ceil(first.meta.count / first.meta.limit);
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      getSections({ page: i + 2, limit: 25 }).then((r) => r.data),
    ),
  );
  return [...first.data, ...rest.flat()];
}

// ─── /benefits ───────────────────────────────────────────────────────────────

export interface BenefitsSearchParams extends PaginationParams {
  /** Search term — minimum 2 characters. Substring match against benefit name. */
  benefit: string;
  /** Catalog code — required by the API. */
  catalog: CatalogCode;
  /** Optional JGP section filter — must match a value from /sections. */
  section?: string;
}

/**
 * Searches the benefits dictionary by substring match on benefit name.
 *
 * Real API behavior (verified 2026-05-15):
 *   - `benefit` is required and must be ≥ 2 characters (error 4201032 otherwise)
 *   - `catalog` is required
 *   - Search is case-insensitive substring match against the full benefit name
 *   - Polish characters do NOT work in the query string (URL-encode them before calling)
 *   - Returns {code, name} pairs; name starts with JGP group code, e.g. "A01 ZABIEGI..."
 *   - `data: []` means no matches (not an error)
 */
export async function getBenefits(
  params: BenefitsSearchParams,
): Promise<BenefitsResponse> {
  const { data } = await http.get<BenefitsResponse>("/benefits", {
    params: clean({
      benefit: params.benefit,
      catalog: params.catalog,
      section: params.section,
      page: params.page ?? 1,
      limit: params.limit ?? 25,
    }),
  });
  return data;
}

// ─── /index-of-tables ────────────────────────────────────────────────────────

/**
 * Returns index of statistical tables for a given product (benefit / JGP group).
 *
 * Both `catalog` and `name` are required by the API.
 * `name` must match a value from /benefits.
 *
 * Catalog codes:
 *   1a = Jednorodne Grupy Pacjentów
 *   1b = Katalog świadczeń odrębnych
 *   1c = Katalog świadczeń do sumowania
 *   1d = Katalog świadczeń radioterapii
 *   1w = Katalog świadczeń wysokospecjalistycznych
 */
export async function getIndexOfTables(
  params: IndexOfTablesParams,
): Promise<IndexOfTablesResponse> {
  const { data } = await http.get<IndexOfTablesResponse>("/index-of-tables", {
    params: clean({
      catalog: params.catalog,
      name: params.name,
      year: params.year,
    }),
  });
  return data;
}

// ─── /basic-data/{id} ────────────────────────────────────────────────────────

/**
 * Returns basic hospitalization statistics for a table identified by UUID.
 * The UUID comes from IndexOfTables → years[n].tables[n].id
 *
 * Optional filters:
 *   branch      — split results by NFZ regional branch (OW)
 *   hospitalType — split by hospital type (1–5)
 */
export async function getBasicData(
  id: string,
  params: BasicDataParams = {},
): Promise<BasicDataResponse> {
  const { data } = await http.get<BasicDataResponse>(`/basic-data/${id}`, {
    params: clean({
      branch: params.branch,
      hospitalType: params.hospitalType,
      page: params.page ?? 1,
      limit: params.limit ?? 25,
    }),
  });
  return data;
}

// ─── /hospitalizations-by-patient-gender/{id} ────────────────────────────────

/**
 * Returns hospitalization statistics split by patient gender.
 * gender-code: 0=nieokreślona, 1=mężczyzna, 2=kobieta, 9=nieznana
 */
export async function getHospitalizationsByGender(
  id: string,
  params: HospitalizationParams = {},
): Promise<HospitalizationByGenderResponse> {
  const { data } = await http.get<HospitalizationByGenderResponse>(
    `/hospitalizations-by-patient-gender/${id}`,
    {
      params: clean({
        branch: params.branch,
        hospitalType: params.hospitalType,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
      }),
    },
  );
  return data;
}

// ─── /hospitalizations-by-admission-type/{id} ────────────────────────────────

/** Returns hospitalization statistics split by type of patient admission. */
export async function getHospitalizationsByAdmissionType(
  id: string,
  params: HospitalizationParams = {},
): Promise<HospitalizationByAdmissionTypeResponse> {
  const { data } = await http.get<HospitalizationByAdmissionTypeResponse>(
    `/hospitalizations-by-admission-type/${id}`,
    {
      params: clean({
        branch: params.branch,
        hospitalType: params.hospitalType,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
      }),
    },
  );
  return data;
}

// ─── /hospitalizations-by-discharge-type/{id} ────────────────────────────────

/** Returns hospitalization statistics split by type of patient discharge. */
export async function getHospitalizationsByDischargeType(
  id: string,
  params: HospitalizationParams = {},
): Promise<HospitalizationByDischargeTypeResponse> {
  const { data } = await http.get<HospitalizationByDischargeTypeResponse>(
    `/hospitalizations-by-discharge-type/${id}`,
    {
      params: clean({
        branch: params.branch,
        hospitalType: params.hospitalType,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
      }),
    },
  );
  return data;
}

// ─── /hospitalizations-by-patient-age/{id} ───────────────────────────────────

/**
 * Returns hospitalization statistics split by patient age group.
 * age-group-code: 1=<1yr, 2=1–6, 3=7–17, 4=18–40, 5=41–60, 6=61–80,
 *                 7=81+, 8=brak danych
 */
export async function getHospitalizationsByAge(
  id: string,
  params: HospitalizationParams = {},
): Promise<HospitalizationByAgeResponse> {
  const { data } = await http.get<HospitalizationByAgeResponse>(
    `/hospitalizations-by-patient-age/${id}`,
    {
      params: clean({
        branch: params.branch,
        hospitalType: params.hospitalType,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
      }),
    },
  );
  return data;
}

// ─── /hospitalizations-by-healthcare-services/{id} ───────────────────────────

/** Returns hospitalization statistics split by healthcare service scope (contract product). */
export async function getHospitalizationsByHealthcareServices(
  id: string,
  params: HospitalizationParams = {},
): Promise<HospitalizationByHealthcareServicesResponse> {
  const { data } = await http.get<HospitalizationByHealthcareServicesResponse>(
    `/hospitalizations-by-healthcare-service/${id}`,
    {
      params: clean({
        branch: params.branch,
        hospitalType: params.hospitalType,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
      }),
    },
  );
  return data;
}
