"use client";

import { useRouter } from "next/navigation";
import { AiSearch, type AiSearchResult } from "./AiSearch";

/**
 * AI search entry point for the home dashboard. Runs the natural-language
 * query, then navigates to /search with the resolved filters so the user
 * lands directly on results — no extra clicks.
 */
export function HomeAiSearch() {
  const router = useRouter();

  function handleApply(result: AiSearchResult) {
    const params = new URLSearchParams();
    if (result.query) params.set("q", result.query);
    if (result.catalog && result.catalog !== "all") {
      params.set("catalog", result.catalog);
    }
    if (result.section && result.section !== "all") {
      params.set("section", result.section);
    }
    // Carry the full AI result so /search can show the explanation banner.
    params.set("ai", JSON.stringify(result));
    router.push(`/search?${params}`);
  }

  return <AiSearch onApply={handleApply} />;
}
