# Agent Instructions — NFZ App

## Project Overview
Next.js 14 application for browsing and analysing NFZ (Narodowy Fundusz Zdrowia) open statistical data.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Data fetching**: Axios + TanStack React Query
- **Charts**: Recharts
- **Export**: xlsx, papaparse

## Architecture

### Pages
| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Dashboard — overview / key metrics |
| `/search` | `app/search/page.tsx` | Search statistical tables |
| `/table/[id]` | `app/table/[id]/page.tsx` | Table detail view |

### API Routes (Next.js proxy to NFZ)
| Route | File | Purpose |
|-------|------|---------|
| `GET /api/nfz/index-of-tables` | `app/api/nfz/index-of-tables/route.ts` | List all statistical tables |
| `GET /api/nfz/basic-data/[id]` | `app/api/nfz/basic-data/[id]/route.ts` | Basic data for one table |
| `GET /api/nfz/hospitalizations` | `app/api/nfz/hospitalizations/route.ts` | Hospitalizations dataset |
| `POST /api/export` | `app/api/export/route.ts` | Export data as CSV/XLSX |

### Library Files
| File | Purpose |
|------|---------|
| `lib/nfz-client.ts` | Typed axios client for NFZ public API |
| `lib/data-mappers.ts` | Map technical field names to human-readable labels |
| `lib/export-service.ts` | Generate CSV / XLSX buffers from data arrays |
| `lib/cache.ts` | In-memory or file-based caching for NFZ responses |

### Types
| File | Purpose |
|------|---------|
| `types/nfz.ts` | Shared TypeScript types: `StatisticalTable`, `DataType`, `Hospitalization`, `BasicData` |

### Component Folders
| Folder | Purpose |
|--------|---------|
| `components/dashboard/` | Dashboard widgets and layout |
| `components/search/` | Search bar, filters, results list |
| `components/table/` | Table detail, data grid |
| `components/charts/` | Recharts wrappers |
| `components/export/` | Export button / modal |
| `components/ui/` | shadcn/ui primitives (auto-generated) |

## Development Rules
1. All NFZ API calls must go through the Next.js proxy routes — never call the NFZ API directly from client components.
2. Use React Query for all server-state management; no useState for remote data.
3. Keep `types/nfz.ts` as the single source of truth for data shapes.
4. `data-mappers.ts` must be the only place where technical → business label translation happens.
5. Export logic lives exclusively in `export-service.ts` and the `/api/export` route.
6. Do not add business logic to page components — delegate to hooks and lib files.

# Zasady projektu NFZ App

## Stack
- Next.js 14, TypeScript, Tailwind, shadcn/ui
- API proxy w app/api/nfz/ (nigdy bezpośrednio z frontendu)

## Zasady UI
- Użytkownik nie zna programowania — zero żargonu technicznego
- Etykiety po polsku, zrozumiałe merytorycznie
- Nie pokazuj endpointów, surowego JSON, stack trace

## Zasady integracji z NFZ
- Sprawdzaj rzeczywistą strukturę odpowiedzi przed pisaniem typów
- Obsługuj paginację (page, limit, meta.count)
- Mapuj błędy HTTP na polskie komunikaty

## Format błędu
{ error: { message: string (po polsku), code: string, technical?: string } }

## Eksport
- CSV z BOM (dla Excela)
- XLSX przez bibliotekę xlsx
- Zawsze dołącz metadane: data, źródło, filtry, liczba rekordów