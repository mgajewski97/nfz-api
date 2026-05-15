"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChevronLeft, RotateCcw, Search } from "lucide-react";
import { DataGrid } from "./DataGrid";
import { ExportButton } from "@/components/export/ExportButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATALOG_LABELS, fieldLabel } from "@/lib/data-mappers";
import type { CatalogCode } from "@/types/nfz";
import type { ApiResponse } from "@/lib/api-response";
import type { IndexOfTables, StatisticalTable } from "@/types/nfz";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2015;

const ALL_YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => MIN_YEAR + i,
);

const OVERVIEW_COLUMNS = [
  "number-of-patients",
  "number-of-hospitalizations",
  "ratio-of-rehospitalizations",
  "percentage",
  "percentage-of-sections",
  "duration-of-hospitalization-mediana",
  "duration-of-hospitalization-mode",
  "average-value-of-hospitalization",
  "average-value-of-hospitalization-points",
  "average-value-of-drg",
  "average-value-of-drg-points",
] as const;

const BREAKDOWN_TABS: Record<string, { label: string; apiPath: string; columns: string[] }> = {
  "hospitalization-by-gender": {
    label: "Wg płci",
    apiPath: "/api/nfz/hospitalizations/by-gender",
    columns: ["gender-name", "number-of-hospitalizations", "percentage", "duration-of-hospitalization-mediana"],
  },
  "hospitalization-by-age": {
    label: "Wg wieku",
    apiPath: "/api/nfz/hospitalizations/by-age",
    columns: ["age-group-name", "number-of-hospitalizations", "percentage", "duration-of-hospitalization-mediana"],
  },
  "hospitalization-by-admission": {
    label: "Tryb przyjęcia",
    apiPath: "/api/nfz/hospitalizations/by-admission-type",
    columns: ["type-of-admission-name", "number-of-hospitalizations", "percentage", "duration-of-hospitalization-mediana"],
  },
  "hospitalization-by-discharge": {
    label: "Tryb wypisu",
    apiPath: "/api/nfz/hospitalizations/by-discharge-type",
    columns: ["type-of-discharge-name", "number-of-hospitalizations", "percentage", "duration-of-hospitalization-mediana"],
  },
  "hospitalization-by-service": {
    label: "Zakres świadczeń",
    apiPath: "/api/nfz/hospitalizations/by-healthcare-services",
    columns: ["contract-product-name", "number-of-hospitalizations", "percentage", "duration-of-hospitalization-mediana"],
  },
  "icd-10-diseases": {
    label: "ICD-10",
    apiPath: "/api/nfz/icd10-diseases",
    columns: ["disease-code", "disease-name", "number-of-hospitalizations", "percentage", "duration-of-hospitalization-mediana"],
  },
  "icd-9-procedures": {
    label: "ICD-9",
    apiPath: "/api/nfz/icd9-procedures",
    columns: ["procedure-code", "procedure-name", "number-of-hospitalizations", "percentage", "duration-of-hospitalization-mediana"],
  },
};

const BREAKDOWN_ORDER = Object.keys(BREAKDOWN_TABS);

// ─── Types & helpers ──────────────────────────────────────────────────────────

type TabApiResponse = ApiResponse<{ attributes?: { data?: unknown[] | null } | null } | null>;
type IndexApiResponse = ApiResponse<IndexOfTables>;

async function fetchIndex(catalog: string, name: string): Promise<IndexApiResponse> {
  const { data } = await axios.get<IndexApiResponse>(
    `/api/nfz/index-of-tables?${new URLSearchParams({ catalog, name })}`,
  );
  return data;
}

async function fetchTabData(apiPath: string, uuid: string): Promise<TabApiResponse> {
  const { data } = await axios.get<TabApiResponse>(`${apiPath}/${uuid}`);
  return data;
}

function extractRows(response: TabApiResponse | undefined): Record<string, unknown>[] {
  if (!response || response.error) return [];
  const raw = (response.data as { attributes?: { data?: unknown[] | null } | null } | null)
    ?.attributes?.data;
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
}

function extractApiError(response: TabApiResponse | undefined): string | null {
  return response?.error?.message ?? null;
}

function formatMetric(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? value.toLocaleString("pl-PL")
      : value.toLocaleString("pl-PL", { maximumFractionDigits: 2 });
  }
  return String(value);
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TableDetailViewProps {
  code: string;
  catalog: CatalogCode;
  name: string;
  backUrl: string;
}

