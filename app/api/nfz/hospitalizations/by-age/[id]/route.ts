import { NextRequest } from "next/server";
import { getHospitalizationsByAge } from "@/lib/nfz-client";
import {
  buildMeta,
  handleNfzError,
  ok,
  parseBoolean,
  parsePositiveInt,
  validateUuid,
} from "@/lib/api-response";

/**
 * GET /api/nfz/hospitalizations/by-age/[id]
 *
 * Returns hospitalization statistics split by patient age group.
 *
 * age-group-code values:
 *   1 = poniżej 1 roku
 *   2 = 1–6 lat
 *   3 = 7–17 lat
 *   4 = 18–40 lat
 *   5 = 41–60 lat
 *   6 = 61–80 lat
 *   7 = 81 lat i więcej
 *   8 = brak danych
 *
 * Path params:
 *   id           – UUID of the statistical table (from /index-of-tables)
 *
 * Query params:
 *   branch       – split by NFZ regional branch (OW NFZ)
 *   hospitalType – split by hospital type
 *   page         – page number (default: 1)
 *   limit        – results per page, max 25 (default: 25)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const idResult = validateUuid(params.id);
  if (!idResult.ok) return idResult.response;

  const sp = req.nextUrl.searchParams;

  const pageResult = parsePositiveInt(sp.get("page"), "page", 1);
  if (!pageResult.ok) return pageResult.response;

  const limitResult = parsePositiveInt(sp.get("limit"), "limit", 25, 25);
  if (!limitResult.ok) return limitResult.response;

  try {
    const response = await getHospitalizationsByAge(idResult.value, {
      branch: parseBoolean(sp.get("branch")),
      hospitalType: parseBoolean(sp.get("hospitalType")),
      page: pageResult.value,
      limit: limitResult.value,
    });
    return ok(response.data, buildMeta(response.meta));
  } catch (error) {
    return handleNfzError(error);
  }
}
