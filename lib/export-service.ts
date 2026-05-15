import * as XLSX from "xlsx";
import { fieldLabel } from "./data-mappers";

export interface ExportColumn {
  key: string;
  label?: string;
}

export type ExportColumnInput = string | ExportColumn;

export interface ExportMetadata {
  source?: string;
  generatedAt?: string;
  filters?: Record<string, unknown> | string | null;
  tableId?: string | null;
  dataType?: string | null;
  recordCount?: number;
  filename?: string;
  productName?: string;
  catalog?: string;
  year?: number | null;
  view?: string;
  scope?: string;
}

const DEFAULT_SOURCE = "Narodowy Fundusz Zdrowia - api.nfz.gov.pl/app-stat-api-jgp";
const CSV_SEPARATOR = ";";
const UTF8_BOM = "\uFEFF";

function normalizeColumns(
  rows: Record<string, unknown>[],
  columns: ExportColumnInput[],
): ExportColumn[] {
  const explicit = columns.map((column) =>
    typeof column === "string"
      ? { key: column, label: fieldLabel(column) }
      : { key: column.key, label: column.label ?? fieldLabel(column.key) },
  );
  const fallback = Object.keys(rows[0] ?? {}).map((key) => ({
    key,
    label: fieldLabel(key),
  }));
  const normalized = explicit.length ? explicit : fallback;

  return normalized.filter((column) =>
    rows.length === 0
      ? true
      : rows.some((row) => row[column.key] !== null && row[column.key] !== undefined),
  );
}

function stringifyMetadataValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function metadataEntries(
  rows: Record<string, unknown>[],
  metadata: ExportMetadata = {},
): Array<[string, string]> {
  const generatedAt = metadata.generatedAt ?? new Date().toISOString();
  return [
    ["Wygenerowano / Generated at", generatedAt],
    ["Źródło / Source", metadata.source ?? DEFAULT_SOURCE],
    ["Filtry / Filters", stringifyMetadataValue(metadata.filters)],
    ["Identyfikator tabeli / Table ID", stringifyMetadataValue(metadata.tableId)],
    ["Typ danych / Data type", stringifyMetadataValue(metadata.dataType ?? metadata.view)],
    ["Produkt / Product", stringifyMetadataValue(metadata.productName)],
    ["Katalog / Catalog", stringifyMetadataValue(metadata.catalog)],
    ["Rok / Year", stringifyMetadataValue(metadata.year)],
    ["Zakres eksportu / Export scope", stringifyMetadataValue(metadata.scope)],
    [
      "Liczba rekordów / Record count",
      String(metadata.recordCount ?? rows.length),
    ],
  ];
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = typeof value === "number" ? String(value).replace(".", ",") : String(value);
  const mustQuote =
    raw.includes(CSV_SEPARATOR) ||
    raw.includes(",") ||
    raw.includes('"') ||
    raw.includes("\n") ||
    raw.includes("\r");
  return mustQuote ? `"${raw.replace(/"/g, '""')}"` : raw;
}

function safeSheetName(name: string): string {
  return name.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Dane";
}

export function safeExportFilename(filename: string | undefined, fallback = "nfz-export"): string {
  const base = (filename || fallback)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || fallback;
}

export function buildCsv(
  data: Record<string, unknown>[],
  columns: ExportColumnInput[],
  metadata: ExportMetadata = {},
): string {
  const normalizedColumns = normalizeColumns(data, columns);
  const comments = metadataEntries(data, metadata)
    .map(([key, value]) => `# ${key}: ${value}`)
    .join("\n");
  const headers = normalizedColumns
    .map((column) => escapeCsvValue(column.label))
    .join(CSV_SEPARATOR);
  const body = data
    .map((row) =>
      normalizedColumns
        .map((column) => escapeCsvValue(row[column.key]))
        .join(CSV_SEPARATOR),
    )
    .join("\n");

  return [comments, headers, body].filter(Boolean).join("\n");
}

export function exportToCsv(
  data: Record<string, unknown>[],
  columns: ExportColumnInput[],
  _filename: string,
  metadata: ExportMetadata = {},
): Blob {
  return new Blob([UTF8_BOM, buildCsv(data, columns, metadata)], {
    type: "text/csv;charset=utf-8",
  });
}

export function exportToXlsx(
  data: Record<string, unknown>[],
  columns: ExportColumnInput[],
  _filename: string,
  metadata: ExportMetadata = {},
): Blob {
  const normalizedColumns = normalizeColumns(data, columns);
  const workbook = XLSX.utils.book_new();
  const headerRow = normalizedColumns.map((column) => column.label);
  const dataRows = data.map((row) =>
    normalizedColumns.map((column) => {
      const value = row[column.key];
      return value === null || value === undefined ? "" : value;
    }),
  );

  const dataSheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
  XLSX.utils.book_append_sheet(workbook, dataSheet, safeSheetName("Dane"));

  const metadataSheet = XLSX.utils.aoa_to_sheet([
    ["Pole", "Wartość"],
    ...metadataEntries(data, metadata),
  ]);
  XLSX.utils.book_append_sheet(workbook, metadataSheet, "Metadane");

  const workbookData = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  });

  return new Blob([workbookData], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
