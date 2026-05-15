import { NextRequest } from "next/server";
import { getIcd10Diseases } from "@/lib/nfz-client";
import {
  buildMeta,
  handleNfzError,
  ok,
  parsePositiveInt,
  validateUuid,
} from "@/lib/api-response";

/**
 * GET /api/nfz/icd10-diseases/[id]
 *
 * Returns hospitalization statistics split by ICD-10 diagnoses.
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
    const response = await getIcd10Diseases(idResult.value, {
      page: pageResult.value,
      limit: limitResult.value,
    });
    return ok(response.data, buildMeta(response.meta));
  } catch (error) {
    return handleNfzError(error);
  }
}
