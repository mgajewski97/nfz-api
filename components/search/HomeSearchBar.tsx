"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative z-10 flex w-full flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60"
          size={16}
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="np. zawał serca, E65, artroplastyka kolana…"
          className="min-h-[48px] rounded-xl bg-card/90 pl-9 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.82)]"
        />
      </div>
      <Button type="submit" className="min-h-[48px] rounded-xl px-6 font-semibold">
        Szukaj
      </Button>
    </form>
  );
}
