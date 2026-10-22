import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { QuietdeskVoiced } from "../demo/voiced";
import { T } from "./Promo";

// Listing thumbnail (1920 × 1080): official logo, the promise, and a real frame of the demo ad.

export function PromoThumbnail() {
  const w = 900;
  return (
    <AbsoluteFill style={{ backgroundColor: T.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 18% 28%, ${T.cyan}33 0%, transparent 45%), radial-gradient(circle at 88% 85%, ${T.orange}2b 0%, transparent 45%)` }} />
      <div style={{ position: "absolute", left: 110, top: 150, width: 820 }}>
        <Img src={staticFile("logo.png")} style={{ width: 620, height: (620 * 1024) / 1536 }} />
        <div style={{ marginTop: 26, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 76, lineHeight: 1.06, letterSpacing: -2, color: T.text }}>
          Turn ideas into <span style={{ color: T.cyan }}>voiced</span> video ads.
        </div>
        <div style={{ marginTop: 34, display: "inline-flex", padding: "16px 30px", borderRadius: 999, border: `2.5px solid ${T.cyan}`, backgroundColor: "rgba(24,215,245,0.08)", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 36, color: T.text }}>
          Free Community Edition · Claude Code skill
        </div>
      </div>
      <div style={{ position: "absolute", left: 960, top: 300, width: w, height: (w * 9) / 16, borderRadius: 26, overflow: "hidden", border: `2px solid ${T.line}`, boxShadow: "0 40px 120px rgba(0,0,0,0.6)", rotate: "-2deg" }}>
        <div style={{ width: 1920, height: 1080, scale: `${w / 1920}`, transformOrigin: "0 0" }}>
          {/* A real frame of the demo ad: the presenter holding the phone, hand lowered, smiling (demo second 11.2). */}
          <Sequence from={-Math.round(11.2 * 30)} layout="none">
            <QuietdeskVoiced layout="horizontal" ending="fin-description" audio={false} />
          </Sequence>
        </div>
      </div>
    </AbsoluteFill>
  );
}
