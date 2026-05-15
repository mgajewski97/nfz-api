# Current State Assessment

Date: 2026-05-15

## Repository Shape

- Stack found in `package.json`: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn-style UI primitives, TanStack React Query, Axios, `xlsx`, `papaparse`, Recharts.
- The app has a Next.js backend/proxy layer in `app/api/`; client components call local API routes rather than the NFZ API directly.
- Primary folders in scope:
  - `app/`: routes, layouts, local API routes.
  - `components/`: search, table, export, providers, UI primitives.
  - `lib/`: NFZ client, response helpers, data label mapping, export helpers, cache placeholder.

## Routes Found

- `/` via `app/page.tsx`: dashboard and landing/search entry.
- `/search` via `app/search/page.tsx`: search UI with client-side `SearchView`.
- `/table/[id]` via `app/table/[id]/page.tsx`: table detail route for selected benefit code/catalog/name.
- API proxy routes:
  - `/api/nfz/search`
  - `/api/nfz/benefits`
  - `/api/nfz/sections`
  - `/api/nfz/index-of-tables`
  - `/api/nfz/basic-data/[id]`
  - `/api/nfz/hospitalizations`
  - `/api/nfz/hospitalizations/by-gender/[id]`
  - `/api/nfz/hospitalizations/by-age/[id]`
  - `/api/nfz/hospitalizations/by-admission-type/[id]`
  - `/api/nfz/hospitalizations/by-discharge-type/[id]`
  - `/api/nfz/hospitalizations/by-healthcare-services/[id]`
  - `/api/export`

## New Or Notable Files And Components Found

- `components/search/SearchView.tsx`: React Query search/results orchestration with mode scaffolding for `default`, `tables`, and `icd`.
- `components/search/SearchInput.tsx`: query input and catalog filter.
- `components/search/ResultCard.tsx`: benefit result card linking to `/table/[id]`.
- `components/table/TableDetailView.tsx`: index lookup, year range filtering, overview metrics, breakdown tabs, export wiring.
- `components/table/DataGrid.tsx`: tabular data renderer with loading, empty, and error states.
- `components/export/ExportButton.tsx`: export dropdown wired to `/api/export`.
- `lib/export-service.ts`: existing CSV/XLSX builders, but not yet matching the requested `exportToCsv` / `exportToXlsx` Blob API.
- `app/api/export/route.ts`: existing export POST route.

## What Works End To End

- Dashboard to `/search` basic flow exists.
- Search route calls `/api/nfz/search`, which fans out to `/benefits` via `lib/nfz-client.ts`.
- Search results link to `/table/[id]` with `catalog`, `name`, and optional `from`.
- Table detail calls `/api/nfz/index-of-tables`, selects a year, maps table UUIDs, and loads:
  - basic data,
  - gender breakdown,
  - age breakdown,
  - admission type breakdown,
  - discharge type breakdown,
  - healthcare service scope breakdown.
- Table detail displays overview metrics and a `DataGrid`.
- Export UI exists and calls `/api/export`; it can export currently prepared rows, but metadata and API shape need tightening.

## Stubbed, Empty, Mocked, Or Incomplete

- `lib/cache.ts` is a placeholder comment only.
- README is still the default create-next-app text.
- `AGENT_INSTRUCTIONS.md` mentions folders such as `components/dashboard/` and `components/charts/` that are not present.
- Recharts is installed but no chart components were found in app code.
- Product category, histogram, admission NFZ categorized, ICD-9, and ICD-10 NFZ endpoints are not currently proxied or displayed, although the live index returns those table types.
- `/search?view=tables` and `/search?type=icd` are scaffolded in `SearchView` but `app/search/page.tsx` does not pass mode params yet, so the routes are not currently meaningfully different.
- Section filtering is not connected to the search UI, although `/sections` and `getSections` exist.
- Export exists but does not yet include the full requested metadata shape and does not expose the requested Blob-returning function names.

## User Paths

- `User -> search/results -> table details -> data table`: partially passable. The basic route exists and data can be displayed when NFZ returns data, but `/search` mode routing is incomplete and some table types from the index are ignored.
- `User -> search/results -> table details -> data table -> export`: partially passable. The export button is connected, but export metadata and current visible-data semantics need correction.

## NFZ API Client Structure

- `lib/nfz-client.ts` creates one Axios client for `https://api.nfz.gov.pl/app-stat-api-jgp`.
- Global params: `format=json`, `api-version=1.1`.
- Errors are normalized into `NfzApiClientError`; API routes map them through `handleNfzError`.
- Implemented client calls: sections, benefits, index of tables, basic data, gender, admission type, discharge type, age, healthcare service scope.
- Missing client calls for endpoints returned by the live index: product category, histogram, ICD-9, ICD-10, admission NFZ categorized.

## Live API Verification Notes

- Verified live on 2026-05-15 with `curl`.
- `/benefits?catalog=1a&benefit=E61&limit=5` returned HTTP 200 and one benefit: `E61 ZABURZENIA RYTMU SERCA > 69 R.Ż. LUB Z PW`.
- `/index-of-tables?catalog=1a&name=E61...` returned HTTP 200 and table UUIDs for multiple years.
- The live 2024 index link for `hospitalization-by-service` points to singular upstream path:
  `/hospitalizations-by-healthcare-service/6915b214-448a-d9e0-b29d-9a0275b6a010?format=json`
- Singular upstream path returned HTTP 200 with response `meta`, `links`, and `data.attributes.data[]`.
- Plural upstream path `/hospitalizations-by-healthcare-services/{id}` returned HTTP 404 with an empty body for the same ID.
- Passing `hospitalType=true` returned HTTP 400; live API accepts `hospital-type=true`.

## Loading, Empty, And Error States

- Search has hint, loading skeleton, empty state, and error state.
- Table detail has index loading skeleton and index error state.
- `DataGrid` has loading, empty, and error states.
- API route errors are user-safe Polish messages, but upstream empty-body errors can still surface as generic Axios text.

## Mobile And Responsive Issues Found

- Most touch targets in modified app components are at or near 44px.
- Tables are wrapped by `components/ui/table.tsx` and additionally in `TableDetailView`.
- Some fixed responsive column counts remain, e.g. dashboard `sm:grid-cols-2 lg:grid-cols-4`, process `sm:grid-cols-4`, stats `sm:grid-cols-4`; these should move toward auto-fit/flex-wrap where touched.
- `SearchInput` uses `sm:w-64` for catalog select; should be changed to a responsive max/flex basis.
- shadcn/Base UI `SelectTrigger` defaults to `h-8`, below the requested 44px; usages for filters need explicit `min-h-[44px]`.
- Current table mode and ICD mode are not fully differentiated for non-technical users.
