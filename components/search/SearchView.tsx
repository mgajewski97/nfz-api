"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SearchX, Sparkles, X } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { ResultCard } from "./ResultCard";
import { AiSearch, type AiSearchResult } from "./AiSearch";
import type { SearchResult, SearchMeta } from "@/app/api/nfz/search/route";
import type { ApiResponse } from "@/lib/api-response";

// ─── View modes ───────────────────────────────────────────────────────────────

export type SearchMode = "default" | "tables" | "icd";

// ─── Data fetching ────────────────────────────────────────────────────────────

type SearchResponse = ApiResponse<SearchResult[]> & { meta: SearchMeta | null };

async function searchBenefits(
  q: string,
  catalog: string,
  mode: SearchMode,
  section: string,
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (catalog && catalog !== "all") params.set("catalog", catalog);
  if (section && section !== "all") params.set("section", section);
  if (mode === "tables") params.set("view", "tables");
  if (mode === "icd") params.set("type", "icd");
  const { data } = await axios.get<SearchResponse>(`/api/nfz/search?${params}`);
  return data;
}

async function fetchSections(): Promise<string[]> {
  const { data } = await axios.get<ApiResponse<string[]>>("/api/nfz/sections?limit=25");
  return data.data ?? [];
}

// ─── States ───────────────────────────────────────────────────────────────────

function EmptyState({ query, mode }: { query: string; mode: SearchMode }) {
  return (
    <div className="py-12 text-center">
      <span
        className="sparkle mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary"
        aria-hidden
      >
        <SearchX size={20} />
      </span>
      {mode === "tables" ? (
        <>
          <p className="text-foreground text-sm">
            Brak tabel dla wybranego katalogu i sekcji.
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Wybierz inną sekcję albo katalog świadczeń.
          </p>
        </>
      ) : (
        <>
          <p className="text-foreground text-sm">
            Brak wyników dla{" "}
            <span className="font-medium text-primary">&ldquo;{query}&rdquo;</span>.
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Spróbuj kodu JGP (np.&nbsp;E61, A01) lub skróconej nazwy bez polskich znaków.
          </p>
        </>
      )}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="soft-error px-4 py-8 text-sm">
      <p className="font-medium mb-1">Nie udało się pobrać danych</p>
      <p className="text-destructive/80 text-xs">{message}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl skeleton-soft" />
      ))}
    </div>
  );
}

