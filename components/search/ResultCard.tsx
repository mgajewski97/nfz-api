import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/app/api/nfz/search/route";

interface ResultCardProps {
  result: SearchResult;
  query: string;
  /** Encoded URL to return to (passed as ?from= on the detail page) */
  backUrl?: string;
}

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const idx = text.toUpperCase().indexOf(query.toUpperCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-amber-900 rounded-sm px-px">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const CATALOG_COLORS: Record<string, string> = {
  "1a": "bg-blue-50 text-blue-700 border-blue-200",
  "1b": "bg-purple-50 text-purple-700 border-purple-200",
  "1c": "bg-teal-50 text-teal-700 border-teal-200",
  "1d": "bg-orange-50 text-orange-700 border-orange-200",
  "1w": "bg-rose-50 text-rose-700 border-rose-200",
};

export function ResultCard({ result, query, backUrl }: ResultCardProps) {
  const catalogColor =
    CATALOG_COLORS[result.catalog] ?? "bg-slate-50 text-slate-600 border-slate-200";

  const detailHref =
    `/table/${encodeURIComponent(result.code)}` +
    `?catalog=${result.catalog}` +
    `&name=${encodeURIComponent(result.name)}` +
    (backUrl ? `&from=${backUrl}` : "");

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-slate-200 bg-white px-4 py-3 hover:border-slate-400 transition-colors">
      {/* Left: name + meta */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 leading-snug mb-1.5">
          <Highlighted text={result.name} query={query} />
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-400">{result.code}</span>
          <span className="h-3 w-px bg-slate-200" aria-hidden />
          <Badge
            variant="outline"
            className={`text-xs font-normal px-1.5 py-0 border ${catalogColor}`}
          >
            {result.catalog} — {result.catalogLabel}
          </Badge>
        </div>
        {result.tableSummary && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span>
                Tabele:{" "}
                <span className="font-medium text-slate-700">
                  {result.tableSummary.tableCount}
                </span>
              </span>
              {result.tableSummary.latestYear && (
                <span>
                  Najnowszy rok:{" "}
                  <span className="font-medium text-slate-700">
                    {result.tableSummary.latestYear}
                  </span>
                </span>
              )}
              {result.tableSummary.years.length > 0 && (
                <span>
                  Zakres:{" "}
                  <span className="font-medium text-slate-700">
                    {Math.min(...result.tableSummary.years)}-
                    {Math.max(...result.tableSummary.years)}
                  </span>
                </span>
              )}
            </div>
            {result.tableSummary.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.tableSummary.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: link — always visible, min touch target */}
      <Link
        href={detailHref}
        className="shrink-0 flex items-center gap-1.5 min-h-[44px] px-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap"
      >
        {result.tableSummary ? "Zobacz tabele" : "Zobacz dane"}
        <ArrowRight size={12} aria-hidden />
      </Link>
    </div>
  );
}
