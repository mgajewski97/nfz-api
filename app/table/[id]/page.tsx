import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { TableDetailView } from "@/components/table/TableDetailView";
import type { CatalogCode } from "@/types/nfz";

interface TableDetailPageProps {
  params: { id: string };
  searchParams: { catalog?: string; name?: string; from?: string };
}

const VALID_CATALOGS: CatalogCode[] = ["1a", "1b", "1c", "1d", "1w"];

function isValidCatalog(v: string | undefined): v is CatalogCode {
  return VALID_CATALOGS.includes(v as CatalogCode);
}

export default function TableDetailPage({ params, searchParams }: TableDetailPageProps) {
  const code = decodeURIComponent(params.id);
  const catalog = searchParams.catalog;
  const name = searchParams.name ? decodeURIComponent(searchParams.name) : undefined;
  const backUrl = searchParams.from ? decodeURIComponent(searchParams.from) : "/search";
  const isValid = isValidCatalog(catalog) && !!name;
  const displayName = name ?? code;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1 text-xs text-slate-500 min-w-0" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-800 transition-colors shrink-0 min-h-[44px] flex items-center">
              Strona główna
            </Link>
            <ChevronRight size={12} className="shrink-0" aria-hidden />
            <Link href={backUrl} className="hover:text-slate-800 transition-colors shrink-0 min-h-[44px] flex items-center">
              Wyszukiwarka
            </Link>
            <ChevronRight size={12} className="shrink-0" aria-hidden />
            <span className="text-slate-700 font-medium truncate">{displayName}</span>
          </nav>
          <span className="hidden sm:block text-xs text-slate-400 font-mono shrink-0">
            api.nfz.gov.pl
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {!isValid ? (
          <div className="py-8 px-4 rounded-md border border-red-200 bg-red-50 text-sm text-red-700 flex items-start gap-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium mb-1">Nieprawidłowy adres strony</p>
              <p className="text-xs text-red-600">
                Brakuje wymaganych parametrów (catalog, name). Wróć do{" "}
                <Link href="/search" className="underline hover:text-red-800">
                  wyszukiwarki
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          <Suspense fallback={null}>
            <TableDetailView
              code={code}
              catalog={catalog}
              name={name}
              backUrl={backUrl}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
}