function SearchHint({ mode }: { mode: SearchMode }) {
  if (mode === "tables") {
    return (
      <div className="py-10 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Wybierz katalog i sekcję, aby przeglądać świadczenia z dostępnymi tabelami statystycznymi NFZ.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {["1a", "1b", "1c", "1d", "1w"].map((hint) => (
            <span key={hint} className="soft-chip px-2.5 py-1 font-mono">
              {hint}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (mode === "icd") {
    return (
      <div className="py-10 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          Wyszukaj świadczenie, a potem filtruj jego rozpoznania ICD-10 i procedury ICD-9 w widoku danych.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          {["I25", "I21", "J18", "K35", "C34", "M16"].map((hint) => (
            <span key={hint} className="soft-chip px-2.5 py-1 font-mono">
              {hint}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="py-10 text-center">
      <span className="sparkle mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary" aria-hidden>
        <Sparkles size={17} />
      </span>
      <p className="mb-4 text-sm text-muted-foreground">
        Wpisz minimum 2 znaki, aby wyszukać świadczenie lub grupę JGP.
      </p>
      <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        {["A01", "E61", "H01", "ZABI", "RYTM", "NOWO"].map((hint) => (
          <span key={hint} className="soft-chip px-2.5 py-1 font-mono">
            {hint}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface SearchViewProps {
  initialQuery: string;
  initialCatalog: string;
  initialSection?: string;
  initialAiResult?: AiSearchResult;
  mode?: SearchMode;
}

export function SearchView({
  initialQuery,
  initialCatalog,
  initialSection = "",
  initialAiResult,
  mode = "default",
}: SearchViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultQuery = mode === "tables" ? initialQuery || "" : initialQuery;
  const defaultCatalog = mode === "tables" ? initialCatalog || "1a" : initialCatalog || "all";

  const [query, setQuery] = useState(defaultQuery);
  const [catalog, setCatalog] = useState(defaultCatalog);
  const [section, setSection] = useState(initialSection || "all");

  const [committedQuery, setCommittedQuery] = useState(defaultQuery);
  const [committedCatalog, setCommittedCatalog] = useState(defaultCatalog);
  const [committedSection, setCommittedSection] = useState(initialSection || "all");

  const [aiResult, setAiResult] = useState<AiSearchResult | null>(
    initialAiResult ?? null,
  );

  const shouldFetch = mode === "tables" || committedQuery.trim().length >= 2;

  const sectionsQuery = useQuery({
    queryKey: ["sections"],
    queryFn: fetchSections,
    enabled: mode === "tables",
    staleTime: 30 * 60 * 1000,
  });

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["search", committedQuery, committedCatalog, committedSection, mode],
    queryFn: () =>
      searchBenefits(committedQuery, committedCatalog, mode, committedSection),
    enabled: shouldFetch,
    placeholderData: (prev) => prev,
  });

  // Commit filter values, push to URL and trigger the search query.
  const runSearch = useCallback(
    (q: string, cat: string, sec: string) => {
      setCommittedQuery(q);
      setCommittedCatalog(cat);
      setCommittedSection(sec);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("ai");
      if (mode === "tables") {
        params.set("view", "tables");
        params.delete("type");
        params.delete("q");
      } else if (mode === "icd") {
        params.set("type", "icd");
        params.delete("view");
        if (q) params.set("q", q);
        else params.delete("q");
      } else {
        params.delete("view");
        params.delete("type");
        if (q) params.set("q", q);
        else params.delete("q");
      }
      if (cat && cat !== "all") params.set("catalog", cat);
      else params.delete("catalog");
      if (sec && sec !== "all") params.set("section", sec);
      else params.delete("section");
      router.push(`/search?${params}`, { scroll: false });
    },
    [mode, router, searchParams],
  );

  const handleSubmit = useCallback(() => {
    const q = query.trim();
    if (mode !== "tables" && q.length < 2) return;
    runSearch(q, catalog, section);
  }, [query, catalog, section, mode, runSearch]);

  // Apply AI-resolved filters: fill the inputs and run the search.
  const handleAi = useCallback(
    (result: AiSearchResult) => {
      setQuery(result.query);
      setCatalog(result.catalog || "all");
      setSection(result.section || "all");
      setAiResult(result);
      runSearch(result.query, result.catalog || "all", result.section || "all");
    },
    [runSearch],
  );

  const results = data?.data ?? [];
  const meta = data?.meta as SearchMeta | null;
  const apiError = data?.error;
  const showEmpty = !isFetching && shouldFetch && !isError && !apiError && results.length === 0;
  const showResults = !isFetching && !isError && !apiError && results.length > 0;

  // Build the back URL to pass to result cards
  const backParams = new URLSearchParams();
  if (mode !== "tables" && committedQuery) backParams.set("q", committedQuery);
  if (committedCatalog !== "all") backParams.set("catalog", committedCatalog);
  if (committedSection !== "all") backParams.set("section", committedSection);
  if (mode === "tables") backParams.set("view", "tables");
  if (mode === "icd") backParams.set("type", "icd");
  const backUrl = encodeURIComponent(
    `/search${backParams.toString() ? `?${backParams}` : ""}`,
  );

  return (
    <div className="space-y-6">
      {/* Mode label */}
      {mode === "tables" && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">Tabele statystyczne</span>
          <span>Przeglądaj dostępne tabele statystyczne NFZ</span>
        </div>
      )}
      {mode === "icd" && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-accent px-2.5 py-1 font-medium text-accent-foreground">Dane medyczne</span>
          <span>Przeglądaj rozpoznania ICD-10 i procedury ICD-9</span>
        </div>
      )}

      {/* Search bar + AI assistant */}
      <div className="ambient-panel rounded-[1.5rem] p-3 sm:p-4">
        <SearchInput
          query={query}
          catalog={catalog}
          section={section}
          sections={sectionsQuery.data ?? []}
          onQueryChange={setQuery}
          onCatalogChange={(c) => setCatalog(c || "all")}
          onSectionChange={(s) => setSection(s || "all")}
          onSubmit={handleSubmit}
          isLoading={isFetching}
          mode={mode}
        />
        <div className="mt-3 border-t border-[rgba(167,139,250,0.18)] pt-3">
          <AiSearch onApply={handleAi} />
        </div>
      </div>

      {/* AI interpretation banner */}
      {aiResult && (
        <div className="surface-card holo-border flex flex-wrap items-start gap-3 rounded-2xl px-4 py-3">
          <span
            className="sparkle flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"
            aria-hidden
          >
            <Sparkles size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-primary">AI znalazło:</span>{" "}
              {aiResult.explanation}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
              {aiResult.query && (
                <span className="soft-chip px-2 py-0.5 font-mono">
                  fraza: {aiResult.query}
                </span>
              )}
              <span className="soft-chip px-2 py-0.5">
                katalog: {aiResult.catalog}
              </span>
              {aiResult.section !== "all" && (
                <span className="soft-chip px-2 py-0.5">
                  sekcja: {aiResult.section}
                </span>
              )}
              <span className="soft-chip px-2 py-0.5">
                lata: {aiResult.yearFrom}–{aiResult.yearTo}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Możesz poprawić filtry powyżej i wyszukać ponownie.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAiResult(null)}
            aria-label="Zamknij podpowiedź AI"
            className="holo-focus flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Results summary */}
      {showResults && meta && (
        <div className="surface-card flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 text-xs text-muted-foreground">
          <span>
            Znaleziono{" "}
            <span className="font-medium text-foreground">{meta.total}</span>{" "}
            {mode === "tables" ? "pozycji z tabelami" : "wyników dla "}
            {mode !== "tables" && (
              <span className="font-medium text-primary">&ldquo;{meta.query}&rdquo;</span>
            )}
            {meta.catalogs.length < 5 && (
              <> w katalogu <span className="font-mono">{meta.catalogs.join(", ")}</span></>
            )}
          </span>
          {isFetching && <span className="text-muted-foreground">Aktualizuję…</span>}
        </div>
      )}

      {/* States */}
      {!shouldFetch && <SearchHint mode={mode} />}
      {isFetching && !data && <LoadingSkeleton />}
      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : "Nieznany błąd połączenia z API."}
        />
      )}
      {apiError && <ErrorState message={apiError.message} />}
      {showEmpty && <EmptyState query={committedQuery} mode={mode} />}

      {/* Result list */}
      {showResults && (
        <ul className="space-y-2">
          {results.map((r) => (
            <li key={`${r.code}-${r.catalog}`}>
              <ResultCard result={r} query={committedQuery} backUrl={backUrl} />
            </li>
          ))}
        </ul>
      )}

      {/* Stale overlay while refetching */}
      {isFetching && data && (
        <div className="opacity-50 pointer-events-none space-y-2">
          {results.map((r) => (
            <ResultCard
              key={`ghost-${r.code}-${r.catalog}`}
              result={r}
              query={committedQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
