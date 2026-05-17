"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, ArrowRight, RotateCcw } from "lucide-react";
import axios from "axios";

export interface AiSearchResult {
  query: string;
  catalog: string;
  section: string;
  yearFrom: number;
  yearTo: number;
  explanation: string;
}

export interface AiSuggestion {
  label: string;
  query: string;
  catalog: string;
  section: string;
  yearFrom: number;
  yearTo: number;
  reason: string;
}

interface AiResponse {
  explanation: string;
  autoRun: boolean;
  suggestions: AiSuggestion[];
}

interface AiSearchProps {
  onApply: (result: AiSearchResult) => void;
}

/**
 * "Zapytaj AI" — natural-language search assistant. Sends the question to
 * /api/ai-search, then presents the best-matching search suggestions for the
 * user to pick. When the AI reports a single obvious match it runs directly.
 */
export function AiSearch({ onApply }: AiSearchProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<AiSuggestion[] | null>(null);
  const [explanation, setExplanation] = useState("");

  function apply(s: AiSuggestion, exp: string) {
    onApply({
      query: s.query,
      catalog: s.catalog,
      section: s.section,
      yearFrom: s.yearFrom,
      yearTo: s.yearTo,
      explanation: s.reason || exp,
    });
    setOpen(false);
    setSuggestions(null);
    setQuestion("");
  }

  async function submit() {
    const q = question.trim();
    if (q.length < 3) {
      setError("Opisz czego szukasz (min. 3 znaki).");
      return;
    }
    setError(null);
    setLoading(true);
    setSuggestions(null);
    try {
      const { data } = await axios.post<{
        data: AiResponse | null;
        error: { message: string } | null;
      }>("/api/ai-search", { question: q });

      if (data.error || !data.data) {
        setError(data.error?.message ?? "Nie udało się przetworzyć zapytania.");
        return;
      }
      const res = data.data;
      if (res.autoRun && res.suggestions[0]) {
        apply(res.suggestions[0], res.explanation);
        return;
      }
      setExplanation(res.explanation);
      setSuggestions(res.suggestions);
    } catch (e) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.error?.message
          ? (e.response.data.error.message as string)
          : "Nie udało się połączyć z asystentem AI.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setError(null);
        }}
        aria-expanded={open}
        className="btn-holo holo-focus flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-semibold"
      >
        <Sparkles size={15} />
        Zapytaj AI
      </button>

      {open && (
        <div className="glass-panel mt-3 p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles size={13} aria-hidden />
              {suggestions
                ? "Dopasowane propozycje wyszukiwania"
                : "Opisz czego szukasz własnymi słowami"}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zamknij"
              className="holo-focus flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <X size={14} />
            </button>
          </div>

          {/* ── Suggestion list ── */}
          {suggestions ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{explanation}</p>
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={`${s.query}-${i}`}>
                    <button
                      type="button"
                      onClick={() => apply(s, explanation)}
                      className="holo-focus group flex w-full items-start gap-3 rounded-xl border border-[rgba(167,139,250,0.28)] bg-white/75 px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[rgba(232,121,249,0.5)] hover:shadow-pearl"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">
                          {s.label}
                        </span>
                        {s.reason && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {s.reason}
                          </span>
                        )}
                        <span className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                          <span className="soft-chip px-2 py-0.5 font-mono">
                            {s.query}
                          </span>
                          <span className="soft-chip px-2 py-0.5">
                            katalog: {s.catalog}
                          </span>
                          {s.section !== "all" && (
                            <span className="soft-chip px-2 py-0.5">
                              {s.section}
                            </span>
                          )}
                          <span className="soft-chip px-2 py-0.5">
                            {s.yearFrom}–{s.yearTo}
                          </span>
                        </span>
                      </span>
                      <ArrowRight
                        size={14}
                        className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setSuggestions(null);
                  setError(null);
                }}
                className="holo-focus inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                <RotateCcw size={12} aria-hidden />
                Zapytaj o coś innego
              </button>
            </div>
          ) : (
            /* ── Question form ── */
            <>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKey}
                rows={3}
                autoFocus
                placeholder="np. hospitalizacje dzieci poniżej 10 lat z rozpoznaniem zapalenia płuc w latach 2019-2022"
                className="w-full resize-y rounded-xl border-[1.5px] border-[rgba(167,139,250,0.32)] bg-white/85 px-3.5 py-2.5 text-sm text-[#3b0764] outline-none transition-colors placeholder:text-[rgba(167,139,250,0.6)] focus-visible:border-[rgba(167,139,250,0.6)] focus-visible:ring-4 focus-visible:ring-[rgba(167,139,250,0.14)]"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  AI zaproponuje pasujące wyszukiwania do wyboru
                </span>
                <button
                  type="button"
                  onClick={submit}
                  disabled={loading || question.trim().length < 3}
                  className="btn-holo holo-focus flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  {loading ? "Szukam propozycji…" : "Wyślij do AI"}
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="soft-error mt-2 px-3 py-1.5 text-xs">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
