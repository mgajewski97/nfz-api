import { NextRequest } from "next/server";
import { getBenefits } from "@/lib/nfz-client";
import { CATALOG_LABELS } from "@/lib/data-mappers";
import {
  err,
  handleNfzError,
  ok,
  parsePositiveInt,
  validateCatalog,
} from "@/lib/api-response";
import type { CatalogCode } from "@/types/nfz";

// ─── Result shape returned to the client ─────────────────────────────────────

export interface SearchResult {
  code: string;
  name: string;
  catalog: CatalogCode;
  catalogLabel: string;
}

export interface SearchMeta {
  query: string;
  total: number;
  page: number;
  limit: number;
  catalogs: CatalogCode[];
}

const ALL_CATALOGS: CatalogCode[] = ["1a", "1b", "1c", "1d", "1w"];
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

/**
 * GET /api/nfz/search
 *
 * Searches NFZ benefits dictionary by substring match on benefit name.
 *
 * Real API constraints (verified against live API):
 *   - Minimum query length: 2 characters (API returns error 4201032 for 1 char)
 *   - Search is case-insensitive substring match
 *   - Polish diacritics in query are silently dropped by NFZ — ASCII-only searches
 *     return meaningful results (e.g. "zawał" → search as "zawal" or by JGP code "E6")
 *   - Default: searches all 5 catalogs in parallel and merges results
 *
 * Query params:
 *   q       – required; search term, min 2 characters
 *   catalog – optional; filter to one catalog: 1a | 1b | 1c | 1d | 1w
 *   page    – page number (default: 1, applied per-catalog before merge)
 *   limit   – results per page, max 25 (default: 25)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // Validate q
  const rawQ = sp.get("q")?.trim() ?? "";
  if (rawQ.length < MIN_QUERY_LENGTH) {
    return err(
      `Zapytanie musi mieć co najmniej ${MIN_QUERY_LENGTH} znaki.`,
      "QUERY_TOO_SHORT",
      400,
    );
  }
  if (rawQ.length > MAX_QUERY_LENGTH) {
    return err(
      `Zapytanie nie może być dłuższe niż ${MAX_QUERY_LENGTH} znaków.`,
      "QUERY_TOO_LONG",
      400,
    );
  }

  // Optional catalog filter
  const rawCatalog = sp.get("catalog");
  let catalogsToSearch: CatalogCode[];
  if (rawCatalog) {
    const result = validateCatalog(rawCatalog);
    if (!result.ok) return result.response;
    catalogsToSearch = [result.value];
  } else {
    catalogsToSearch = ALL_CATALOGS;
  }

  const pageResult = parsePositiveInt(sp.get("page"), "page", 1);
  if (!pageResult.ok) return pageResult.response;

  const limitResult = parsePositiveInt(sp.get("limit"), "limit", 25, 25);
  if (!limitResult.ok) return limitResult.response;

  try {
    // Search all requested catalogs in parallel
    const settled = await Promise.allSettled(
      catalogsToSearch.map((catalog) =>
        getBenefits({
          benefit: rawQ,
          catalog,
          page: pageResult.value,
          limit: limitResult.value,
        }).then((res) => ({ catalog, res })),
      ),
    );

    const results: SearchResult[] = [];
    let totalCount = 0;

    for (const outcome of settled) {
      if (outcome.status === "rejected") continue; // silently skip failed catalogs
      const { catalog, res } = outcome.value;
      totalCount += res.meta.count;

      for (const benefit of res.data ?? []) {
        if (!benefit.code || !benefit.name) continue;
        results.push({
          code: benefit.code,
          name: benefit.name,
          catalog,
          catalogLabel: CATALOG_LABELS[catalog],
        });
      }
    }

    // Sort: exact-prefix matches first (name starts with query, case-insensitive)
    const qUpper = rawQ.toUpperCase();
    results.sort((a, b) => {
      const aPrefix = a.name.startsWith(qUpper) ? 0 : 1;
      const bPrefix = b.name.startsWith(qUpper) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      return a.name.localeCompare(b.name, "pl");
    });

    const meta: SearchMeta = {
      query: rawQ,
      total: totalCount,
      page: pageResult.value,
      limit: limitResult.value,
      catalogs: catalogsToSearch,
    };

    return ok(results, meta);
  } catch (error) {
    return handleNfzError(error);
  }
}
