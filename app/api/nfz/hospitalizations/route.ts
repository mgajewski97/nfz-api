import { NextResponse } from "next/server";

/**
 * GET /api/nfz/hospitalizations
 *
 * Discovery endpoint — lists available hospitalization sub-routes.
 * Each sub-route accepts a table UUID from /api/nfz/index-of-tables.
 */
export async function GET() {
  return NextResponse.json({
    data: null,
    meta: null,
    error: {
      message:
        "Podaj typ rozbicia i identyfikator tabeli. Dostępne sub-zasoby poniżej.",
      code: "MISSING_SUBRESOURCE",
    },
    availableRoutes: [
      {
        path: "/api/nfz/hospitalizations/by-gender/[id]",
        description: "Hospitalizacje w podziale na płeć pacjenta",
      },
      {
        path: "/api/nfz/hospitalizations/by-admission-type/[id]",
        description: "Hospitalizacje w podziale na tryb przyjęcia",
      },
      {
        path: "/api/nfz/hospitalizations/by-discharge-type/[id]",
        description: "Hospitalizacje w podziale na tryb wypisu",
      },
      {
        path: "/api/nfz/hospitalizations/by-age/[id]",
        description: "Hospitalizacje w podziale na grupy wiekowe",
      },
      {
        path: "/api/nfz/hospitalizations/by-healthcare-services/[id]",
        description: "Hospitalizacje w podziale na zakres świadczeń",
      },
    ],
  });
}
