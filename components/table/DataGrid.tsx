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
      <div className="h-9 rounded-xl skeleton-soft" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl skeleton-soft" />
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
      <div className="soft-error px-4 py-6 text-sm">
        <p className="font-medium mb-1">Nie udało się pobrać danych</p>
        <p className="text-destructive/80 text-xs">{error}</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="section-panel py-10 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "Brak danych dla wybranego okresu."}
      </div>
    );
  }

  const visibleColumns = columns.filter((col) =>
    rows.some((row) => row[col] !== null && row[col] !== undefined),
  );

  return (
    <Table className="overflow-hidden rounded-2xl bg-card/80">
      <TableHeader>
        <TableRow className="bg-muted/70 hover:bg-muted/70">
          {visibleColumns.map((col) => (
            <TableHead key={col} className="min-w-[120px] whitespace-normal py-3 text-xs font-semibold leading-tight text-foreground">
              {fieldLabel(col)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {visibleColumns.map((col) => (
              <TableCell key={col} className="font-mono text-sm tabular-nums text-foreground/80">
                {formatValue(row[col])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
