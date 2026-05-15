"use client";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { fieldLabel } from "@/lib/data-mappers";

interface DataGridProps {
  columns: string[];
  rows: Record<string, unknown>[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LoadingSkeleton({ cols }: { cols: number }) {
  return (
    <div className="space-y-1 animate-pulse">
      <div className="h-9 rounded bg-slate-100" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-slate-50" />
      ))}
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toLocaleString("pl-PL");
    return value.toLocaleString("pl-PL", { maximumFractionDigits: 2 });
  }
  return String(value);
}

export function DataGrid({ columns, rows, isLoading, error, emptyMessage }: DataGridProps) {
  if (isLoading) return <LoadingSkeleton cols={columns.length} />;

  if (error) {
    return (
      <div className="py-6 px-4 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
        <p className="font-medium mb-1">Nie udało się pobrać danych</p>
        <p className="text-red-600 text-xs">{error}</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        {emptyMessage ?? "Brak danych dla wybranego okresu."}
      </div>
    );
  }

  const visibleColumns = columns.filter((col) =>
    rows.some((row) => row[col] !== null && row[col] !== undefined),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          {visibleColumns.map((col) => (
            <TableHead key={col} className="text-xs font-semibold text-slate-600 whitespace-normal leading-tight py-2 min-w-[120px]">
              {fieldLabel(col)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {visibleColumns.map((col) => (
              <TableCell key={col} className="text-sm text-slate-700 font-mono tabular-nums">
                {formatValue(row[col])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
