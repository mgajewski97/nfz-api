"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATALOG_LABELS } from "@/lib/data-mappers";
import type { CatalogCode } from "@/types/nfz";
import type { SearchMode } from "./SearchView";

const CATALOGS = Object.entries(CATALOG_LABELS) as [CatalogCode, string][];

const PLACEHOLDER: Record<SearchMode, string> = {
  default: "Kod JGP lub fragment nazwy, np. A01, E6, ZAWAŁ…",
  tables: "",
  icd: "Kod ICD-10 lub ICD-9, np. I25, J18, K35…",
};

const SUBMIT_LABEL: Record<SearchMode, string> = {
  default: "Szukaj",
  tables: "Pokaż tabele",
  icd: "Szukaj",
};

interface SearchInputProps {
  query: string;
  catalog: string;
  section: string;
  sections: string[];
  onQueryChange: (q: string) => void;
  onCatalogChange: (c: string) => void;
  onSectionChange: (s: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  mode?: SearchMode;
}

export function SearchInput({
  query,
  catalog,
  section,
  sections,
  onQueryChange,
  onCatalogChange,
  onSectionChange,
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

  const canSubmit = mode === "tables" || query.trim().length >= 2;
  const catalogOptions =
    mode === "tables"
      ? CATALOGS
      : ([["all", "Wszystkie katalogi"], ...CATALOGS] as [string, string][]);

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Query field */}
      {mode !== "tables" && (
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
      )}

      <Select
        value={catalog}
        onValueChange={(value) => {
          if (value) onCatalogChange(value);
        }}
      >
        <SelectTrigger
          aria-label="Katalog świadczeń"
          className="min-h-[44px] w-full rounded-md border-slate-300 bg-white text-slate-700 sm:max-w-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {catalogOptions.map(([code, label]) => (
            <SelectItem key={code} value={code} className="min-h-[44px]">
              {code === "all" ? label : `${code} - ${label}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mode === "tables" && (
        <Select
          value={section}
          onValueChange={(value) => {
            if (value) onSectionChange(value);
          }}
        >
          <SelectTrigger
            aria-label="Sekcja JGP"
            className="min-h-[44px] w-full rounded-md border-slate-300 bg-white text-slate-700 sm:max-w-sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" className="max-w-[calc(100vw-2rem)]">
            <SelectItem value="all" className="min-h-[44px]">
              Wszystkie sekcje
            </SelectItem>
            {sections.map((item) => (
              <SelectItem key={item} value={item} className="min-h-[44px] whitespace-normal">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        onClick={onSubmit}
        disabled={!canSubmit || isLoading}
        className="min-h-[44px] px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium disabled:opacity-40"
      >
        {isLoading ? "Szukam…" : SUBMIT_LABEL[mode]}
      </Button>
    </div>
  );
}
