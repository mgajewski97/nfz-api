"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATALOG_LABELS } from "@/lib/data-mappers";
import type { CatalogCode } from "@/types/nfz";
import type { SearchMode } from "./SearchView";

const CATALOGS = Object.entries(CATALOG_LABELS) as [CatalogCode, string][];

const PLACEHOLDER: Record<SearchMode, string> = {
  default: "Kod JGP lub fragment nazwy, np. A01, E6, ZAWAŁ…",
  tables: "Kod lub fragment nazwy — wybierz też katalog po prawej",
  icd: "Kod ICD-10 lub ICD-9, np. I25, J18, K35…",
};

const SUBMIT_LABEL: Record<SearchMode, string> = {
  default: "Szukaj",
  tables: "Przeglądaj",
  icd: "Szukaj",
};

interface SearchInputProps {
  query: string;
  catalog: string;
  onQueryChange: (q: string) => void;
  onCatalogChange: (c: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  mode?: SearchMode;
}

export function SearchInput({
  query,
  catalog,
  onQueryChange,
  onCatalogChange,
  onSubmit,
  isLoading,
  mode = "default",
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") onSubmit();
  }

  function handleClear() {
    onQueryChange("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Query field */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={15}
          aria-hidden
        />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={PLACEHOLDER[mode]}
          className="pl-9 pr-8 min-h-[44px] border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
          autoFocus
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 min-h-[44px] flex items-center"
            aria-label="Wyczyść zapytanie"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Catalog filter — native select for reliable cross-browser interaction */}
      <select
        value={catalog}
        onChange={(e) => onCatalogChange(e.target.value)}
        className="min-h-[44px] w-full sm:w-64 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
        aria-label="Katalog świadczeń"
      >
        <option value="all">Wszystkie katalogi</option>
        {CATALOGS.map(([code, label]) => (
          <option key={code} value={code}>
            {code} – {label}
          </option>
        ))}
      </select>

      <Button
        onClick={onSubmit}
        disabled={query.trim().length < 2 || isLoading}
        className="min-h-[44px] px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium disabled:opacity-40"
      >
        {isLoading ? "Szukam…" : SUBMIT_LABEL[mode]}
      </Button>
    </div>
  );
}
