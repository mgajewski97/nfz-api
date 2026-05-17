/**
 * Decorative mermaidcore SVG illustrations — dolphins, scallop shells,
 * pearls, crystal gems and swirls. Purely visual, no logic.
 * Each shape takes a unique `uid` so gradient defs never collide.
 */

interface ShapeProps {
  uid: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const TONES = {
  violet: ["#e879f9", "#a78bfa", "#818cf8"],
  aqua: ["#a7f3e8", "#67e8f9", "#34d399"],
  blush: ["#fbcfe8", "#f0abfc", "#c4b5fd"],
  gold: ["#fde68a", "#fbbf24", "#f472b6"],
} as const;

type Tone = keyof typeof TONES;

/* ─── Dolphin — leaping, facing right ───────────────────────────────────────── */
export function Dolphin({
  uid,
  size = 88,
  tone = "aqua",
  className,
  style,
}: ShapeProps & { tone?: Tone }) {
  const g = `dolphin-${uid}`;
  const [c1, c2, c3] = TONES[tone];
  return (
    <div className={className} style={style} aria-hidden>
      <svg width={size} height={size * 0.78} viewBox="0 0 100 78" fill="none">
        <defs>
          <linearGradient id={g} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="55%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        </defs>
        {/* body */}
        <path
          d="M6 52 Q 24 8 64 14 Q 80 17 94 4 Q 88 26 68 32 Q 82 38 84 60 Q 70 46 54 46 Q 32 47 6 52 Z"
          fill={`url(#${g})`}
          opacity="0.95"
        />
        {/* dorsal fin */}
        <path d="M44 20 Q 50 4 60 8 Q 52 14 50 26 Z" fill={c3} opacity="0.9" />
        {/* belly highlight */}
        <path
          d="M16 48 Q 34 40 56 42 Q 38 44 18 50 Z"
          fill="#ffffff"
          opacity="0.45"
        />
        {/* eye */}
        <circle cx="24" cy="38" r="2.4" fill="#2e0a5a" opacity="0.7" />
        <circle cx="23" cy="37" r="0.9" fill="#fff" />
      </svg>
    </div>
  );
}

/* ─── Scallop shell ─────────────────────────────────────────────────────────── */
export function Shell({
  uid,
  size = 72,
  tone = "violet",
  className,
  style,
}: ShapeProps & { tone?: Tone }) {
  const g = `shell-${uid}`;
  const [c1, c2, c3] = TONES[tone];
  return (
    <div className={className} style={style} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 80 76" fill="none">
        <defs>
          <linearGradient id={g} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="50%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        </defs>
        {/* fan body */}
        <path
          d="M40 70 C 8 70 4 30 14 16 C 20 34 26 40 26 40 C 24 22 30 12 34 8 C 36 28 38 38 38 38 C 40 18 40 10 40 6 C 40 10 42 18 42 38 C 42 38 44 28 46 8 C 50 12 56 22 54 40 C 54 40 60 34 66 16 C 76 30 72 70 40 70 Z"
          fill={`url(#${g})`}
          opacity="0.95"
        />
        {/* ribs */}
        {[20, 30, 40, 50, 60].map((x) => (
          <path
            key={x}
            d={`M40 68 L ${x} 22`}
            stroke="#ffffff"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.5"
          />
        ))}
        {/* hinge highlight */}
        <ellipse cx="40" cy="66" rx="6" ry="4" fill="#fff" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ─── Pearl / iridescent orb ────────────────────────────────────────────────── */
export function Pearl({
  uid,
  size = 56,
  tone = "blush",
  className,
  style,
}: ShapeProps & { tone?: Tone }) {
  const g = `pearl-${uid}`;
  const [c1, c2] = TONES[tone];
  return (
    <div className={className} style={style} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
        <defs>
          <radialGradient id={g} cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="46%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </radialGradient>
        </defs>
        <circle cx="30" cy="30" r="26" fill={`url(#${g})`} opacity="0.95" />
        <circle cx="30" cy="30" r="26" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
        <ellipse cx="22" cy="20" rx="7" ry="4.5" fill="#fff" opacity="0.85" transform="rotate(-30 22 20)" />
      </svg>
    </div>
  );
}

/* ─── Crystal gem ───────────────────────────────────────────────────────────── */
export function Gem({
  uid,
  size = 52,
  tone = "violet",
  className,
  style,
}: ShapeProps & { tone?: Tone }) {
  const g = `gem-${uid}`;
  const [c1, c2, c3] = TONES[tone];
  return (
    <div className={className} style={style} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 56 64" fill="none">
        <defs>
          <linearGradient id={g} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="55%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        </defs>
        <path d="M28 4 L48 22 L28 60 L8 22 Z" fill={`url(#${g})`} opacity="0.95" />
        <path d="M28 4 L48 22 L28 30 Z" fill="#fff" opacity="0.34" />
        <path d="M8 22 L28 30 L28 60 Z" fill="#2e0a5a" opacity="0.12" />
        <path d="M28 4 L28 60 M8 22 L48 22" stroke="#fff" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}

/* ─── Holographic swirl ─────────────────────────────────────────────────────── */
export function Swirl({
  uid,
  size = 64,
  tone = "aqua",
  className,
  style,
}: ShapeProps & { tone?: Tone }) {
  const g = `swirl-${uid}`;
  const [c1, c2, c3] = TONES[tone];
  return (
    <div className={className} style={style} aria-hidden>
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
        <defs>
          <linearGradient id={g} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="50%" stopColor={c2} />
            <stop offset="100%" stopColor={c3} />
          </linearGradient>
        </defs>
        <path
          d="M14 50 C 8 34 18 14 36 16 C 50 18 52 36 40 40 C 30 43 24 34 30 28"
          stroke={`url(#${g})`}
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.92"
        />
      </svg>
    </div>
  );
}
