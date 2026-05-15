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
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="np. zawał serca, E65, artroplastyka kolana…"
          className="pl-9 h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400"
        />
      </div>
      <Button
        type="submit"
        className="h-11 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium"
      >
        Szukaj
      </Button>
    </form>
  );
}
