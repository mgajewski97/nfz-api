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
    <div className="relative z-10 flex flex-col gap-2 sm:flex-row">
      {/* Query field */}
      {mode !== "tables" && (
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/55"
            size={15}
            aria-hidden
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={PLACEHOLDER[mode]}
            className="min-h-[46px] rounded-xl border-border/90 bg-card/90 pl-9 pr-9 text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.8)] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 flex min-h-[44px] -translate-y-1/2 items-center rounded-full p-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
          className="min-h-[46px] w-full rounded-xl border-border/90 bg-card/90 text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.8)] sm:max-w-sm"
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
            className="min-h-[46px] w-full rounded-xl border-border/90 bg-card/90 text-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.8)] sm:max-w-sm"
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
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || isLoading}
        className="min-h-[46px] rounded-xl px-6 text-sm font-semibold disabled:opacity-45"
      >
        {isLoading ? "Szukam…" : SUBMIT_LABEL[mode]}
      </Button>
    </div>
  );
}