export function TableDetailView({ code, catalog, name, backUrl }: TableDetailViewProps) {
  const router = useRouter();
  const [yearFrom, setYearFrom] = useState(MIN_YEAR);
  const [yearTo, setYearTo] = useState(CURRENT_YEAR);
  const [activeTab, setActiveTab] = useState("");
  const [medicalFilter, setMedicalFilter] = useState("");

  // 1. Index query
  const indexQuery = useQuery({
    queryKey: ["index-of-tables", catalog, name],
    queryFn: () => fetchIndex(catalog, name),
  });

  const attrs = indexQuery.data?.data?.attributes;

  // 2. All product years (descending)
  const productYears = useMemo(
    () => (attrs?.years ?? []).map((y) => y.year).sort((a, b) => b - a),
    [attrs],
  );

  // 3. Filtered product years within [yearFrom, yearTo]
  const filteredYears = useMemo(
    () => productYears.filter((y) => y >= yearFrom && y <= yearTo),
    [productYears, yearFrom, yearTo],
  );

  const isDefaultRange = yearFrom === MIN_YEAR && yearTo === CURRENT_YEAR;
  const effectiveYear = filteredYears[0] ?? null; // most recent within range

  // 4. UUID map for effective year
  const uuidMap = useMemo<Record<string, string>>(() => {
    const yearEntry = attrs?.years?.find((y) => y.year === effectiveYear);
    return Object.fromEntries(
      ((yearEntry?.tables ?? []) as StatisticalTable[])
        .filter((t) => t.type === "general-data" || t.type in BREAKDOWN_TABS)
        .map((t) => [t.type, t.id]),
    );
  }, [attrs, effectiveYear]);

  // 5. Available breakdown tabs in order
  const breakdownTypes = useMemo(
    () => BREAKDOWN_ORDER.filter((t) => t in uuidMap),
    [uuidMap],
  );

  const effectiveTab = breakdownTypes.includes(activeTab)
    ? activeTab
    : (breakdownTypes[0] ?? "");

  // 6. Parallel queries for all tabs
  const generalQuery = useQuery({
    queryKey: ["basic-data", uuidMap["general-data"]],
    queryFn: () => fetchTabData("/api/nfz/basic-data", uuidMap["general-data"]),
    enabled: !!uuidMap["general-data"],
  });
  const genderQuery = useQuery({
    queryKey: ["by-gender", uuidMap["hospitalization-by-gender"]],
    queryFn: () => fetchTabData(BREAKDOWN_TABS["hospitalization-by-gender"].apiPath, uuidMap["hospitalization-by-gender"]),
    enabled: !!uuidMap["hospitalization-by-gender"],
  });
  const ageQuery = useQuery({
    queryKey: ["by-age", uuidMap["hospitalization-by-age"]],
    queryFn: () => fetchTabData(BREAKDOWN_TABS["hospitalization-by-age"].apiPath, uuidMap["hospitalization-by-age"]),
    enabled: !!uuidMap["hospitalization-by-age"],
  });
  const admissionQuery = useQuery({
    queryKey: ["by-admission", uuidMap["hospitalization-by-admission"]],
    queryFn: () => fetchTabData(BREAKDOWN_TABS["hospitalization-by-admission"].apiPath, uuidMap["hospitalization-by-admission"]),
    enabled: !!uuidMap["hospitalization-by-admission"],
  });
  const dischargeQuery = useQuery({
    queryKey: ["by-discharge", uuidMap["hospitalization-by-discharge"]],
    queryFn: () => fetchTabData(BREAKDOWN_TABS["hospitalization-by-discharge"].apiPath, uuidMap["hospitalization-by-discharge"]),
    enabled: !!uuidMap["hospitalization-by-discharge"],
  });
  const serviceQuery = useQuery({
    queryKey: ["by-service", uuidMap["hospitalization-by-service"]],
    queryFn: () => fetchTabData(BREAKDOWN_TABS["hospitalization-by-service"].apiPath, uuidMap["hospitalization-by-service"]),
    enabled: !!uuidMap["hospitalization-by-service"],
  });
  const icd10Query = useQuery({
    queryKey: ["icd10", uuidMap["icd-10-diseases"]],
    queryFn: () => fetchTabData(BREAKDOWN_TABS["icd-10-diseases"].apiPath, uuidMap["icd-10-diseases"]),
    enabled: !!uuidMap["icd-10-diseases"],
  });
  const icd9Query = useQuery({
    queryKey: ["icd9", uuidMap["icd-9-procedures"]],
    queryFn: () => fetchTabData(BREAKDOWN_TABS["icd-9-procedures"].apiPath, uuidMap["icd-9-procedures"]),
    enabled: !!uuidMap["icd-9-procedures"],
  });

  const queryByType: Record<string, typeof generalQuery> = {
    "hospitalization-by-gender": genderQuery,
    "hospitalization-by-age": ageQuery,
    "hospitalization-by-admission": admissionQuery,
    "hospitalization-by-discharge": dischargeQuery,
    "hospitalization-by-service": serviceQuery,
    "icd-10-diseases": icd10Query,
    "icd-9-procedures": icd9Query,
  };

  // Active tab data
  const activeQuery = queryByType[effectiveTab];
  const activeRows = extractRows(activeQuery?.data as TabApiResponse | undefined);
  const activeConfig = BREAKDOWN_TABS[effectiveTab];
  const activeIsMedical = effectiveTab === "icd-10-diseases" || effectiveTab === "icd-9-procedures";
  const filteredActiveRows = useMemo(() => {
    const filter = medicalFilter.trim().toLowerCase();
    if (!filter || !activeIsMedical) return activeRows;
    return activeRows.filter((row) =>
      Object.entries(row).some(([key, value]) => {
        if (!key.includes("code") && !key.includes("name")) return false;
        return String(value ?? "").toLowerCase().includes(filter);
      }),
    );
  }, [activeRows, activeIsMedical, medicalFilter]);
  const activeIsLoading = activeQuery?.isPending ?? false;
  const activeError = activeQuery?.isError
    ? (activeQuery.error instanceof Error ? activeQuery.error.message : "Błąd połączenia z API.")
    : extractApiError(activeQuery?.data as TabApiResponse | undefined);

  // Overview row
  const overviewRows = extractRows(generalQuery.data as TabApiResponse | undefined);
  const overviewRow = overviewRows[0];

  const productName = attrs?.["product-name"] ?? name;
  const productCode = attrs?.["product-code"] ?? code;
  const catalogName = CATALOG_LABELS[catalog] ?? catalog;

  // Export data (current tab or overview)
  const exportRows = filteredActiveRows.length > 0 ? filteredActiveRows : (breakdownTypes.length ? [] : overviewRow ? [overviewRow] : []);
  const exportColumns = filteredActiveRows.length > 0
    ? (activeConfig?.columns ?? [])
    : OVERVIEW_COLUMNS.filter((c) => overviewRow?.[c] !== null && overviewRow?.[c] !== undefined);
  const exportView = filteredActiveRows.length > 0 ? (activeConfig?.label ?? "Dane") : "Dane ogólne";
  const exportFilename = `${productCode}_${exportView}_${effectiveYear ?? "all"}`.replace(/[^\w\-_.]/g, "_");
  const exportMetadata = {
    source: "Narodowy Fundusz Zdrowia - api.nfz.gov.pl/app-stat-api-jgp",
    productName,
    catalog: catalogName,
    year: effectiveYear,
    view: exportView,
    dataType: exportView,
    tableId: uuidMap[effectiveTab] ?? uuidMap["general-data"] ?? null,
    filters: {
      "Od roku / From year": yearFrom,
      "Do roku / To year": yearTo,
      "Wybrany rok / Selected year": effectiveYear,
      "Filtr medyczny / Medical filter": medicalFilter || null,
    },
    recordCount: exportRows.length,
    scope: "Aktualnie widoczne dane / Currently visible data",
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (indexQuery.isPending) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-7 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-1/3 rounded bg-slate-100" />
        <div className="h-20 rounded bg-slate-100" />
        <div className="h-64 rounded bg-slate-100" />
      </div>
    );
  }

  if (indexQuery.isError || indexQuery.data?.error) {
    const msg =
      indexQuery.data?.error?.message ??
      (indexQuery.error instanceof Error ? indexQuery.error.message : "Nieznany błąd połączenia z API.");
    return (
      <div className="py-8 px-4 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
        <p className="font-medium mb-1">Nie udało się pobrać indeksu tabel</p>
        <p className="text-xs text-red-600">{msg}</p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Back to results */}
      <button
        onClick={() => (backUrl ? router.push(backUrl) : router.back())}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors min-h-[44px] -ml-1 pr-2"
      >
        <ChevronLeft size={14} />
        Wróć do wyników / Back to results
      </button>

      {/* ── Product header ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-800 leading-snug">{productName}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            <span className="font-mono text-slate-600">{productCode}</span>
            {" · "}
            {catalogName}
          </p>
        </div>

        {/* Export — visible as soon as any data loads */}
        <ExportButton
          rows={exportRows}
          columns={exportColumns}
          filename={exportFilename}
          metadata={exportMetadata}
          disabled={exportRows.length === 0}
        />
      </div>

      {/* ── Year range filter ─────────────────────────────────────────────── */}
      {productYears.length > 0 && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
              <label className="text-xs font-medium text-slate-600">
                Od roku / From year
              </label>
              <Select
                value={String(yearFrom)}
                onValueChange={(value) => {
                  if (!value) return;
                  const nextYear = Number(value);
                  setYearFrom(nextYear);
                  if (nextYear > yearTo) setYearTo(nextYear);
                }}
              >
                <SelectTrigger className="min-h-[44px] w-full rounded-md border-slate-300 bg-white text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {ALL_YEARS.filter((year) => year <= yearTo).map((year) => (
                    <SelectItem key={year} value={String(year)} className="min-h-[44px]">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
              <label className="text-xs font-medium text-slate-600">
                Do roku / To year
              </label>
              <Select
                value={String(yearTo)}
                onValueChange={(value) => {
                  if (!value) return;
                  const nextYear = Number(value);
                  setYearTo(nextYear);
                  if (nextYear < yearFrom) setYearFrom(nextYear);
                }}
              >
                <SelectTrigger className="min-h-[44px] w-full rounded-md border-slate-300 bg-white text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {ALL_YEARS.filter((year) => year >= yearFrom).map((year) => (
                    <SelectItem key={year} value={String(year)} className="min-h-[44px]">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={() => {
                setYearFrom(MIN_YEAR);
                setYearTo(CURRENT_YEAR);
              }}
              disabled={isDefaultRange}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
            >
              <RotateCcw size={14} aria-hidden />
              Reset / Reset
            </button>
          </div>

          {yearFrom > yearTo && (
            <p className="mt-2 text-xs text-red-600">
              Rok początkowy nie może być większy niż rok końcowy / The start year cannot be greater than the end year
            </p>
          )}

          <p className="mt-2 text-xs text-slate-500">
            {filteredYears.length > 0
              ? `Dane z roku ${effectiveYear} (${filteredYears.length} ${filteredYears.length === 1 ? "rok" : filteredYears.length < 5 ? "lata" : "lat"} w zakresie)`
              : "Brak danych w wybranym zakresie"}
          </p>
        </div>
      )}

      {/* ── Overview strip — always visible ───────────────────────────────── */}
      <OverviewStrip row={overviewRow} isLoading={generalQuery.isPending} />

      {/* ── No data for this year range ────────────────────────────────────── */}
      {filteredYears.length === 0 && productYears.length > 0 && (
        <div className="py-8 text-center text-sm text-slate-400">
          Brak danych w wybranym zakresie lat. Zmień filtry lub kliknij Reset.
        </div>
      )}

      {/* ── Breakdown tabs ─────────────────────────────────────────────────── */}
      {breakdownTypes.length > 0 && (
        <div className="space-y-4">
          {/* Tab buttons — flex-wrap, min-h for touch */}
          <div className="flex flex-wrap gap-1 border-b border-slate-200">
            {breakdownTypes.map((type) => {
              const q = queryByType[type];
              const count =
                !q?.isPending && !q?.isError && q?.data
                  ? extractRows(q.data as TabApiResponse | undefined).length
                  : null;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setActiveTab(type);
                    setMedicalFilter("");
                  }}
                  className={[
                    "min-h-[44px] px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors",
                    effectiveTab === type
                      ? "border-slate-800 text-slate-800 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
                  ].join(" ")}
                >
                  {BREAKDOWN_TABS[type].label}
                  {count !== null && (
                    <span className="ml-1.5 text-xs text-slate-400 font-normal">
                      ({count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content — single DataGrid, no layout shift */}
          <div className="overflow-x-auto">
            {activeIsMedical && activeRows.length > 0 && (
              <div className="relative mb-3 max-w-xl">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                  aria-hidden
                />
                <Input
                  value={medicalFilter}
                  onChange={(event) => setMedicalFilter(event.target.value)}
                  placeholder={
                    effectiveTab === "icd-10-diseases"
                      ? "Filtruj po kodzie lub nazwie ICD-10"
                      : "Filtruj po kodzie lub nazwie ICD-9"
                  }
                  className="min-h-[44px] border-slate-300 bg-white pl-9 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
                />
              </div>
            )}
            <DataGrid
              columns={activeConfig?.columns ?? []}
              rows={filteredActiveRows}
              isLoading={activeIsLoading}
              error={activeError}
              emptyMessage="Brak danych dla wybranego okresu."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Overview strip ───────────────────────────────────────────────────────────

const KEY_METRICS: Array<{ key: string; unit?: string }> = [
  { key: "number-of-hospitalizations" },
  { key: "number-of-patients" },
  { key: "duration-of-hospitalization-mediana", unit: "dni" },
  { key: "ratio-of-rehospitalizations" },
  { key: "average-value-of-hospitalization", unit: "zł" },
];

function OverviewStrip({
  row,
  isLoading,
}: {
  row: Record<string, unknown> | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-3 animate-pulse" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-md bg-slate-100" />
        ))}
      </div>
    );
  }
  if (!row) return null;

  const visible = KEY_METRICS.filter(
    ({ key }) => row[key] !== null && row[key] !== undefined,
  );
  if (!visible.length) return null;

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
    >
      {visible.map(({ key, unit }) => (
        <div key={key} className="rounded-md border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500 leading-tight mb-1">{fieldLabel(key)}</p>
          <p className="text-xl font-semibold text-slate-800 font-mono tabular-nums">
            {formatMetric(row[key])}
            {unit && (
              <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
