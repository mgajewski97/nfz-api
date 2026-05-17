import { NextRequest, NextResponse } from "next/server";
import { getAllSections } from "@/lib/nfz-client";
import { CATALOG_LABELS } from "@/lib/data-mappers";

/**
 * POST /api/ai-search
 *
 * Accepts a natural-language question and uses the Google Gemini API
 * (free tier — Google AI Studio) to translate it into structured NFZ
 * search filters.
 *
 * Requires the GEMINI_API_KEY environment variable (free key from
 * https://aistudio.google.com/apikey).
 *
 * Body:   { question: string }
 * Returns { data: { query, catalog, section, yearFrom, yearTo, explanation }, error: null }
 *      or { data: null, error: { message } }
 */

const MODEL = "gemini-2.5-flash";
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2015;

interface AiSearchResult {
  query: string;
  catalog: string;
  section: string;
  yearFrom: number;
  yearTo: number;
  explanation: string;
}

function clampYear(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(CURRENT_YEAR, Math.max(MIN_YEAR, Math.round(n)));
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            "Asystent AI jest niedostępny — brak klucza GEMINI_API_KEY w konfiguracji serwera.",
        },
      },
      { status: 503 },
    );
  }

  let body: { question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { data: null, error: { message: "Nieprawidłowe żądanie." } },
      { status: 400 },
    );
  }

  const question = (body.question ?? "").trim();
  if (question.length < 3) {
    return NextResponse.json(
      { data: null, error: { message: "Opisz czego szukasz (min. 3 znaki)." } },
      { status: 400 },
    );
  }

  // Sections list for the system prompt (best-effort).
  let sections: string[] = [];
  try {
    sections = await getAllSections();
  } catch {
    sections = [];
  }

  const catalogsList = Object.entries(CATALOG_LABELS)
    .map(([code, label]) => `  ${code} = ${label}`)
    .join("\n");
  const sectionsList = sections.length
    ? sections.map((s) => `  - ${s}`).join("\n")
    : '  (lista sekcji chwilowo niedostępna — użyj "all")';

  const system = `Jesteś asystentem wyszukiwania w bazie statystyk NFZ dotyczącej hospitalizacji w systemie Jednorodnych Grup Pacjentów (JGP).

Użytkownik opisuje czego szuka w języku naturalnym (po polsku). Twoim zadaniem jest przetłumaczyć opis na strukturalne filtry wyszukiwarki.

Odpowiedz WYŁĄCZNIE obiektem JSON o polach:
{
  "query": string,        // słowa kluczowe do wyszukania: kod JGP (np. E61) lub fragment nazwy świadczenia. BEZ polskich znaków diakrytycznych (API ich nie obsługuje). Minimum 2 znaki.
  "catalog": string,      // kod katalogu lub "all"
  "section": string,      // dokładna nazwa sekcji z listy poniżej lub "all"
  "yearFrom": number,     // rok początkowy, ${MIN_YEAR}-${CURRENT_YEAR}
  "yearTo": number,       // rok końcowy, ${MIN_YEAR}-${CURRENT_YEAR}
  "explanation": string   // krótkie zdanie po polsku wyjaśniające jak zinterpretowałeś zapytanie
}

Dostępne katalogi (pole "catalog"):
${catalogsList}

Dostępne sekcje JGP (pole "section" — użyj DOKŁADNEJ nazwy z listy albo "all"):
${sectionsList}

Zasady:
- Jeśli czegoś nie da się ustalić, użyj "all" dla catalog/section oraz pełnego zakresu lat ${MIN_YEAR}-${CURRENT_YEAR}.
- "query" musi mieć co najmniej 2 znaki i nie zawierać polskich znaków diakrytycznych (ą→a, ł→l itd.).
- Nie dodawaj żadnego tekstu poza obiektem JSON.`;

  try {
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 1024,
            // Disable "thinking" — it would consume the output-token budget
            // and leave the JSON answer truncated.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );

    if (!aiRes.ok) {
      let message = "Usługa AI zwróciła błąd. Spróbuj ponownie później.";
      if (aiRes.status === 400 || aiRes.status === 401 || aiRes.status === 403) {
        message =
          "Klucz GEMINI_API_KEY jest nieprawidłowy lub wygasł — wygeneruj nowy w Google AI Studio.";
      } else if (aiRes.status === 429) {
        message =
          "Przekroczono darmowy limit zapytań AI. Spróbuj ponownie za chwilę.";
      }
      return NextResponse.json(
        { data: null, error: { message } },
        { status: 502 },
      );
    }

    const aiData = await aiRes.json();
    const text: string =
      aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("no-json");
    }

    const parsed = JSON.parse(text.slice(start, end + 1)) as Partial<AiSearchResult>;
    const validCatalogs = Object.keys(CATALOG_LABELS);

    const result: AiSearchResult = {
      query: typeof parsed.query === "string" ? parsed.query.trim() : "",
      catalog:
        typeof parsed.catalog === "string" && validCatalogs.includes(parsed.catalog)
          ? parsed.catalog
          : "all",
      section:
        typeof parsed.section === "string" && sections.includes(parsed.section)
          ? parsed.section
          : "all",
      yearFrom: clampYear(parsed.yearFrom, MIN_YEAR),
      yearTo: clampYear(parsed.yearTo, CURRENT_YEAR),
      explanation:
        typeof parsed.explanation === "string" && parsed.explanation.trim()
          ? parsed.explanation.trim()
          : "Zinterpretowano zapytanie i ustawiono filtry wyszukiwania.",
    };

    if (result.yearFrom > result.yearTo) {
      const tmp = result.yearFrom;
      result.yearFrom = result.yearTo;
      result.yearTo = tmp;
    }

    return NextResponse.json({ data: result, error: null });
  } catch {
    return NextResponse.json(
      {
        data: null,
        error: { message: "Nie udało się zinterpretować zapytania przez AI." },
      },
      { status: 502 },
    );
  }
}
