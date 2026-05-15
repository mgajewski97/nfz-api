// ─── Metadata ────────────────────────────────────────────────────────────────

/** Metadata returned by endpoints without pagination (e.g. index-of-tables). */
export interface BaseMetadata {
  "@context": string;
  title: string;
  url: string;
  provider: string;
  "date-published": string | null;
  "date-modified": string;
  description: string;
  keywords: string;
  language: string;
  "content-type": string;
  "is-part-of": string;
  version: string;
}

/** Metadata returned by paginated endpoints (extends BaseMetadata with pagination fields). */
export interface PaginatedMetadata extends BaseMetadata {
  count: number;
  page: number;
  limit: number;
}

/** HATEOS navigation links present on paginated responses. */
export interface PaginationLinks {
  first: string | null;
  prev: string | null;
  self: string | null;
  next: string | null;
  last: string | null;
  related: string | null;
}

// ─── Error response ───────────────────────────────────────────────────────────

export interface NfzApiError {
  id: string;
  "error-result": string;
  "error-reason": string;
  "error-solution": string;
  "error-help": string;
  "error-code": number;
}

export interface NfzErrorResponse {
  errors: NfzApiError[];
}

// ─── /sections ───────────────────────────────────────────────────────────────

/**
 * Response from GET /sections
 * data is a plain string array like "A - Choroby układu nerwowego"
 */
export interface SectionsResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: string[];
}

// ─── /benefits ───────────────────────────────────────────────────────────────

export interface Benefit {
  code: string | null;
  name: string | null;
}

/**
 * Response from GET /benefits
 * NOTE: as of 2026-05-15 this endpoint returns error code 4200004 (Maintenance).
 */
export interface BenefitsResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: Benefit[];
}

// ─── /index-of-tables ────────────────────────────────────────────────────────

export interface TableAdditionalInfo {
  "divided-by-branches": boolean;
  "divided-by-hospital-types": boolean;
  "divided-by-products": boolean;
}

export interface TableAttributes {
  header: string | null;
  "resource-name": string | null;
  /** Note: the API has a typo "additional-infromation" — kept intentionally. */
  "additional-infromation": TableAdditionalInfo | null;
}

export interface StatisticalTable {
  id: string;
  type: string;
  attributes: TableAttributes;
  links: { related: string | null };
}

export interface IndexPeriod {
  "date-from": string;
  "date-to": string | null;
  tables: StatisticalTable[] | null;
}

export interface IndexYear {
  year: number;
  tables: StatisticalTable[] | null;
  periods: IndexPeriod[] | null;
}

export interface IndexAttributes {
  "product-code": string | null;
  "product-name": string | null;
  comment: string | null;
  years: IndexYear[] | null;
}

export interface IndexOfTables {
  type: string | null;
  attributes: IndexAttributes | null;
}

/**
 * Response from GET /index-of-tables
 * Requires: catalog (required), name (required), year? (optional)
 */
export interface IndexOfTablesResponse {
  meta: BaseMetadata;
  data: IndexOfTables | null;
}

// ─── /basic-data/{id} ────────────────────────────────────────────────────────

export interface BasicDataValues {
  /** Present only when data is split by OW NFZ branch (01–16). */
  branch?: string | null;
  /** Present only when split by branch. 1–5 hospital type codes. */
  "hospital-types"?: string | null;
  "number-of-patients": number;
  "number-of-hospitalizations": number;
  "ratio-of-rehospitalizations": number;
  percentage: number;
  "percentage-of-sections": number;
  "duration-of-hospitalization-mediana": number;
  "duration-of-hospitalization-mode": number;
  "average-value-of-hospitalization": number;
  "average-value-of-hospitalization-points": number;
  "average-value-of-drg": number;
  "average-value-of-drg-points": number;
}

export interface BasicDataAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: BasicDataValues[] | null;
}

export interface BasicData {
  id: string;
  type: string;
  attributes: BasicDataAttributes;
}

/** Response from GET /basic-data/{id} */
export interface BasicDataResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: BasicData | null;
}

// ─── Hospitalization tables — shared row fields ───────────────────────────────

interface HospitalizationRowBase {
  branch?: string | null;
  "hospital-types"?: string | null;
  "number-of-hospitalizations": number;
  percentage: number;
  "duration-of-hospitalization-mediana": number;
}

// ─── /hospitalizations-by-patient-gender/{id} ────────────────────────────────

export interface HospitalizationByGender extends HospitalizationRowBase {
  /** 0=nieokreślona, 1=mężczyzna, 2=kobieta, 9=nieznana */
  "gender-code": number;
  "gender-name": string;
}

export interface HospitalizationByGenderAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: HospitalizationByGender[] | null;
}

