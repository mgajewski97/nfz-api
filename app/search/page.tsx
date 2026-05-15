import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SearchView } from "@/components/search/SearchView";

interface SearchPageProps {
  searchParams: { q?: string; catalog?: string };
}

/**
 * /search page — server component that reads URL params and hydrates
 * the client SearchView with initial values.
 */
export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q ?? "").trim();
  const catalog = searchParams.catalog ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={13} />
              Strona główna
            </Link>
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-sm font-medium text-slate-700">
              Wyszukiwarka świadczeń
            </span>
          </div>
          <span className="hidden sm:block text-xs text-slate-400 font-mono">
            api.nfz.gov.pl/app-stat-api-jgp
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-2">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-1">
            Wyszukaj świadczenie JGP
          </h1>
          <p className="text-sm text-slate-500">
            Wyszukiwanie po kodzie (np.&nbsp;A01, E61) lub fragmencie nazwy.
            Wyniki obejmują wszystkie katalogi NFZ.
          </p>
        </div>

        {/* Search UI — needs Suspense because useSearchParams is used inside */}
        <Suspense fallback={null}>
          <SearchView initialQuery={q} initialCatalog={catalog} />
        </Suspense>

        {/* Footer note */}
        <p className="pt-8 text-xs text-slate-400">
          Dane ze słownika świadczeń NFZ. Wyszukiwanie obsługuje kody JGP
          i fragmenty nazw (bez polskich znaków diakrytycznych).
        </p>
      </main>
    </div>
  );
}
