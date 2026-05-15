import * as XLSX from "xlsx";
import { fieldLabel } from "./data-mappers";

export interface ExportMetadata {
  productName: string;
  catalog: string;
  year: number | null;
  view: string;
}

// ─── Shared helper ────────────────────────────────────────────────────────────

function visibleColumns(rows: Record<string, unknown>[], columns: string[]): string[] {
  return columns.filter((col) =>
    rows.some((r) => r[col] !== null && r[col] !== undefined),
  );
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function buildCsv(
  rows: Record<string, unknown>[],
  columns: string[],
  meta: ExportMetadata,
): string {
  const SEP = ";";
  const BOM = "﻿";
  const now = new Date().toLocaleDateString("pl-PL");

  const metaBlock = [
    `# Źródło: Narodowy Fundusz Zdrowia — api.nfz.gov.pl/app-stat-api-jgp`,
    `# Produkt: ${meta.productName}`,
    `# Katalog: ${meta.catalog}`,
    `# Rok: ${meta.year ?? "—"}`,
    `# Widok: ${meta.view}`,
    `# Liczba rekordów: ${rows.length}`,
    `# Data eksportu: ${now}`,
    "",
  ].join("\n");

  const cols = visibleColumns(rows, columns);
  const header = cols.map(fieldLabel).join(SEP);

  const body = rows
    .map((row) =>
      cols
        .map((col) => {
          const v = row[col];
          if (v === null || v === undefined) return "";
          const s =
            typeof v === "number"
              ? String(v).replace(".", ",") // Polish decimal comma
              : String(v);
          return s.includes(SEP) || s.includes("\n") || s.includes('"')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        })
        .join(SEP),
    )
    .join("\n");

  return BOM + metaBlock + header + "\n" + body;
}

// ─── XLSX ─────────────────────────────────────────────────────────────────────

export function buildXlsx(
  rows: Record<string, unknown>[],
  columns: string[],
  meta: ExportMetadata,
): Buffer {
  const wb = XLSX.utils.book_new();
  const cols = visibleColumns(rows, columns);

  // Data sheet
  const headers = cols.map(fieldLabel);
  const dataRows = rows.map((row) =>
    cols.map((col) => {
      const v = row[col];
      return v === null || v === undefined ? "" : v;
    }),
  );
  const wsData = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  XLSX.utils.book_append_sheet(wb, wsData, "Dane");

  // Metadata sheet
  const wsMeta = XLSX.utils.aoa_to_sheet([
    ["Pole", "Wartość"],
    ["Źródło", "Narodowy Fundusz Zdrowia — api.nfz.gov.pl/app-stat-api-jgp"],
    ["Produkt", meta.productName],
    ["Katalog", meta.catalog],
    ["Rok", meta.year ?? "—"],
    ["Widok", meta.view],
    ["Liczba rekordów", rows.length],
    ["Data eksportu", new Date().toLocaleDateString("pl-PL")],
  ]);
  XLSX.utils.book_append_sheet(wb, wsMeta, "Metadane");

  return Buffer.from(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
}
