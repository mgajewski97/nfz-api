import { Dolphin, Shell, Pearl, Gem, Swirl } from "./MermaidShapes";

/**
 * Floating decorative cluster for the home hero — shells, pearls, gems,
 * dolphins and swirls drifting on the right side. Purely visual.
 * Hidden on small screens to keep the mobile hero uncluttered.
 */
export function HeroDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 select-none lg:block"
      aria-hidden
    >
      {/* caustic shimmer behind the cluster */}
      <div className="caustics opacity-60" />

      <Shell
        uid="h1"
        tone="aqua"
        size={104}
        className="absolute"
        style={{ top: "14%", left: "32%", animation: "float 6s ease-in-out infinite" }}
      />
      <Pearl
        uid="h1"
        tone="blush"
        size={92}
        className="absolute"
        style={{ top: "16%", right: "16%", animation: "floatC 7.5s ease-in-out infinite -1s" }}
      />
      <Gem
        uid="h1"
        tone="violet"
        size={58}
        className="absolute"
        style={{ top: "32%", left: "44%", animation: "floatB 5.5s ease-in-out infinite -2s" }}
      />
      <Pearl
        uid="h2"
        tone="aqua"
        size={64}
        className="absolute"
        style={{ top: "42%", left: "24%", animation: "float 6.5s ease-in-out infinite -3s" }}
      />
      <Dolphin
        uid="h1"
        tone="aqua"
        size={104}
        className="absolute"
        style={{ top: "50%", left: "40%", animation: "floatD 7s ease-in-out infinite -1.5s" }}
      />
      <Swirl
        uid="h1"
        tone="violet"
        size={78}
        className="absolute"
        style={{ top: "44%", right: "18%", animation: "floatC 8s ease-in-out infinite -2.5s" }}
      />
      <Gem
        uid="h2"
        tone="blush"
        size={48}
        className="absolute"
        style={{ top: "58%", right: "26%", animation: "floatB 6s ease-in-out infinite -4s" }}
      />
      <Dolphin
        uid="h2"
        tone="violet"
        size={70}
        className="absolute"
        style={{ top: "66%", left: "20%", animation: "float 7.5s ease-in-out infinite -2s" }}
      />
      <Shell
        uid="h2"
        tone="gold"
        size={66}
        className="absolute"
        style={{ top: "70%", right: "12%", animation: "floatD 6.5s ease-in-out infinite -3.5s" }}
      />
      <Pearl
        uid="h3"
        tone="violet"
        size={42}
        className="absolute"
        style={{ top: "80%", left: "46%", animation: "floatC 5.5s ease-in-out infinite -1s" }}
      />
    </div>
  );
}
