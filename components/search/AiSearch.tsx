"use client";

import { useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import axios from "axios";

export interface AiSearchResult {
  query: string;
  catalog: string;
  section: string;
  yearFrom: number;
  yearTo: number;
  explanation: string;
}

interface AiSearchProps {
  onApply: (result: AiSearchResult) => void;
}

/**
 * "Zapytaj AI" — natural-language search assistant. Opens a textarea, sends the
 * question to /api/ai-search and hands the resolved filters back to SearchView.
 */
export function AiSearch({ onApply }: AiSearchProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const q = question.trim();
    if (q.length < 3) {
      setError("Opisz czego szukasz (min. 3 znaki).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data } = await axios.post<{
        data: AiSearchResult | null;
        error: { message: string } | null;
      }>("/api/ai-search", { question: q });

      if (data.error || !data.data) {
        setError(data.error?.message ?? "Nie udało się przetworzyć zapytania.");
        return;
      }
      onApply(data.data);
      setOpen(false);
      setQuestion("");
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
    // Enter sends, Shift+Enter = newline
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

      {/* Question panel */}
      {open && (
        <div className="glass-panel mt-3 p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles size={13} aria-hidden />
              Opisz czego szukasz własnymi słowami
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
              Enter wysyła · Shift+Enter nowa linia
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
              {loading ? "Pytam AI…" : "Wyślij do AI"}
            </button>
          </div>

          {error && (
            <p className="soft-error mt-2 px-3 py-1.5 text-xs">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
