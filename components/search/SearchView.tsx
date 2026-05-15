"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SearchInput } from "./SearchInput";
import { ResultCard } from "./ResultCard";
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
  if (mode === "tables") {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500 text-sm">
          Brak tabel dla wybranego katalogu i sekcji.
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Wybierz inną sekcję albo katalog świadczeń.
        </p>
      </div>
    );
  }
  return (
    <div className="py-12 text-center">
      <p className="text-slate-500 text-sm">
        Brak wyników dla{" "}
        <span className="font-medium text-slate-700">&ldquo;{query}&rdquo;</span>.
      </p>
      <p className="text-slate-400 text-xs mt-2">
        Spróbuj kodu JGP (np.&nbsp;E61, A01) lub skróconej nazwy bez polskich znaków.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="py-8 px-4 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
      <p className="font-medium mb-1">Nie udało się pobrać danych</p>
      <p className="text-red-600 text-xs">{message}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

function SearchHint({ mode }: { mode: SearchMode }) {
  if (mode === "tables") {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-slate-400 mb-4">
          Wybierz katalog i sekcję, aby przeglądać świadczenia z dostępnymi tabelami statystycznymi NFZ.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
          {["1a", "1b", "1c", "1d", "1w"].map((hint) => (
            <span key={hint} className="px-2 py-1 rounded border border-slate-200 bg-slate-50 font-mono">
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
        <p className="text-sm text-slate-400 mb-4">
          Wyszukaj świadczenie, a potem filtruj jego rozpoznania ICD-10 i procedury ICD-9 w widoku danych.
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
          {["I25", "I21", "J18", "K35", "C34", "M16"].map((hint) => (
            <span key={hint} className="px-2 py-1 rounded border border-slate-200 bg-slate-50 font-mono">
              {hint}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-slate-400 mb-4">
        Wpisz minimum 2 znaki, aby wyszukać świadczenie lub grupę JGP.
      </p>
      <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
        {["A01", "E61", "H01", "ZABI", "RYTM", "NOWO"].map((hint) => (
          <span key={hint} className="px-2 py-1 rounded border border-slate-200 bg-slate-50 font-mono">
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
  mode?: SearchMode;
}

export function SearchView({
  initialQuery,
  initialCatalog,
  initialSection = "",
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

  const handleSubmit = useCallback(() => {
    const q = mode === "tables" ? query.trim() : query.trim();
    if (mode !== "tables" && q.length < 2) return;
    setCommittedQuery(q);
    setCommittedCatalog(catalog);
    setCommittedSection(section);
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "tables") {
      params.set("view", "tables");
      params.delete("type");
      params.delete("q");
    } else if (mode === "icd") {
      params.set("type", "icd");
      params.delete("view");
      params.set("q", q);
    } else {
      params.delete("view");
      params.delete("type");
      params.set("q", q);
    }
    if (catalog && catalog !== "all") {
      params.set("catalog", catalog);
    } else {
      params.delete("catalog");
    }
    if (section && section !== "all") {
      params.set("section", section);
    } else {
      params.delete("section");
    }
    router.push(`/search?${params}`, { scroll: false });
  }, [query, catalog, section, mode, router, searchParams]);

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
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded bg-slate-100 font-medium text-slate-600">Tabele statystyczne / Statistical tables</span>
          <span>Przeglądaj dostępne tabele statystyczne NFZ / Browse available NFZ statistical tables</span>
        </div>
      )}
      {mode === "icd" && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded bg-slate-100 font-medium text-slate-600">Dane medyczne / Medical data</span>
          <span>Przeglądaj rozpoznania ICD-10 i procedury ICD-9 / Browse ICD-10 diagnoses and ICD-9 procedures</span>
        </div>
      )}

      {/* Search bar */}
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

      {/* Results summary */}
      {showResults && meta && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Znaleziono{" "}
            <span className="font-medium text-slate-700">{meta.total}</span>{" "}
            {mode === "tables" ? "pozycji z tabelami" : "wyników dla "}
            {mode !== "tables" && (
              <span className="font-medium text-slate-700">&ldquo;{meta.query}&rdquo;</span>
            )}
            {meta.catalogs.length < 5 && (
              <> w katalogu <span className="font-mono">{meta.catalogs.join(", ")}</span></>
            )}
          </span>
          {isFetching && <span className="text-slate-400">Aktualizuję…</span>}
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
