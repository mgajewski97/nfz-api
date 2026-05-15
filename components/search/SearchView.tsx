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

async function searchBenefits(q: string, catalog: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  if (catalog && catalog !== "all") params.set("catalog", catalog);
  const { data } = await axios.get<SearchResponse>(`/api/nfz/search?${params}`);
  return data;
}

// ─── States ───────────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
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
          Wybierz katalog i wpisz fragment nazwy świadczenia, aby przeglądać dostępne tabele statystyczne.
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
          Wpisz kod ICD-10 lub ICD-9, aby znaleźć powiązane świadczenia JGP.
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
  mode?: SearchMode;
}

export function SearchView({ initialQuery, initialCatalog, mode = "default" }: SearchViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [catalog, setCatalog] = useState(initialCatalog || "all");

  const [committedQuery, setCommittedQuery] = useState(initialQuery);
  const [committedCatalog, setCommittedCatalog] = useState(initialCatalog || "all");

  const shouldFetch = committedQuery.trim().length >= 2;

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["search", committedQuery, committedCatalog],
    queryFn: () => searchBenefits(committedQuery, committedCatalog),
    enabled: shouldFetch,
    placeholderData: (prev) => prev,
  });

  const handleSubmit = useCallback(() => {
    const q = query.trim();
    if (q.length < 2) return;
    setCommittedQuery(q);
    setCommittedCatalog(catalog);
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", q);
    if (catalog && catalog !== "all") {
      params.set("catalog", catalog);
    } else {
      params.delete("catalog");
    }
    router.push(`/search?${params}`, { scroll: false });
  }, [query, catalog, router, searchParams]);

  const results = data?.data ?? [];
  const meta = data?.meta as SearchMeta | null;
  const apiError = data?.error;
  const showEmpty = !isFetching && shouldFetch && !isError && !apiError && results.length === 0;
  const showResults = !isFetching && !isError && !apiError && results.length > 0;

  // Build the back URL to pass to result cards
  const backUrl = encodeURIComponent(
    "/search?" +
      new URLSearchParams({
        q: committedQuery,
        ...(committedCatalog !== "all" ? { catalog: committedCatalog } : {}),
        ...(mode !== "default" ? { view: mode === "tables" ? "tables" : undefined, type: mode === "icd" ? "icd" : undefined } as Record<string, string> : {}),
      }),
  );

  return (
    <div className="space-y-6">
      {/* Mode label */}
      {mode === "tables" && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">Tabele statystyczne</span>
          <span>— przeglądaj indeks tabel dostępnych dla każdego świadczenia</span>
        </div>
      )}
      {mode === "icd" && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">Dane medyczne</span>
          <span>— wyszukiwanie po kodach ICD-10 / ICD-9</span>
        </div>
      )}

      {/* Search bar */}
      <SearchInput
        query={query}
        catalog={catalog}
        onQueryChange={setQuery}
        onCatalogChange={(c) => setCatalog(c || "all")}
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
            wyników dla{" "}
            <span className="font-medium text-slate-700">&ldquo;{meta.query}&rdquo;</span>
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
      {showEmpty && <EmptyState query={committedQuery} />}

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
