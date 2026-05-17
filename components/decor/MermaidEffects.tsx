"use client";

import { useEffect } from "react";

/**
 * Decorative client-side effects:
 *  B1 — animated glass bubbles rising through the viewport
 *  B2 — scroll-reveal stagger for cards / list items
 * Purely visual. Adds/removes only decorative DOM; no app logic touched.
 */

const BUBBLE_TINTS = [
  "232, 121, 249", // pink
  "167, 139, 250", // lavender
  "103, 232, 249", // cyan
  "52, 211, 153", // mint
  "255, 255, 255", // white
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function MermaidEffects() {
  useEffect(() => {
    // ── B1: glass bubbles ──────────────────────────────────────────────────
    let layer = document.getElementById("bubblesLayer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "bubblesLayer";
      layer.setAttribute("aria-hidden", "true");
      // insert as the second child of body (after bg-canvas)
      const second = document.body.children[1] ?? null;
      document.body.insertBefore(layer, second);
    }
    layer.innerHTML = "";

    for (let i = 0; i < 28; i++) {
      const b = document.createElement("div");
      b.className = "gb";
      const size = rand(8, 62);
      const tint = BUBBLE_TINTS[i % BUBBLE_TINTS.length];
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.style.left = `${rand(0, 100)}%`;
      b.style.background = `radial-gradient(circle at 36% 26%, rgba(255,255,255,0.95), rgba(${tint},0.38) 60%, rgba(${tint},0.12))`;
      b.style.border = "1px solid rgba(255,255,255,0.52)";
      b.style.boxShadow = `0 0 12px rgba(${tint},0.4)`;
      b.style.animationDuration = `${rand(14, 36)}s`;
      b.style.animationDelay = `${-rand(0, 38)}s`;
      layer.appendChild(b);
    }

    // ── B2: scroll-reveal stagger ──────────────────────────────────────────
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const index = cards.indexOf(el);
          const delay = (index % 4) * 80;
          window.setTimeout(() => {
            el.style.transition =
              "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.08 },
    );

    cards.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      layer?.remove();
    };
  }, []);

  return null;
}
