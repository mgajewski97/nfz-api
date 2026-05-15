import { NextRequest } from "next/server";
import { getBenefits } from "@/lib/nfz-client";
import {
  buildMeta,
  handleNfzError,
  ok,
  parsePositiveInt,
  validateCatalog,
  validateRequiredString,
} from "@/lib/api-response";

/**
 * GET /api/nfz/benefits
 *
 * Searches the NFZ benefits dictionary by substring match on benefit name.
 *
 * Real API constraints:
 *   - `benefit` and `catalog` are both required by the upstream API
 *   - `benefit` must be ≥ 2 characters (error 4201032 for shorter)
 *   - Search is case-insensitive substring; Polish diacritics silently stripped
 *
 * Query params:
 *   benefit – required; search term, min 2 characters
 *   catalog – required; catalog code: 1a | 1b | 1c | 1d | 1w
 *   section – optional; JGP section name from /sections
 *   page    – page number (default: 1)
 *   limit   – results per page, max 25 (default: 25)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const benefitResult = validateRequiredString(sp.get("benefit"), "benefit");
  if (!benefitResult.ok) return benefitResult.response;

  if (benefitResult.value.length < 2) {
    const { err } = await import("@/lib/api-response");
    return err("Parametr \"benefit\" musi mieć co najmniej 2 znaki.", "BENEFIT_TOO_SHORT", 400);
  }

  const catalogResult = validateCatalog(sp.get("catalog"));
  if (!catalogResult.ok) return catalogResult.response;

  const pageResult = parsePositiveInt(sp.get("page"), "page", 1);
  if (!pageResult.ok) return pageResult.response;

  const limitResult = parsePositiveInt(sp.get("limit"), "limit", 25, 25);
  if (!limitResult.ok) return limitResult.response;

  try {
    const response = await getBenefits({
      benefit: benefitResult.value,
      catalog: catalogResult.value,
      section: sp.get("section") ?? undefined,
      page: pageResult.value,
      limit: limitResult.value,
    });
    return ok(response.data, buildMeta(response.meta));
  } catch (error) {
    return handleNfzError(error);
  }
}
