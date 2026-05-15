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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Eksport nie powiódł się. Spróbuj ponownie.");
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
        className="flex items-center gap-1.5 min-h-[44px] px-4 rounded-md border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        <span>{loading ? "Generuję…" : "Eksportuj"}</span>
        <ChevronDown size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[140px] rounded-md border border-slate-200 bg-white shadow-md py-1">
          <button
            onClick={() => doExport("csv")}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          >
            CSV
            <span className="block text-xs text-slate-400 font-normal">
              Do Excela, Google Sheets
            </span>
          </button>
          <button
            onClick={() => doExport("xlsx")}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          >
            XLSX
            <span className="block text-xs text-slate-400 font-normal">
              Z arkuszem metadanych
            </span>
          </button>
        </div>
      )}

      {/* Error message — always visible, not hover-only */}
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 whitespace-nowrap z-30">
          {error}
        </p>
      )}
    </div>
  );
}
