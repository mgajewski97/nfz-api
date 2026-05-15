import { NextRequest } from "next/server";
import { getSections } from "@/lib/nfz-client";
import {
  buildMeta,
  handleNfzError,
  ok,
  parsePositiveInt,
} from "@/lib/api-response";

/**
 * GET /api/nfz/sections
 *
 * Returns the list of JGP sections (e.g. "A - Choroby układu nerwowego").
 *
 * Query params:
 *   page  – page number (default: 1)
 *   limit – results per page, max 25 (default: 25)
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const pageResult = parsePositiveInt(sp.get("page"), "page", 1);
  if (!pageResult.ok) return pageResult.response;

  const limitResult = parsePositiveInt(sp.get("limit"), "limit", 25, 25);
  if (!limitResult.ok) return limitResult.response;

  try {
    const response = await getSections({ page: pageResult.value, limit: limitResult.value });
    return ok(response.data, buildMeta(response.meta));
  } catch (error) {
    return handleNfzError(error);
  }
}
