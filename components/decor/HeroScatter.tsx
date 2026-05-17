/**
 * Extra floating decoration spread across the hero band — glass bubbles,
 * holographic hearts and sparkle crosses. Fills the open space between the
 * headline and the hero visual. Purely decorative, sits behind content.
 */

function Heart({
  uid,
  size,
  c1,
  c2,
  c3,
  style,
}: {
  uid: string;
  size: number;
  c1: string;
  c2: string;
  c3: string;
  style?: React.CSSProperties;
}) {
  const g = `scatter-heart-${uid}`;
  return (
    <div style={{ position: "absolute", ...style }} aria-hidden>
      <svg width={size} height={size * 0.92} viewBox="0 0 56 52" fill="none">
        <defs>
          <radialGradient id={g} cx="42%" cy="36%" r="64%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.96)" />
            <stop offset="34%" stopColor={c1} />
            <stop offset="68%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </radialGradient>
        </defs>
        <path
          d="M28 48 C18 40 2 31 2 18 C2 9 9 3 17 5 C21 6 25 10 28 14 C31 10 35 6 39 5 C47 3 54 9 54 18 C54 31 38 40 28 48Z"
          fill={`url(#${g})`}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.8"
        />
        <ellipse cx="16" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.5)" transform="rotate(-32 16 13)" />
        <circle cx="21" cy="7" r="1.5" fill="rgba(255,255,255,0.8)" />
      </svg>
    </div>
  );
}

function Sparkle({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="holo-star"
      style={{ position: "absolute", animationDuration: "2.2s", ...style }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <line x1="8" y1="0" x2="8" y2="16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="0" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="2" y1="2" x2="14" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="14" y1="2" x2="2" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <circle cx="8" cy="8" r="1.5" fill={color} />
      </svg>
    </div>
  );
}

export function HeroScatter() {
  return (
    <div className="hero-scatter" aria-hidden="true">
      {/* Glass bubbles */}
      <div className="scatter-bubble" style={{ width: 40, height: 40, left: "36%", top: "16%", animation: "float 7s ease-in-out infinite" }} />
      <div className="scatter-bubble" style={{ width: 22, height: 22, left: "52%", top: "34%", animation: "floatB 6s ease-in-out infinite -1s" }} />
      <div className="scatter-bubble" style={{ width: 30, height: 30, left: "44%", top: "70%", animation: "floatC 8s ease-in-out infinite -2s" }} />
      <div className="scatter-bubble" style={{ width: 16, height: 16, left: "60%", top: "62%", animation: "float 5.5s ease-in-out infinite -1.5s" }} />
      <div className="scatter-bubble" style={{ width: 26, height: 26, left: "30%", top: "84%", animation: "floatD 6.5s ease-in-out infinite -3s" }} />
      <div className="scatter-bubble" style={{ width: 13, height: 13, left: "57%", top: "12%", animation: "floatB 5s ease-in-out infinite -0.5s" }} />

      {/* Holographic hearts */}
      <Heart
        uid="s1"
        size={44}
        c1="rgba(248,187,255,0.92)"
        c2="rgba(216,180,254,0.88)"
        c3="rgba(167,243,208,0.82)"
        style={{ left: "40%", top: "44%", animation: "floatC 6.5s ease-in-out infinite -1s" }}
      />
      <Heart
        uid="s2"
        size={30}
        c1="rgba(186,230,255,0.92)"
        c2="rgba(167,243,208,0.86)"
        c3="rgba(232,121,249,0.7)"
        style={{ left: "56%", top: "78%", animation: "floatB 7.5s ease-in-out infinite -2.5s" }}
      />
      <Heart
        uid="s3"
        size={26}
        c1="rgba(255,210,240,0.94)"
        c2="rgba(232,121,249,0.78)"
        c3="rgba(129,140,248,0.7)"
        style={{ left: "33%", top: "30%", animation: "floatD 6s ease-in-out infinite -1.8s" }}
      />

      {/* Sparkle crosses */}
      <Sparkle size={15} color="#e879f9" style={{ left: "48%", top: "20%", animationDelay: "0s" }} />
      <Sparkle size={11} color="#67e8f9" style={{ left: "62%", top: "46%", animationDelay: "0.6s" }} />
      <Sparkle size={13} color="#a78bfa" style={{ left: "38%", top: "62%", animationDelay: "1.1s" }} />
      <Sparkle size={10} color="#f472b6" style={{ left: "53%", top: "88%", animationDelay: "0.3s" }} />
    </div>
  );
}
