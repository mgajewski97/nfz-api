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
    <div className="relative" ref={menuRef}>
      {/* Main button */}
      <button
        disabled={isDisabled}
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="true"
        aria-expanded={open}
        title={!rows.length ? "Brak danych do eksportu / No data to export" : undefined}
        className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
        <div className="absolute right-0 top-full mt-1 z-30 min-w-40 rounded-md border border-slate-200 bg-white py-1 shadow-md">
          <button
            onClick={() => doExport("csv")}
            className="min-h-[44px] w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          >
            Eksportuj CSV / Export CSV
            <span className="block text-xs text-slate-400 font-normal">
              Do Excela, Google Sheets
            </span>
          </button>
          <button
            onClick={() => doExport("xlsx")}
            className="min-h-[44px] w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          >
            Eksportuj XLSX / Export XLSX
            <span className="block text-xs text-slate-400 font-normal">
              Z arkuszem metadanych
            </span>
          </button>
        </div>
      )}

      {/* Error message — always visible, not hover-only */}
      {error && (
        <p className="absolute top-full left-0 z-30 mt-1 max-w-xs rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
