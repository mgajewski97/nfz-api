"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Loader2 } from "lucide-react";
import type { ExportMetadata } from "@/lib/export-service";

interface ExportButtonProps {
  rows: Record<string, unknown>[];
  columns: string[];
  filename: string;
  metadata: ExportMetadata;
  disabled?: boolean;
}

export function ExportButton({
  rows,
  columns,
  filename,
  metadata,
  disabled,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function doExport(format: "csv" | "xlsx") {
    setOpen(false);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: rows, columns, format, filename, metadata }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Eksport nie powiódł się / Export failed");
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = disabled || loading || !rows.length;

  return (
    <div className="relative z-20" ref={menuRef}>
      {/* Main button */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="true"
        aria-expanded={open}
        title={!rows.length ? "Brak danych do eksportu / No data to export" : undefined}
        className="flex min-h-[46px] items-center gap-1.5 rounded-xl border border-border bg-card/90 px-4 text-sm font-medium text-foreground shadow-pearl transition-all hover:border-ring/40 hover:bg-secondary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        <span>{loading ? "Generuję…" : "Eksportuj / Export"}</span>
        <ChevronDown size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-48 overflow-hidden rounded-2xl border border-border bg-popover/95 p-1 shadow-pearl-lg">
          <button
            type="button"
            onClick={() => doExport("csv")}
            className="min-h-[44px] w-full rounded-xl px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary/70 active:bg-secondary"
          >
            Eksportuj CSV / Export CSV
            <span className="block text-xs text-muted-foreground font-normal">
              Do Excela, Google Sheets
            </span>
          </button>
          <button
            type="button"
            onClick={() => doExport("xlsx")}
            className="min-h-[44px] w-full rounded-xl px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-secondary/70 active:bg-secondary"
          >
            Eksportuj XLSX / Export XLSX
            <span className="block text-xs text-muted-foreground font-normal">
              Z arkuszem metadanych
            </span>
          </button>
        </div>
      )}

      {/* Error message — always visible, not hover-only */}
      {error && (
        <p className="soft-error absolute left-0 top-full z-50 mt-2 max-w-xs px-2 py-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
