/**
 * Hero visual — chrome orbs, holographic shells, hearts, pearl teardrop and
 * sparkle stars. Markup + SVG copied from docs/nfz_mermaidcore.html (.hero-visual),
 * with HTML attributes converted to JSX. Purely decorative.
 */
export function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="caustic-layer" />

      {/* Chrome iridescent orbs */}
      <div
        className="chrome-orb co1"
        style={{
          boxShadow:
            "0 6px 28px rgba(167,139,250,0.32),0 0 0 1px rgba(255,255,255,0.38),inset -6px -6px 18px rgba(30,10,60,0.2),inset 3px 3px 12px rgba(255,255,255,0.42)",
        }}
      />
      <div
        className="chrome-orb co2"
        style={{
          boxShadow:
            "0 5px 22px rgba(103,232,249,0.3),0 0 0 1px rgba(255,255,255,0.32),inset -4px -4px 12px rgba(30,10,60,0.16),inset 2px 2px 8px rgba(255,255,255,0.4)",
        }}
      />
      <div
        className="chrome-orb co3"
        style={{
          boxShadow:
            "0 4px 18px rgba(232,121,249,0.28),0 0 0 1px rgba(255,255,255,0.3)",
        }}
      />
      <div
        className="chrome-orb co4"
        style={{
          boxShadow:
            "0 3px 14px rgba(167,243,208,0.3),0 0 0 1px rgba(255,255,255,0.25)",
        }}
      />

      {/* Shell 1 — large scallop, top-left, pink-lavender */}
      <div className="holo-shell hs1">
        <svg width="115" height="105" viewBox="0 0 115 105" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sh1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(248,187,255,0.95)" />
              <stop offset="22%" stopColor="rgba(255,220,240,0.9)" />
              <stop offset="45%" stopColor="rgba(186,230,255,0.92)" />
              <stop offset="68%" stopColor="rgba(216,180,254,0.9)" />
              <stop offset="88%" stopColor="rgba(255,205,220,0.9)" />
              <stop offset="100%" stopColor="rgba(248,187,255,0.95)" />
            </linearGradient>
            <linearGradient id="sh1s" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(248,187,255,0.9)" />
              <stop offset="50%" stopColor="rgba(186,230,255,0.85)" />
              <stop offset="100%" stopColor="rgba(167,243,208,0.8)" />
            </linearGradient>
          </defs>
          <path d="M57 98 C40 84 10 70 5 44 C2 26 12 8 27 5 C36 3 46 7 57 7 C68 7 78 3 87 5 C102 8 112 26 109 44 C104 70 74 84 57 98Z" fill="url(#sh1)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M57 98 C40 84 10 70 5 44 C2 26 12 8 27 5 C36 3 46 7 57 7 C68 7 78 3 87 5 C102 8 112 26 109 44 C104 70 74 84 57 98Z" fill="url(#sh1s)" opacity="0.35" />
          <line x1="57" y1="98" x2="6" y2="40" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="10" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="22" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="36" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="57" y2="7" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="78" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="92" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="104" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          <line x1="57" y1="98" x2="108" y2="40" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
          <ellipse cx="30" cy="28" rx="18" ry="10" fill="rgba(255,255,255,0.35)" transform="rotate(-35 30 28)" />
          <ellipse cx="22" cy="22" rx="7" ry="4" fill="rgba(255,255,255,0.5)" transform="rotate(-35 22 22)" />
          <path d="M5 44 Q2 36 7 32" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Shell 2 — medium scallop, right side, cyan-mint */}
      <div className="holo-shell hs2">
        <svg width="85" height="78" viewBox="0 0 85 78" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sh2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(186,230,255,0.9)" />
              <stop offset="30%" stopColor="rgba(167,243,208,0.88)" />
              <stop offset="58%" stopColor="rgba(216,180,254,0.85)" />
              <stop offset="80%" stopColor="rgba(186,230,255,0.88)" />
              <stop offset="100%" stopColor="rgba(167,243,208,0.9)" />
            </linearGradient>
          </defs>
          <path d="M42 73 C30 62 8 52 4 33 C2 20 9 6 21 4 C28 3 35 5 42 5 C49 5 56 3 63 4 C75 6 82 20 80 33 C76 52 54 62 42 73Z" fill="url(#sh2)" stroke="rgba(255,255,255,0.38)" strokeWidth="0.8" />
          <line x1="42" y1="73" x2="5" y2="30" stroke="rgba(255,255,255,0.52)" strokeWidth="1" />
          <line x1="42" y1="73" x2="8" y2="16" stroke="rgba(255,255,255,0.48)" strokeWidth="1" />
          <line x1="42" y1="73" x2="18" y2="6" stroke="rgba(255,255,255,0.48)" strokeWidth="1" />
          <line x1="42" y1="73" x2="32" y2="4" stroke="rgba(255,255,255,0.48)" strokeWidth="1" />
          <line x1="42" y1="73" x2="42" y2="5" stroke="rgba(255,255,255,0.52)" strokeWidth="1" />
          <line x1="42" y1="73" x2="52" y2="4" stroke="rgba(255,255,255,0.48)" strokeWidth="1" />
          <line x1="42" y1="73" x2="66" y2="6" stroke="rgba(255,255,255,0.48)" strokeWidth="1" />
          <line x1="42" y1="73" x2="76" y2="16" stroke="rgba(255,255,255,0.48)" strokeWidth="1" />
          <line x1="42" y1="73" x2="79" y2="30" stroke="rgba(255,255,255,0.48)" strokeWidth="1" />
          <ellipse cx="22" cy="21" rx="13" ry="7.5" fill="rgba(255,255,255,0.32)" transform="rotate(-35 22 21)" />
          <ellipse cx="16" cy="15" rx="5" ry="3" fill="rgba(255,255,255,0.48)" transform="rotate(-35 16 15)" />
        </svg>
      </div>

      {/* Holographic heart 1 — large, pink-lavender */}
      <div className="holo-crystal hc1">
        <svg width="78" height="72" viewBox="0 0 78 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="hrt1g" cx="45%" cy="38%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="18%" stopColor="rgba(255,210,240,0.9)" />
              <stop offset="42%" stopColor="rgba(248,187,255,0.88)" />
              <stop offset="65%" stopColor="rgba(216,180,254,0.85)" />
              <stop offset="85%" stopColor="rgba(186,230,255,0.82)" />
              <stop offset="100%" stopColor="rgba(167,243,208,0.78)" />
            </radialGradient>
            <radialGradient id="hrt1s" cx="45%" cy="38%" r="60%">
              <stop offset="0%" stopColor="rgba(248,187,255,0.6)" />
              <stop offset="50%" stopColor="rgba(186,230,255,0.4)" />
              <stop offset="100%" stopColor="rgba(167,243,208,0.3)" />
            </radialGradient>
          </defs>
          <path d="M39 66 C26 56 4 44 4 26 C4 13 13 5 24 7 C30 8 35 13 39 19 C43 13 48 8 54 7 C65 5 74 13 74 26 C74 44 52 56 39 66Z" fill="url(#hrt1g)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
          <path d="M39 66 C26 56 4 44 4 26 C4 13 13 5 24 7 C30 8 35 13 39 19 C43 13 48 8 54 7 C65 5 74 13 74 26 C74 44 52 56 39 66Z" fill="url(#hrt1s)" opacity="0.4" />
          <ellipse cx="24" cy="18" rx="10" ry="7" fill="rgba(255,255,255,0.5)" transform="rotate(-35 24 18)" />
          <ellipse cx="20" cy="14" rx="4" ry="3" fill="rgba(255,255,255,0.72)" transform="rotate(-35 20 14)" />
          <ellipse cx="54" cy="18" rx="7" ry="5" fill="rgba(255,255,255,0.3)" transform="rotate(30 54 18)" />
          <circle cx="30" cy="10" r="2.2" fill="rgba(255,255,255,0.8)" />
          <circle cx="27" cy="7" r="1" fill="rgba(255,255,255,0.9)" />
        </svg>
      </div>

      {/* Holographic heart 2 — medium, cyan-mint */}
      <div className="holo-crystal hc2">
        <svg width="56" height="52" viewBox="0 0 56 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="hrt2g" cx="42%" cy="36%" r="62%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.94)" />
              <stop offset="20%" stopColor="rgba(186,230,255,0.9)" />
              <stop offset="48%" stopColor="rgba(167,243,208,0.86)" />
              <stop offset="72%" stopColor="rgba(216,180,254,0.82)" />
              <stop offset="100%" stopColor="rgba(248,187,255,0.78)" />
            </radialGradient>
          </defs>
          <path d="M28 48 C18 40 2 31 2 18 C2 9 9 3 17 5 C21 6 25 10 28 14 C31 10 35 6 39 5 C47 3 54 9 54 18 C54 31 38 40 28 48Z" fill="url(#hrt2g)" stroke="rgba(255,255,255,0.42)" strokeWidth="0.8" />
          <path d="M28 48 C18 40 2 31 2 18 C2 9 9 3 17 5 C21 6 25 10 28 14 C31 10 35 6 39 5 C47 3 54 9 54 18 C54 31 38 40 28 48Z" fill="rgba(167,243,208,0.22)" opacity="0.5" />
          <ellipse cx="16" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.48)" transform="rotate(-32 16 13)" />
          <ellipse cx="13" cy="10" rx="3" ry="2" fill="rgba(255,255,255,0.7)" transform="rotate(-32 13 10)" />
          <circle cx="21" cy="7" r="1.6" fill="rgba(255,255,255,0.78)" />
        </svg>
      </div>

      {/* Holographic pearl teardrop */}
      <div className="holo-tube">
        <svg width="52" height="72" viewBox="0 0 52 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="td1g" cx="38%" cy="30%" r="65%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
              <stop offset="15%" stopColor="rgba(255,220,245,0.9)" />
              <stop offset="35%" stopColor="rgba(216,180,254,0.88)" />
              <stop offset="58%" stopColor="rgba(186,230,255,0.85)" />
              <stop offset="78%" stopColor="rgba(167,243,208,0.82)" />
              <stop offset="100%" stopColor="rgba(248,187,255,0.78)" />
            </radialGradient>
            <radialGradient id="td1s" cx="38%" cy="30%" r="65%">
              <stop offset="0%" stopColor="rgba(248,187,255,0.5)" />
              <stop offset="60%" stopColor="rgba(186,230,255,0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <path d="M26 2 C26 2 4 28 4 44 C4 58 14 70 26 70 C38 70 48 58 48 44 C48 28 26 2 26 2Z" fill="url(#td1g)" stroke="rgba(255,255,255,0.42)" strokeWidth="0.8" />
          <path d="M26 2 C26 2 4 28 4 44 C4 58 14 70 26 70 C38 70 48 58 48 44 C48 28 26 2 26 2Z" fill="url(#td1s)" opacity="0.45" />
          <ellipse cx="16" cy="34" rx="6" ry="10" fill="rgba(255,255,255,0.55)" transform="rotate(-20 16 34)" />
          <ellipse cx="14" cy="28" rx="3" ry="5" fill="rgba(255,255,255,0.75)" transform="rotate(-20 14 28)" />
          <circle cx="26" cy="8" r="2.5" fill="rgba(255,255,255,0.85)" />
          <circle cx="24" cy="5" r="1.2" fill="rgba(255,255,255,0.95)" />
          <ellipse cx="26" cy="50" rx="10" ry="10" fill="rgba(255,255,255,0.18)" />
        </svg>
      </div>

      {/* Sparkle crosses */}
      <div className="holo-star s1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <defs>
            <linearGradient id="vs1" x1="0" y1="0" x2="16" y2="16">
              <stop stopColor="#e879f9" />
              <stop offset="1" stopColor="#67e8f9" />
            </linearGradient>
          </defs>
          <line x1="8" y1="0" x2="8" y2="16" stroke="url(#vs1)" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="url(#vs1)" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="2" y1="2" x2="14" y2="14" stroke="url(#vs1)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="14" y1="2" x2="2" y2="14" stroke="url(#vs1)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <circle cx="8" cy="8" r="1.5" fill="#e879f9" />
        </svg>
      </div>
      <div className="holo-star s2">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <line x1="5.5" y1="0" x2="5.5" y2="11" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="0" y1="5.5" x2="11" y2="5.5" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="5.5" cy="5.5" r="1.1" fill="#c4b5fd" />
        </svg>
      </div>
      <div className="holo-star s3">
        <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
          <defs>
            <linearGradient id="vs3" x1="0" y1="0" x2="19" y2="19">
              <stop stopColor="#67e8f9" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <line x1="9.5" y1="0" x2="9.5" y2="19" stroke="url(#vs3)" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="0" y1="9.5" x2="19" y2="9.5" stroke="url(#vs3)" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="2.8" y1="2.8" x2="16.2" y2="16.2" stroke="url(#vs3)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="16.2" y1="2.8" x2="2.8" y2="16.2" stroke="url(#vs3)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <circle cx="9.5" cy="9.5" r="1.8" fill="#67e8f9" />
        </svg>
      </div>
      <div className="holo-star s4">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="5" y1="0" x2="5" y2="10" stroke="#f472b6" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="0" y1="5" x2="10" y2="5" stroke="#f472b6" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="5" cy="5" r="1" fill="#fda4af" />
        </svg>
      </div>
    </div>
  );
}
