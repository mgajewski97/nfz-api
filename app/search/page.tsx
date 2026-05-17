import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SearchView, type SearchMode } from "@/components/search/SearchView";
import type { AiSearchResult } from "@/components/search/AiSearch";

interface SearchPageProps {
  searchParams: {
    q?: string;
    catalog?: string;
    section?: string;
    view?: string;
    type?: string;
    ai?: string;
  };
}

function parseAiResult(raw: string | undefined): AiSearchResult | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as AiSearchResult;
    if (parsed && typeof parsed.explanation === "string") return parsed;
  } catch {
    /* ignore malformed ai param */
  }
  return undefined;
}

/**
 * /search page — server component that reads URL params and hydrates
 * the client SearchView with initial values.
 */
export default function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q ?? "").trim();
  const catalog = searchParams.catalog ?? "";
  const section = searchParams.section ?? "";
  const initialAiResult = parseAiResult(searchParams.ai);
  const mode: SearchMode =
    searchParams.view === "tables"
      ? "tables"
      : searchParams.type === "icd"
        ? "icd"
        : "default";

  const heading =
    mode === "tables"
      ? "Tabele statystyczne"
      : mode === "icd"
        ? "Dane medyczne"
        : "Wyszukaj świadczenie";
  const description =
    mode === "tables"
      ? "Przeglądaj dostępne tabele statystyczne NFZ według katalogu i sekcji."
      : mode === "icd"
        ? "Wyszukaj świadczenie, a następnie analizuj rozpoznania ICD-10 i procedury ICD-9 w szczegółach tabeli."
        : "Wyszukiwanie po kodzie, nazwie lub słowie kluczowym. Wyniki obejmują katalogi NFZ.";

  return (
    <div className="app-atmosphere">
      {/* Top bar */}
      <header className="header-surface sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-foreground">
            <span className="sparkle text-xs tracking-widest text-primary">NFZ</span>
            <span className="h-4 w-px bg-border" aria-hidden />
            <span>Statystyki JGP</span>
          </Link>
          <nav className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="min-h-[44px] shrink-0 inline-flex items-center hover:text-primary transition-colors">
              Strona główna
            </Link>
            <ChevronRight size={12} className="shrink-0" aria-hidden />
            <span className="min-h-[44px] min-w-0 inline-flex items-center font-medium text-foreground rounded-full bg-secondary px-2.5" aria-current="page">
              Wyszukiwarka
            </span>
          </nav>
          <span className="hidden sm:block text-xs text-muted-foreground font-mono">
            api.nfz.gov.pl/app-stat-api-jgp
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-2">
        {/* Page heading */}
        <div className="ambient-panel mb-6 rounded-[1.5rem] px-5 py-5">
          <div className="pointer-events-none absolute right-6 top-5 h-2 w-2 rounded-full bg-holo-2/80 shadow-[0_0_18px_hsl(var(--holo-2)/0.8)]" aria-hidden />
          <h1 className="text-xl font-semibold text-foreground mb-1">
            {heading}
          </h1>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Search UI — needs Suspense because useSearchParams is used inside */}
        <Suspense fallback={null}>
          <SearchView
            initialQuery={q}
            initialCatalog={catalog}
            initialSection={section}
            initialAiResult={initialAiResult}
            mode={mode}
          />
        </Suspense>

        {/* Footer note */}
        <p className="pt-8 text-xs text-muted-foreground">
          Dane ze słownika świadczeń NFZ. Wyszukiwanie obsługuje kody JGP
          i fragmenty nazw (bez polskich znaków diakrytycznych).
        </p>
      </main>
    </div>
  );
}
