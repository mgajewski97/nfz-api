import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SearchView, type SearchMode } from "@/components/search/SearchView";

interface SearchPageProps {
  searchParams: { q?: string; catalog?: string; section?: string; view?: string; type?: string };
}

/**
 * /search page — server component that reads URL params and hydrates
 * the client SearchView with initial values.
 */
export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q ?? "").trim();
  const catalog = searchParams.catalog ?? "";
  const section = searchParams.section ?? "";
  const mode: SearchMode =
    searchParams.view === "tables"
      ? "tables"
      : searchParams.type === "icd"
        ? "icd"
        : "default";

  const heading =
    mode === "tables"
      ? "Tabele statystyczne / Statistical tables"
      : mode === "icd"
        ? "Dane medyczne / Medical data"
        : "Wyszukaj świadczenie / Search service";
  const description =
    mode === "tables"
      ? "Przeglądaj dostępne tabele statystyczne NFZ według katalogu i sekcji."
      : mode === "icd"
        ? "Wyszukaj świadczenie, a następnie analizuj rozpoznania ICD-10 i procedury ICD-9 w szczegółach tabeli."
        : "Wyszukiwanie po kodzie, nazwie lub słowie kluczowym. Wyniki obejmują katalogi NFZ.";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="text-xs tracking-widest text-slate-500">NFZ</span>
            <span className="h-4 w-px bg-slate-200" aria-hidden />
            <span>Statystyki JGP</span>
          </Link>
          <nav className="flex min-w-0 items-center gap-1 text-xs text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="min-h-[44px] shrink-0 inline-flex items-center hover:text-slate-800 transition-colors">
              Strona główna / Home
            </Link>
            <ChevronRight size={12} className="shrink-0" aria-hidden />
            <span className="min-h-[44px] min-w-0 inline-flex items-center font-medium text-slate-700" aria-current="page">
              Wyszukiwarka / Search
            </span>
          </nav>
          <span className="hidden sm:block text-xs text-slate-400 font-mono">
            api.nfz.gov.pl/app-stat-api-jgp
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-2">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800 mb-1">
            {heading}
          </h1>
          <p className="text-sm text-slate-500">
            {description}
          </p>
        </div>

        {/* Search UI — needs Suspense because useSearchParams is used inside */}
        <Suspense fallback={null}>
          <SearchView
            initialQuery={q}
            initialCatalog={catalog}
            initialSection={section}
            mode={mode}
          />
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
