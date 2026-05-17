"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import type { ExportMetadata } from "@/lib/export-service";

interface ExportButtonProps {
  rows: Record<string, unknown>[];
  columns: string[];
  filename: string;
  metadata: ExportMetadata;
  disabled?: boolean;
}

/**
 * One-click export — generates an Excel (.xlsx) file directly from the
 * currently visible data. No format menu, Polish-only labels.
 */
export function ExportButton({
  rows,
  columns,
  filename,
  metadata,
  disabled,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doExport() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: rows, columns, format: "xlsx", filename, metadata }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Nie udało się wygenerować pliku Excel. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = disabled || loading || !rows.length;

  return (
    <div className="relative z-20">
      <button
        type="button"
        disabled={isDisabled}
        onClick={doExport}
        title={!rows.length ? "Brak danych do eksportu" : undefined}
        className="btn-holo holo-focus flex min-h-[48px] items-center gap-2 rounded-xl px-5 text-sm font-semibold tracking-wide disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        <span>{loading ? "Generuję arkusz…" : "Eksportuj do Excela"}</span>
      </button>

      {/* Error message — always visible, not hover-only */}
      {error && (
        <p className="soft-error absolute left-0 top-full z-50 mt-2 max-w-xs px-3 py-1.5 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