export interface HospitalizationByGenderTable {
  id: string;
  type: string;
  attributes: HospitalizationByGenderAttributes;
}

export interface HospitalizationByGenderResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: HospitalizationByGenderTable | null;
}

// ─── /hospitalizations-by-admission-type/{id} ────────────────────────────────

export interface HospitalizationByAdmissionType extends HospitalizationRowBase {
  "type-of-admission-code": number;
  "type-of-admission-name": string;
}

export interface HospitalizationByAdmissionTypeAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: HospitalizationByAdmissionType[] | null;
}

export interface HospitalizationByAdmissionTypeTable {
  id: string;
  type: string;
  attributes: HospitalizationByAdmissionTypeAttributes;
}

export interface HospitalizationByAdmissionTypeResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: HospitalizationByAdmissionTypeTable | null;
}

// ─── /hospitalizations-by-discharge-type/{id} ────────────────────────────────

export interface HospitalizationByDischargeType extends HospitalizationRowBase {
  "type-of-discharge-code": number;
  "type-of-discharge-name": string;
}

export interface HospitalizationByDischargeTypeAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: HospitalizationByDischargeType[] | null;
}

export interface HospitalizationByDischargeTypeTable {
  id: string;
  type: string;
  attributes: HospitalizationByDischargeTypeAttributes;
}

export interface HospitalizationByDischargeTypeResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: HospitalizationByDischargeTypeTable | null;
}

// ─── /hospitalizations-by-patient-age/{id} ───────────────────────────────────

export interface HospitalizationByAge extends HospitalizationRowBase {
  /**
   * 1=poniżej 1, 2=1–6, 3=7–17, 4=18–40, 5=41–60, 6=61–80,
   * 7=81 i więcej, 8=brak danych
   */
  "age-group-code": number;
  "age-group-name": string;
}

export interface HospitalizationByAgeAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: HospitalizationByAge[] | null;
}

export interface HospitalizationByAgeTable {
  id: string;
  type: string;
  attributes: HospitalizationByAgeAttributes;
}

export interface HospitalizationByAgeResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: HospitalizationByAgeTable | null;
}

// ─── /hospitalizations-by-healthcare-services/{id} ───────────────────────────

export interface HospitalizationByHealthcareServices extends HospitalizationRowBase {
  "contract-product-code": number;
  "contract-product-name": string;
}

export interface HospitalizationByHealthcareServicesAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: HospitalizationByHealthcareServices[] | null;
}

export interface HospitalizationByHealthcareServicesTable {
  id: string;
  type: string;
  attributes: HospitalizationByHealthcareServicesAttributes;
}

export interface HospitalizationByHealthcareServicesResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: HospitalizationByHealthcareServicesTable | null;
}

// ─── /icd9-procedures/{id} ──────────────────────────────────────────────────

export interface Icd9Procedure {
  "procedure-code": string;
  "procedure-name": string;
  "number-of-hospitalizations": number;
  percentage: number;
  "duration-of-hospitalization-mediana": number;
}

export interface Icd9ProcedureAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: Icd9Procedure[] | null;
}

export interface Icd9ProcedureTable {
  id: string;
  type: string;
  attributes: Icd9ProcedureAttributes;
}

export interface Icd9ProceduresResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: Icd9ProcedureTable | null;
}

// ─── /icd10-diseases/{id} ───────────────────────────────────────────────────

export interface Icd10Disease {
  "disease-code": string;
  "disease-name": string;
  "number-of-hospitalizations": number;
  percentage: number;
  "duration-of-hospitalization-mediana": number;
}

export interface Icd10DiseaseAttributes {
  year: number;
  code: string | null;
  name: string | null;
  header: string | null;
  data: Icd10Disease[] | null;
}

export interface Icd10DiseaseTable {
  id: string;
  type: string;
  attributes: Icd10DiseaseAttributes;
}

export interface Icd10DiseasesResponse {
  meta: PaginatedMetadata;
  links: PaginationLinks;
  data: Icd10DiseaseTable | null;
}

// ─── Catalog codes ───────────────────────────────────────────────────────────

/**
 * Valid catalog codes for /index-of-tables
 * 1a = Jednorodne Grupy Pacjentów
 * 1b = Katalog świadczeń odrębnych
 * 1c = Katalog świadczeń do sumowania
 * 1d = Katalog świadczeń radioterapii
 * 1w = Katalog świadczeń wysokospecjalistycznych
 */
export type CatalogCode = "1a" | "1b" | "1c" | "1d" | "1w";

// ─── Query param types ────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface IndexOfTablesParams extends PaginationParams {
  catalog: CatalogCode;
  name: string;
  year?: number;
}

export interface BasicDataParams extends PaginationParams {
  branch?: boolean;
  hospitalType?: boolean;
}

export type HospitalizationParams = BasicDataParams;
