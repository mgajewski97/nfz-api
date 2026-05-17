import { NextRequest, NextResponse } from "next/server";
import { getAllSections } from "@/lib/nfz-client";
import { CATALOG_LABELS } from "@/lib/data-mappers";

/**
 * POST /api/ai-search
 *
 * Accepts a natural-language question and uses the Google Gemini API
 * (free tier — Google AI Studio) to propose the best-matching NFZ search
 * options. Returns a ranked list of concrete search suggestions; when one
 * is an obvious single match the response sets autoRun = true.
 *
 * Requires the GEMINI_API_KEY environment variable.
 *
 * Body:   { question: string }
 * Returns { data: { explanation, autoRun, suggestions: [...] }, error: null }
 *      or { data: null, error: { message } }
 */

const MODEL = "gemini-2.5-flash";
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2015;
const MAX_SUGGESTIONS = 5;

interface AiSuggestion {
  label: string;
  query: string;
  catalog: string;
  section: string;
  yearFrom: number;
  yearTo: number;
  reason: string;
}

function clampYear(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(CURRENT_YEAR, Math.max(MIN_YEAR, Math.round(n)));
}

/** NFZ search ignores Polish diacritics — strip them so queries actually match. */
function stripDiacritics(s: string): string {
  return s
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
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

Wyszukiwarka NFZ działa na słowniku świadczeń JGP — dopasowuje fragment nazwy świadczenia lub kod grupy JGP (np. E61, A01). NIE rozumie pełnych zdań ani opisów.

Twoim zadaniem NIE jest mechaniczne przerobienie pytania na jedno hasło. Masz przeanalizować intencję użytkownika i ZAPROPONOWAĆ kilka konkretnych, trafnych wariantów wyszukiwania, które realnie coś znajdą w słowniku JGP.

Odpowiedz WYŁĄCZNIE obiektem JSON:
{
  "explanation": string,   // krótkie zdanie po polsku: jak zrozumiałeś zapytanie
  "autoRun": boolean,      // true TYLKO gdy jedna propozycja jest oczywistym, jedynym trafnym dopasowaniem 1:1
  "suggestions": [         // 2-5 propozycji, posortowane od najtrafniejszej
    {
      "label": string,     // krótka, czytelna nazwa propozycji po polsku (np. "Zawały serca — grupy JGP")
      "query": string,     // konkretne hasło do wyszukiwarki: kod JGP lub krótkie słowo kluczowe (1-2 słowa) wystepujące w nazwach świadczeń. BEZ polskich znaków diakrytycznych (ą→a, ł→l). Min. 2 znaki.
      "catalog": string,   // kod katalogu lub "all"
      "section": string,   // dokładna nazwa sekcji z listy lub "all"
      "yearFrom": number,  // ${MIN_YEAR}-${CURRENT_YEAR}
      "yearTo": number,    // ${MIN_YEAR}-${CURRENT_YEAR}
      "reason": string     // krótko po polsku: dlaczego ta propozycja pasuje do zapytania
    }
  ]
}

Dostępne katalogi (pole "catalog"):
${catalogsList}

Dostępne sekcje JGP (pole "section" — DOKŁADNA nazwa z listy albo "all"):
${sectionsList}

Zasady:
- Proponuj różne, sensownie odmienne warianty (inne hasła/kody/katalogi), a nie 5 razy to samo.
- "query" musi być krótkie i realistyczne — takie, które wystąpi w nazwie świadczenia JGP. Lepiej dać ogólne, pewne hasło niż długą frazę, która nic nie znajdzie.
- Gdy czegoś nie da się ustalić, użyj "all" i pełnego zakresu lat.
- "autoRun" ustaw na true tylko przy jednoznacznym, pojedynczym trafieniu (np. użytkownik wprost podał kod JGP).
- Zwróć wyłącznie obiekt JSON, bez dodatkowego tekstu.`;

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
            temperature: 0.3,
            maxOutputTokens: 1400,
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
      return NextResponse.json({ data: null, error: { message } }, { status: 502 });
    }

    const aiData = await aiRes.json();
    const text: string =
      aiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("no-json");
    }

    const parsed = JSON.parse(text.slice(start, end + 1)) as {
      explanation?: unknown;
      autoRun?: unknown;
      suggestions?: unknown;
    };

    const validCatalogs = Object.keys(CATALOG_LABELS);
    const rawSuggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
      : [];

    const suggestions: AiSuggestion[] = rawSuggestions
      .map((raw): AiSuggestion | null => {
        const s = raw as Partial<AiSuggestion>;
        const query =
          typeof s.query === "string" ? stripDiacritics(s.query.trim()) : "";
        if (query.length < 2) return null;
        let yearFrom = clampYear(s.yearFrom, MIN_YEAR);
        let yearTo = clampYear(s.yearTo, CURRENT_YEAR);
        if (yearFrom > yearTo) [yearFrom, yearTo] = [yearTo, yearFrom];
        return {
          label:
            typeof s.label === "string" && s.label.trim()
              ? s.label.trim()
              : query,
          query,
          catalog:
            typeof s.catalog === "string" && validCatalogs.includes(s.catalog)
              ? s.catalog
              : "all",
          section:
            typeof s.section === "string" && sections.includes(s.section)
              ? s.section
              : "all",
          yearFrom,
          yearTo,
          reason:
            typeof s.reason === "string" && s.reason.trim()
              ? s.reason.trim()
              : "",
        };
      })
      .filter((s): s is AiSuggestion => s !== null)
      .slice(0, MAX_SUGGESTIONS);

    if (suggestions.length === 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message:
              "AI nie znalazło pasujących propozycji wyszukiwania. Spróbuj opisać to inaczej.",
          },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      data: {
        explanation:
          typeof parsed.explanation === "string" && parsed.explanation.trim()
            ? parsed.explanation.trim()
            : "Oto propozycje wyszukiwania dopasowane do Twojego opisu.",
        autoRun: parsed.autoRun === true && suggestions.length === 1,
        suggestions,
      },
      error: null,
    });
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
