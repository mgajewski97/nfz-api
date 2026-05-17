import { NextRequest, NextResponse } from "next/server";
import {
  exportToCsv,
  exportToXlsx,
  safeExportFilename,
  type ExportColumnInput,
  type ExportMetadata,
} from "@/lib/export-service";

interface ExportBody {
  data?: Record<string, unknown>[];
  columns?: ExportColumnInput[];
  format?: "csv" | "xlsx";
  filename?: string;
  metadata?: ExportMetadata;
}

const CONTENT_TYPES = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

export async function POST(req: NextRequest) {
  let body: ExportBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowe żądanie eksportu." },
      { status: 400 },
    );
  }

  const { data, columns, format, filename, metadata = {} } = body;

  if (!Array.isArray(data)) {
    return NextResponse.json(
      { error: "Brak danych do eksportu" },
      { status: 400 },
    );
  }

  if (!Array.isArray(columns)) {
    return NextResponse.json(
      { error: "Nieprawidłowa lista kolumn eksportu." },
      { status: 400 },
    );
  }

  if (format !== "csv" && format !== "xlsx") {
    return NextResponse.json(
      { error: "Nieobsługiwany format eksportu." },
      { status: 400 },
    );
  }

  try {
    const baseFilename = safeExportFilename(
      filename ?? metadata.filename,
      "nfz-export",
    );
    const enrichedMetadata: ExportMetadata = {
      ...metadata,
      recordCount: metadata.recordCount ?? data.length,
      scope: metadata.scope ?? "Aktualnie widoczne dane",
    };
    const blob =
      format === "csv"
        ? exportToCsv(data, columns, baseFilename, enrichedMetadata)
        : exportToXlsx(data, columns, baseFilename, enrichedMetadata);

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Disposition": `attachment; filename="${baseFilename}.${format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Export API] Failed to generate file:", error);
    return NextResponse.json(
      { error: "Eksport nie powiódł się" },
      { status: 500 },
    );
  }
}
