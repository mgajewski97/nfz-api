import Link from "next/link";
import {
  Search,
  Table2,
  HeartPulse,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HomeSearchBar } from "@/components/search/HomeSearchBar";

// ─── Mock summary stats ───────────────────────────────────────────────────────

const SUMMARY_STATS = [
  { label: "Sekcji JGP", value: "19" },
  { label: "Katalogów świadczeń", value: "5" },
  { label: "Oddziałów Wojewódzkich", value: "16" },
  { label: "Dane dostępne od", value: "2015" },
];

// ─── Main tiles ───────────────────────────────────────────────────────────────

const TILES = [
  {
    icon: Search,
    title: "Wyszukaj świadczenie / Search service",
    description: "Szukaj po nazwie, kodzie lub słowie kluczowym / Search by name, code, or keyword",
    href: "/search",
    badge: "Słownik",
  },
  {
    icon: Table2,
    title: "Tabele statystyczne / Statistical tables",
    description: "Przeglądaj dostępne tabele statystyczne NFZ / Browse available NFZ statistical tables",
    href: "/search?view=tables",
    badge: "Indeks",
  },
  {
    icon: HeartPulse,
    title: "Dane medyczne / Medical data",
    description: "Przeglądaj rozpoznania ICD-10 i procedury ICD-9 / Browse ICD-10 diagnoses and ICD-9 procedures",
    href: "/search?type=icd",
    badge: "ICD",
  },
];

// ─── Process steps ────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: "1",
    title: "Znajdź świadczenie",
    detail:
      "Wpisz nazwę, kod JGP lub wybierz sekcję kliniczną. Słownik pobierany jest bezpośrednio z API NFZ.",
  },
  {
    step: "2",
    title: "Wybierz tabelę i rok",
    detail:
      "Każde świadczenie ma przypisane tabele statystyczne, pogrupowane według roku i okresu sprawozdawczego.",
  },
  {
    step: "3",
    title: "Analizuj dane",
    detail:
      "Przeglądaj dane podstawowe lub rozbitye wg płci, wieku, trybu przyjęcia/wypisu i zakresu świadczeń.",
  },
  {
    step: "4",
    title: "Eksportuj wyniki",
    detail:
      "Pobierz aktualnie widoczne dane jako CSV albo XLSX z polskimi etykietami kolumn i metadanymi.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex min-h-[44px] items-center gap-3">
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
              NFZ
            </span>
            <span className="h-4 w-px bg-slate-300" />
            <span className="text-sm text-slate-700">
              Statystyki świadczeń szpitalnych
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
            <Link href="/search" className="hover:text-slate-900 transition-colors">
              Wyszukiwarka
            </Link>
            <Link href="#jak-to-dziala" className="hover:text-slate-900 transition-colors">
              Jak to działa
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">
              Otwarte dane — Narodowy Fundusz Zdrowia
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 leading-snug mb-4">
              Statystyki hospitalizacji JGP
            </h1>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              Aplikacja udostępnia dane statystyczne NFZ dotyczące hospitalizacji
              w systemie Jednorodnych Grup Pacjentów. Przeszukuj świadczenia,
              przeglądaj tabele z podziałem na lata i eksportuj wyniki.
            </p>
            <HomeSearchBar />
            <p className="mt-3 text-xs text-slate-400">
              Dane pobierane z publicznego API NFZ:{" "}
              <span className="font-mono">api.nfz.gov.pl/app-stat-api-jgp</span>
            </p>
          </div>
        </div>
      </section>

      {/* Summary stats strip */}
      <section className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <dl
            className="grid gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 9rem), 1fr))" }}
          >
            {SUMMARY_STATS.map((s) => (
              <div key={s.label}>
                <dt className="text-xs text-slate-500 mb-0.5">{s.label}</dt>
                <dd className="text-xl font-semibold text-slate-800 tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">

        {/* Tiles */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
            Możliwości
          </h2>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))" }}
          >
            {TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link key={tile.title} href={tile.href} className="group block">
                  <Card className="h-full border-slate-200 bg-white hover:border-slate-400 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-md bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
                          <Icon size={18} />
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-slate-100 text-slate-500 font-normal"
                        >
                          {tile.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="text-sm font-semibold text-slate-800 mb-2 flex items-center justify-between">
                        {tile.title}
                        <ChevronRight
                          size={14}
                          className="text-slate-400 group-hover:text-slate-600 transition-colors"
                        />
                      </CardTitle>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {tile.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Process steps */}
        <section id="jak-to-dziala">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">
            Jak to działa
          </h2>
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))" }}
          >
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative flex gap-4 sm:flex-col sm:gap-3 sm:pr-6">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <>
                    {/* horizontal (desktop) */}
                    <div className="hidden sm:block absolute top-4 left-[calc(50%+12px)] right-0 h-px bg-slate-200" />
                    {/* vertical (mobile) */}
                    <div className="sm:hidden absolute left-4 top-10 bottom-0 w-px bg-slate-200" />
                  </>
                )}

                {/* Step number */}
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white text-sm font-semibold flex items-center justify-center sm:mx-auto">
                  {s.step}
                </div>

                <div className="sm:text-center">
                  <p className="text-sm font-semibold text-slate-800 mb-1">
                    {s.title}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data scope info */}
        <section className="border border-slate-200 rounded-lg bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            Zakres dostępnych danych
          </h2>
          <div
            className="grid gap-6 text-sm"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))" }}
          >
            <div>
              <p className="font-medium text-slate-700 mb-2">Katalogi świadczeń</p>
              <ul className="space-y-1 text-slate-500 text-xs">
                {[
                  ["1a", "Jednorodne Grupy Pacjentów"],
                  ["1b", "Świadczenia odrębne"],
                  ["1c", "Świadczenia do sumowania"],
                  ["1d", "Radioterapia"],
                  ["1w", "Świadczenia wysokospecjalistyczne"],
                ].map(([code, name]) => (
                  <li key={code} className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-5">{code}</span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-2">Widoki statystyczne</p>
              <ul className="space-y-1 text-slate-500 text-xs">
                {[
                  "Dane podstawowe (hospitalizacje, czas pobytu, wartości)",
                  "Podział wg płci pacjenta",
                  "Podział wg grup wiekowych",
                  "Podział wg trybu przyjęcia",
                  "Podział wg trybu wypisu",
                  "Podział wg zakresu świadczeń",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-slate-300">–</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-2">Filtry i wymiary</p>
              <ul className="space-y-1 text-slate-500 text-xs">
                {[
                  "16 Oddziałów Wojewódzkich NFZ",
                  "5 typów szpitali",
                  "Dane roczne i okresowe",
                  "Eksport CSV i XLSX",
                  "Polskie etykiety kolumn",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-slate-300">–</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              Przejdź do wyszukiwarki
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            Dane źródłowe:{" "}
            <span className="font-medium text-slate-500">
              Narodowy Fundusz Zdrowia
            </span>{" "}
            — publiczne API statystyk JGP
          </p>
          <p>Aplikacja analityczna · dane aktualizowane przez NFZ</p>
        </div>
      </footer>

    </div>
  );
}
