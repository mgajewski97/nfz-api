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
import { HeroVisual } from "@/components/decor/HeroVisual";
import { HeroScatter } from "@/components/decor/HeroScatter";
import { TitleSparkles } from "@/components/decor/TitleSparkles";

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
    tint: "text-primary bg-primary/10",
  },
  {
    icon: Table2,
    title: "Tabele statystyczne / Statistical tables",
    description: "Przeglądaj dostępne tabele statystyczne NFZ / Browse available NFZ statistical tables",
    href: "/search?view=tables",
    badge: "Indeks",
    tint: "text-[hsl(190_42%_34%)] bg-accent",
  },
  {
    icon: HeartPulse,
    title: "Dane medyczne / Medical data",
    description: "Przeglądaj rozpoznania ICD-10 i procedury ICD-9 / Browse ICD-10 diagnoses and ICD-9 procedures",
    href: "/search?type=icd",
    badge: "ICD",
    tint: "text-secondary-foreground bg-secondary",
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
    <div className="app-atmosphere">

      {/* Top bar */}
      <header className="header-surface">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex min-h-[44px] items-center gap-3">
            <span className="sparkle text-xs font-semibold tracking-widest text-primary uppercase">
              NFZ
            </span>
            <span className="h-4 w-px bg-border" />
            <span className="text-sm text-foreground">
              Statystyki świadczeń szpitalnych
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/search"
              className="rounded-full px-3 py-1.5 hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              Wyszukiwarka
            </Link>
            <Link
              href="#jak-to-dziala"
              className="rounded-full px-3 py-1.5 hover:bg-secondary hover:text-secondary-foreground transition-colors"
            >
              Jak to działa
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" aria-label="Sekcja główna">
        <HeroScatter />
        <div className="hero-content relative z-10">
          <div className="hero-badge" role="note">
            <div className="badge-dot" aria-hidden="true" />
            Otwarte dane — Narodowy Fundusz Zdrowia
          </div>
          <h1 className="hero-title">
            <span className="title-main" data-text={"Statystyki\nhospitalizacji"}>
              Statystyki<br />hospitalizacji
              <TitleSparkles />
            </span>
            <span className="title-jgp" data-text="JGP" aria-label="JGP">
              <span className="char">J</span>
              <span className="char">G</span>
              <span className="char">P</span>
            </span>
          </h1>
          <p className="hero-desc">
            Aplikacja udostępnia dane statystyczne NFZ dotyczące hospitalizacji
            w systemie Jednorodnych Grup Pacjentów. Przeszukuj świadczenia,
            przeglądaj tabele z podziałem na lata i eksportuj wyniki.
          </p>
          <HomeSearchBar />
          <p className="search-hint">
            API:{" "}
            <a
              href="https://api.nfz.gov.pl/app-stat-api-jgp"
              target="_blank"
              rel="noopener noreferrer"
            >
              api.nfz.gov.pl/app-stat-api-jgp
            </a>
          </p>
        </div>

        <HeroVisual />
      </section>

      {/* Summary stats strip — pastel KPI cards */}
      <section className="px-6 py-4">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <dl
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 11rem), 1fr))" }}
          >
            {SUMMARY_STATS.map((s) => (
              <div key={s.label} className="surface-card holo-top glow-hover rounded-2xl px-4 py-4">
                <dt className="text-xs text-muted-foreground mb-0.5">{s.label}</dt>
                <dd className="text-xl font-semibold text-foreground tabular-nums">
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
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            <span className="h-2 w-2 rounded-full bg-holo-2 shadow-[0_0_14px_hsl(var(--holo-2)/0.75)]" aria-hidden />
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
                  <Card className="h-full holo-border glow-hover">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-xl transition-colors ${tile.tint}`}>
                          <Icon size={18} />
                        </div>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {tile.badge}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="text-sm font-semibold text-foreground mb-2 flex items-center justify-between gap-2">
                        {tile.title}
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                        />
                      </CardTitle>
                      <p className="text-xs text-muted-foreground leading-relaxed">
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
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            <span className="h-2 w-2 rounded-full bg-holo-3 shadow-[0_0_14px_hsl(var(--holo-3)/0.75)]" aria-hidden />
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
                    <div className="hidden sm:block absolute top-4 left-[calc(50%+12px)] right-0 h-px bg-gradient-to-r from-holo-1/50 to-transparent" />
                    <div className="sm:hidden absolute left-4 top-10 bottom-0 w-px bg-gradient-to-b from-holo-1/50 to-transparent" />
                  </>
                )}

                {/* Step number — pastel circle */}
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center ring-1 ring-primary/20 sm:mx-auto">
                  {s.step}
                </div>

                <div className="sm:text-center">
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data scope info */}
        <section className="section-panel p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Zakres dostępnych danych
          </h2>
          <div
            className="grid gap-6 text-sm"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))" }}
          >
            <div>
              <p className="font-medium text-foreground mb-2">Katalogi świadczeń</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                {[
                  ["1a", "Jednorodne Grupy Pacjentów"],
                  ["1b", "Świadczenia odrębne"],
                  ["1c", "Świadczenia do sumowania"],
                  ["1d", "Radioterapia"],
                  ["1w", "Świadczenia wysokospecjalistyczne"],
                ].map(([code, name]) => (
                  <li key={code} className="flex items-center gap-2">
                    <span className="font-mono text-primary/70 w-5">{code}</span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Widoki statystyczne</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                {[
                  "Dane podstawowe (hospitalizacje, czas pobytu, wartości)",
                  "Podział wg płci pacjenta",
                  "Podział wg grup wiekowych",
                  "Podział wg trybu przyjęcia",
                  "Podział wg trybu wypisu",
                  "Podział wg zakresu świadczeń",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-holo-2" aria-hidden>◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Filtry i wymiary</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                {[
                  "16 Oddziałów Wojewódzkich NFZ",
                  "5 typów szpitali",
                  "Dane roczne i okresowe",
                  "Eksport CSV i XLSX",
                  "Polskie etykiety kolumn",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-holo-2" aria-hidden>◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Przejdź do wyszukiwarki
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="header-surface mt-12">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            Dane źródłowe:{" "}
            <span className="font-medium text-foreground">
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
