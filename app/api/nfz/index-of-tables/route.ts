import { NextRequest } from "next/server";
import { getIndexOfTables } from "@/lib/nfz-client";
import {
  buildMeta,
  handleNfzError,
  ok,
  parseYear,
  validateCatalog,
  validateRequiredString,
} from "@/lib/api-response";

/**
 * GET /api/nfz/index-of-tables
 *
 * Returns the index of available statistical tables for a given product.
 * The response groups tables by year and optional sub-periods.
 * Use the returned table `id` (UUID) to fetch actual data from /basic-data/{id}
 * or the hospitalization sub-routes.
 *
 * Query params:
 *   catalog – required; benefit catalog code: 1a | 1b | 1c | 1d | 1w
 *   name    – required; benefit/JGP group name (must match a value from /benefits)
 *   year    – optional; filter to a specific year (2000–current)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const catalogResult = validateCatalog(sp.get("catalog"));
  if (!catalogResult.ok) return catalogResult.response;

  const nameResult = validateRequiredString(sp.get("name"), "name");
  if (!nameResult.ok) return nameResult.response;

  const yearResult = parseYear(sp.get("year"));
  if (!yearResult.ok) return yearResult.response;

  try {
    const response = await getIndexOfTables({
      catalog: catalogResult.value,
      name: nameResult.value,
      year: yearResult.value,
    });
    return ok(response.data, buildMeta(response.meta));
  } catch (error) {
    return handleNfzError(error);
  }
}
