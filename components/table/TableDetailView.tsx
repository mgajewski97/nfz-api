"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChevronLeft, RotateCcw } from "lucide-react";
import { DataGrid } from "./DataGrid";
import { ExportButton } from "@/components/export/ExportButton";
import { CATALOG_LABELS, fieldLabel } from "@/lib/data-mappers";
import type { CatalogCode } from "@/types/nfz";
import type { ApiResponse } from "@/lib/api-response";
import type { IndexOfTables, StatisticalTable } from "@/types/nfz";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2015;

const ALL_YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i, // descending
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

  const queryByType: Record<string, typeof generalQuery> = {
    "hospitalization-by-gender": genderQuery,
    "hospitalization-by-age": ageQuery,
    "hospitalization-by-admission": admissionQuery,
    "hospitalization-by-discharge": dischargeQuery,
    "hospitalization-by-service": serviceQuery,
  };

  // Active tab data
  const activeQuery = queryByType[effectiveTab];
  const activeRows = extractRows(activeQuery?.data as TabApiResponse | undefined);
  const activeConfig = BREAKDOWN_TABS[effectiveTab];
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
  const exportRows = activeRows.length > 0 ? activeRows : (overviewRow ? [overviewRow] : []);
  const exportColumns = activeRows.length > 0
    ? (activeConfig?.columns ?? [])
    : OVERVIEW_COLUMNS.filter((c) => overviewRow?.[c] !== null && overviewRow?.[c] !== undefined);
  const exportView = activeRows.length > 0 ? (activeConfig?.label ?? "Dane") : "Dane ogólne";
  const exportFilename = `${productCode}_${exportView}_${effectiveYear ?? "all"}`.replace(/[^\w\-_.]/g, "_");

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
        Wróć do wyników
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
          metadata={{ productName, catalog: catalogName, year: effectiveYear, view: exportView }}
          disabled={exportRows.length === 0}
        />
      </div>

      {/* ── Year range filter ─────────────────────────────────────────────── */}
      {productYears.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-md border border-slate-200 bg-slate-50">
          <span className="text-xs font-medium text-slate-600 shrink-0">Zakres lat:</span>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-500 shrink-0">Od</label>
            <select
              value={yearFrom}
              onChange={(e) => {
                const v = Number(e.target.value);
                setYearFrom(v);
                if (v > yearTo) setYearTo(v);
              }}
              className="min-h-[44px] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {ALL_YEARS.filter((y) => y <= yearTo).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <label className="text-xs text-slate-500 shrink-0">Do</label>
            <select
              value={yearTo}
              onChange={(e) => {
                const v = Number(e.target.value);
                setYearTo(v);
                if (v < yearFrom) setYearFrom(v);
              }}
              className="min-h-[44px] rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {ALL_YEARS.filter((y) => y >= yearFrom).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {!isDefaultRange && (
              <button
                onClick={() => { setYearFrom(MIN_YEAR); setYearTo(CURRENT_YEAR); }}
                className="flex items-center gap-1 min-h-[44px] px-3 rounded-md border border-slate-300 bg-white text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>

          <span className="text-xs text-slate-400">
            {filteredYears.length > 0
              ? `Dane z roku ${effectiveYear} (${filteredYears.length} ${filteredYears.length === 1 ? "rok" : filteredYears.length < 5 ? "lata" : "lat"} w zakresie)`
              : "Brak danych w wybranym zakresie"}
          </span>
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
                  onClick={() => setActiveTab(type)}
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
            <DataGrid
              columns={activeConfig?.columns ?? []}
              rows={activeRows}
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
