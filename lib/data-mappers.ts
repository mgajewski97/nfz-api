import type { CatalogCode } from "@/types/nfz";

// ─── Field label mappings ─────────────────────────────────────────────────────

/** Maps NFZ API field names to Polish business labels used in UI and exports. */
export const FIELD_LABELS: Record<string, string> = {
  // Basic data
  "number-of-patients": "Liczba pacjentów",
  "number-of-hospitalizations": "Liczba hospitalizacji",
  "ratio-of-rehospitalizations": "Współczynnik rehospitalizacji",
  percentage: "Udział hospitalizacji (%)",
  "percentage-of-sections": "Udział w sekcji (%)",
  "duration-of-hospitalization-mediana": "Mediana czasu pobytu (dni)",
  "duration-of-hospitalization-mode": "Dominanta czasu pobytu (dni)",
  "average-value-of-hospitalization": "Śr. wartość hospitalizacji (zł)",
  "average-value-of-hospitalization-points": "Śr. wartość hospitalizacji (pkt)",
  "average-value-of-drg": "Śr. wartość grupy JGP (zł)",
  "average-value-of-drg-points": "Śr. wartość grupy JGP (pkt)",

  // Shared context columns
  branch: "Oddział Wojewódzki NFZ",
  "hospital-types": "Typ szpitala",

  // Gender breakdown
  "gender-code": "Kod płci",
  "gender-name": "Płeć",

  // Age group breakdown
  "age-group-code": "Kod grupy wiekowej",
  "age-group-name": "Grupa wiekowa",

  // Admission type breakdown
  "type-of-admission-code": "Kod trybu przyjęcia",
  "type-of-admission-name": "Tryb przyjęcia",

  // Discharge type breakdown
  "type-of-discharge-code": "Kod trybu wypisu",
  "type-of-discharge-name": "Tryb wypisu",

  // Healthcare services (contract product) breakdown
  "contract-product-code": "Kod zakresu świadczeń",
  "contract-product-name": "Zakres świadczeń",

  // Index / table attributes
  "product-code": "Kod produktu",
  "product-name": "Nazwa produktu",
  header: "Tytuł tabeli",
  year: "Rok",
  code: "Kod świadczenia",
  name: "Nazwa świadczenia",
};

export function fieldLabel(apiKey: string): string {
  return FIELD_LABELS[apiKey] ?? apiKey;
}

// ─── Catalog codes ────────────────────────────────────────────────────────────

export const CATALOG_LABELS: Record<CatalogCode, string> = {
  "1a": "Jednorodne Grupy Pacjentów (JGP)",
  "1b": "Katalog świadczeń odrębnych",
  "1c": "Katalog świadczeń do sumowania",
  "1d": "Katalog świadczeń radioterapii",
  "1w": "Katalog świadczeń wysokospecjalistycznych",
};

export function catalogLabel(code: CatalogCode): string {
  return CATALOG_LABELS[code] ?? code;
}

// ─── NFZ Regional branch codes (OW NFZ) ──────────────────────────────────────

export const BRANCH_LABELS: Record<string, string> = {
  "01": "Dolnośląski OW NFZ",
  "02": "Kujawsko-Pomorski OW NFZ",
  "03": "Lubelski OW NFZ",
  "04": "Lubuski OW NFZ",
  "05": "Łódzki OW NFZ",
  "06": "Małopolski OW NFZ",
  "07": "Mazowiecki OW NFZ",
  "08": "Opolski OW NFZ",
  "09": "Podkarpacki OW NFZ",
  "10": "Podlaski OW NFZ",
  "11": "Pomorski OW NFZ",
  "12": "Śląski OW NFZ",
  "13": "Świętokrzyski OW NFZ",
  "14": "Warmińsko-Mazurski OW NFZ",
  "15": "Wielkopolski OW NFZ",
  "16": "Zachodniopomorski OW NFZ",
};

export function branchLabel(code: string): string {
  return BRANCH_LABELS[code] ?? `OW NFZ ${code}`;
}

// ─── Hospital type codes ──────────────────────────────────────────────────────

export const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  "1": "Szpital gminny / powiatowy / miejski",
  "2": "Szpital niepubliczny",
  "3": "Szpital kliniczny",
  "4": "Szpital wojewódzki",
  "5": "Szpital inny",
};

export function hospitalTypeLabel(code: string): string {
  return HOSPITAL_TYPE_LABELS[code] ?? `Typ ${code}`;
}

// ─── Gender codes ─────────────────────────────────────────────────────────────

export const GENDER_LABELS: Record<number, string> = {
  0: "Płeć nieokreślona",
  1: "Mężczyzna",
  2: "Kobieta",
  9: "Płeć nieznana",
};

export function genderLabel(code: number): string {
  return GENDER_LABELS[code] ?? `Płeć (kod ${code})`;
}

// ─── Age group codes ──────────────────────────────────────────────────────────

export const AGE_GROUP_LABELS: Record<number, string> = {
  1: "Poniżej 1 roku",
  2: "1–6 lat",
  3: "7–17 lat",
  4: "18–40 lat",
  5: "41–60 lat",
  6: "61–80 lat",
  7: "81 lat i więcej",
  8: "Brak danych",
};

export function ageGroupLabel(code: number): string {
  return AGE_GROUP_LABELS[code] ?? `Grupa wiekowa (kod ${code})`;
}

// ─── Generic row transformer ──────────────────────────────────────────────────

/**
 * Transforms a raw NFZ data row by:
 * 1. Replacing kebab-case API keys with Polish business labels (for display/export).
 * 2. Expanding branch and hospital-type codes to their full names.
 *
 * Used by export-service.ts and table components that need labelled columns.
 */
export function mapRowForDisplay(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const label = fieldLabel(key);

    if (key === "branch" && typeof value === "string") {
      result[label] = branchLabel(value);
    } else if (key === "hospital-types" && typeof value === "string") {
      result[label] = hospitalTypeLabel(value);
    } else if (key === "gender-code" && typeof value === "number") {
      result[label] = genderLabel(value);
    } else if (key === "age-group-code" && typeof value === "number") {
      result[label] = ageGroupLabel(value);
    } else {
      result[label] = value;
    }
  }

  return result;
}
