import { NextRequest, NextResponse } from "next/server";
import { buildCsv, buildXlsx, type ExportMetadata } from "@/lib/export-service";

interface ExportBody {
  data: Record<string, unknown>[];
  columns: string[];
  format: "csv" | "xlsx";
  filename: string;
  metadata: ExportMetadata;
}

export async function POST(req: NextRequest) {
  let body: ExportBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie." }, { status: 400 });
  }

  const { data, columns, format, filename, metadata } = body;

  if (!Array.isArray(data) || !Array.isArray(columns)) {
    return NextResponse.json({ error: "Brak danych do eksportu." }, { status: 400 });
  }

  const safeFilename = filename.replace(/[^\w\-_.]/g, "_");

  if (format === "csv") {
    const csv = buildCsv(data, columns, metadata);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}.csv"`,
      },
    });
  }

  if (format === "xlsx") {
    const buf = buildXlsx(data, columns, metadata);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${safeFilename}.xlsx"`,
      },
    });
  }

  return NextResponse.json(
    { error: `Nieobsługiwany format: ${format}` },
    { status: 400 },
  );
}
