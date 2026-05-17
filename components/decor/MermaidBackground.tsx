import { Dolphin, Shell } from "./MermaidShapes";

/**
 * Fixed full-viewport decorative background — aurora blobs, light rays,
 * underwater seabed silhouette and a few drifting dolphins / shells.
 * Purely visual: pointer-events disabled, no logic.
 */
export function MermaidBackground() {
  return (
    <div className="bg-canvas" aria-hidden>
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />
      <div className="aurora a4" />
      <div className="aurora a5" />
      <div className="rays" />
      <div className="seabed" />
      <Dolphin
        uid="bg1"
        tone="aqua"
        size={92}
        className="absolute"
        style={{ bottom: "26px", left: "7%", animation: "floatD 7.5s ease-in-out infinite" }}
      />
      <Dolphin
        uid="bg2"
        tone="violet"
        size={70}
        className="absolute"
        style={{ bottom: "44px", right: "11%", animation: "float 8.5s ease-in-out infinite -2s" }}
      />
      <Shell
        uid="bg1"
        tone="blush"
        size={58}
        className="absolute"
        style={{ bottom: "16px", right: "38%", animation: "floatB 6s ease-in-out infinite -3s" }}
      />
    </div>
  );
}
