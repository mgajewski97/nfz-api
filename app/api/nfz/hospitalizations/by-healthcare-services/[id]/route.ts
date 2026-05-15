import { NextRequest } from "next/server";
import { getHospitalizationsByHealthcareServices } from "@/lib/nfz-client";
import {
  buildMeta,
  handleNfzError,
  ok,
  parseBoolean,
  parsePositiveInt,
  validateUuid,
} from "@/lib/api-response";

/**
 * GET /api/nfz/hospitalizations/by-healthcare-services/[id]
 *
 * Returns hospitalization statistics split by healthcare service scope
 * (contract product / zakres świadczeń).
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
    const response = await getHospitalizationsByHealthcareServices(idResult.value, {
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
