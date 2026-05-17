import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./mermaid-theme.css";

export const metadata: Metadata = {
  title: "Statystyki JGP – NFZ",
  description:
    "Przeglądarka danych statystycznych hospitalizacji w systemie Jednorodnych Grup Pacjentów NFZ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        {/* Google Fonts — copied verbatim from docs/nfz_mermaidcore.html */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500&family=Space+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* ── Background canvas (verbatim from reference) ── */}
        <div className="bg-canvas" aria-hidden="true">
          <div className="aurora a1" />
          <div className="aurora a2" />
          <div className="aurora a3" />
          <div className="aurora a4" />
          <div className="aurora a5" />
          <div className="rays" />
          <div className="seabed" />
        </div>
        <div className="bubbles-layer" aria-hidden="true" id="bubblesLayer" />
        <div className="holo-strip" aria-hidden="true" />

        {/* ── All page content wrapped in .page ── */}
        <div className="page">
          <Providers>{children}</Providers>
        </div>

        <div className="holo-strip" aria-hidden="true" />

        {/* Bubble generation + decorative interactions (verbatim reference script) */}
        <Script src="/mermaid-theme.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
