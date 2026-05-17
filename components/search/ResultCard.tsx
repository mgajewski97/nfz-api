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
      <mark className="rounded-md bg-[hsl(42_95%_88%)] px-1 text-[hsl(35_58%_28%)]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const CATALOG_COLORS: Record<string, string> = {
  "1a": "catalog-1a",
  "1b": "catalog-1b",
  "1c": "catalog-1c",
  "1d": "catalog-1d",
  "1w": "catalog-1w",
};

export function ResultCard({ result, query, backUrl }: ResultCardProps) {
  const catalogColor =
    CATALOG_COLORS[result.catalog] ?? "soft-chip";

  const detailHref =
    `/table/${encodeURIComponent(result.code)}` +
    `?catalog=${result.catalog}` +
    `&name=${encodeURIComponent(result.name)}` +
    (backUrl ? `&from=${backUrl}` : "");

  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/90 bg-card/90 px-4 py-4 shadow-pearl transition-all hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-pearl-lg sm:flex-row sm:items-start sm:justify-between">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-holo opacity-70" aria-hidden />
      <div className="pointer-events-none absolute right-4 top-4 h-2 w-2 rounded-full bg-holo-3/70 opacity-0 shadow-[0_0_18px_hsl(var(--holo-3)/0.8)] transition-opacity group-hover:opacity-100" aria-hidden />
      {/* Left: name + meta */}
      <div className="min-w-0 flex-1 pl-1">
        <p className="mb-2 text-sm font-semibold leading-snug text-foreground">
          <Highlighted text={result.name} query={query} />
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">{result.code}</span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <Badge
            variant="outline"
            className={`h-auto min-h-5 px-2 py-0.5 text-xs font-normal ${catalogColor}`}
          >
            {result.catalog} — {result.catalogLabel}
          </Badge>
        </div>
        {result.tableSummary && (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>
                Tabele:{" "}
                <span className="font-medium text-foreground">
                  {result.tableSummary.tableCount}
                </span>
              </span>
              {result.tableSummary.latestYear && (
                <span>
                  Najnowszy rok:{" "}
                  <span className="font-medium text-foreground">
                    {result.tableSummary.latestYear}
                  </span>
                </span>
              )}
              {result.tableSummary.years.length > 0 && (
                <span>
                  Zakres:{" "}
                  <span className="font-medium text-foreground">
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
                    className="soft-chip px-2 py-1 text-xs"
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
        className="flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-secondary/70 px-3 text-xs font-semibold text-secondary-foreground transition-all hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:justify-start"
      >
        {result.tableSummary ? "Zobacz tabele" : "Zobacz dane"}
        <ArrowRight size={12} aria-hidden />
      </Link>
    </div>
  );
}
