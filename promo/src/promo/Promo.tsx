import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import React from "react";
import { AbsoluteFill, Easing, Html5Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { QuietdeskVoiced } from "../demo/voiced";
import { captionLines, DEMO_CLIP, FPS, SCENES, scene, TIMINGS, wordAt, type CaptionLine } from "./timeline";

// Agensi launch trailer for the free Create Voiced Ad Community Edition (40 s). Every claim on screen
// matches the Community SKILL.md: Claude Code skill, Remotion templates, SVG character, ElevenLabs
// voiceover with timestamps (the user's own key, paid by usage), lip-sync, captions.

const { fontFamily: INTER } = loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const T = {
  bg: "#0C0F14",
  surface: "#141922",
  raised: "#1B222D",
  line: "#263040",
  text: "#EEF2F7",
  muted: "#8B97A8",
  cyan: "#18D7F5",
  cyanDeep: "#0AA9F0",
  orange: "#FF8A1F",
  amber: "#FFC21A",
};

const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sec = (s: number) => Math.round(s * FPS);

/** 0 → 1 from second `at`, eased. */
function useIn(at: number, duration = 0.5): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [sec(at), sec(at + duration)], [0, 1], { ...clamp, easing: OUT });
}

function usePop(at: number): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - sec(at), fps, config: { damping: 14, stiffness: 160, mass: 0.7 } });
}

/** Scene opacity: fades in and out at the edges of its window. */
function useSceneFade(from: number, to: number, fade = 0.35): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [sec(from), sec(from + fade), sec(to - fade), sec(to)], [0, 1, 1, 0], clamp);
}

// ── Shared pieces ──────────────────────────────────────────────────────────

function Backdrop() {
  const frame = useCurrentFrame();
  const glow = (color: string, x: number, y: number, r: number, speed: number, seed: number, opacity: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(frame / speed + seed) * 80 - r,
        top: y + Math.cos(frame / (speed * 1.3) + seed) * 60 - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ backgroundColor: T.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${T.line}55 1px, transparent 1px), linear-gradient(90deg, ${T.line}55 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          opacity: 0.5,
          translate: `0px ${(frame * 0.3) % 64}px`,
        }}
      />
      {glow(T.cyan, 380, 260, 520, 90, 1, 0.16)}
      {glow(T.orange, 1560, 820, 560, 110, 2, 0.13)}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}

function Logo({ width, style }: { width: number; style?: React.CSSProperties }) {
  // The official logo (promo/public/logo.png), used as is.
  return <Img src={staticFile("logo.png")} style={{ width, height: (width * 1024) / 1536, ...style }} />;
}

/** Headline whose words rise in one after another. */
function Headline({ text, at, size, color = T.text, accent, align = "left", stagger = 0.07 }: { text: string; at: number; size: number; color?: string; accent?: string[]; align?: "left" | "center"; stagger?: number }) {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: -size * 0.025, color, textAlign: align, display: "flex", flexWrap: "wrap", gap: `0 ${size * 0.26}px`, justifyContent: align === "center" ? "center" : "flex-start" }}>
      {words.map((w, i) => {
        const p = interpolate(frame, [sec(at + i * stagger), sec(at + i * stagger + 0.45)], [0, 1], { ...clamp, easing: OUT });
        const hot = accent?.some((a) => w.toLowerCase().startsWith(a));
        return (
          <span key={i} style={{ display: "inline-block", opacity: p, translate: `0px ${(1 - p) * size * 0.45}px`, color: hot ? T.cyan : undefined }}>
            {w}
          </span>
        );
      })}
    </div>
  );
}

function Pill({ children, p, color = T.text, bg = T.raised, border = T.line, size = 30 }: { children: React.ReactNode; p: number; color?: string; bg?: string; border?: string; size?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.4, padding: `${size * 0.42}px ${size * 0.75}px`, borderRadius: 999, backgroundColor: bg, border: `2px solid ${border}`, color, fontFamily: INTER, fontWeight: 600, fontSize: size, opacity: Math.min(1, p * 1.4), scale: `${0.85 + 0.15 * Math.min(1.05, p)}`, whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
}

function Check({ size = 30, color = T.cyan }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill={color} opacity="0.18" />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A window frame (terminal, editor, video). */
function Window({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ borderRadius: 22, backgroundColor: T.surface, border: `1.5px solid ${T.line}`, boxShadow: "0 40px 120px rgba(0,0,0,0.55)", overflow: "hidden", ...style }}>
      <div style={{ height: 52, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `1.5px solid ${T.line}`, backgroundColor: T.raised }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c, opacity: 0.85 }} />
        ))}
        <span style={{ marginLeft: 14, fontFamily: MONO, fontSize: 20, color: T.muted }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/** Captions of the promo narration: one line at a time, the spoken word in cyan. */
function Captions({ lines }: { lines: CaptionLine[] }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const line = lines.find((l) => t >= l.from - 0.08 && t <= l.to + 0.3);
  if (!line) return null;
  const p = interpolate(t, [line.from - 0.08, line.from + 0.1], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", opacity: p }}>
      <div style={{ maxWidth: 1500, padding: "14px 30px", borderRadius: 18, backgroundColor: "rgba(12,15,20,0.82)", border: `1.5px solid ${T.line}`, fontFamily: INTER, fontWeight: 600, fontSize: 38, color: T.text, display: "flex", flexWrap: "wrap", gap: "0 12px", justifyContent: "center" }}>
        {line.words.map((w, i) => (
          <span key={i} style={{ color: t >= w.from && t <= w.to + 0.05 ? T.cyan : t > w.to ? T.text : "rgba(238,242,247,0.55)" }}>
            {w.text}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Scenes ─────────────────────────────────────────────────────────────────

/** The Quietdesk ad, rendered live from the Community templates, in a player frame. */
/** `offset` = demo time − promo time (s): the ad shows demo second `promo + offset`. */
function DemoPlayer({ offset, width, label }: { offset: number; width: number; label: string }) {
  const height = (width * 9) / 16;
  return (
    <Window title={label} style={{ width }}>
      <div style={{ width, height, position: "relative", overflow: "hidden" }}>
        <div style={{ width: 1920, height: 1080, scale: `${width / 1920}`, transformOrigin: "0 0", position: "absolute", left: 0, top: 0 }}>
          <Sequence from={-sec(offset)} layout="none">
            <QuietdeskVoiced layout="horizontal" ending="fin-description" audio={false} />
          </Sequence>
        </div>
      </div>
    </Window>
  );
}

function Hook() {
  const s = scene("hook");
  const fade = useSceneFade(s.from, s.to);
  const frame = useCurrentFrame();
  const reveal = useIn(0.1, 1.1);
  const move = useIn(1.6, 0.7);
  const preview = usePop(2.0);
  const sweep = interpolate(frame, [sec(0.3), sec(1.4)], [-0.3, 1.3], clamp);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: interpolate(move, [0, 1], [960 - 420, 140]), top: interpolate(move, [0, 1], [540 - 290, 120]), width: interpolate(move, [0, 1], [840, 460]), opacity: reveal, scale: `${0.9 + 0.1 * reveal}`, filter: `blur(${(1 - reveal) * 12}px) drop-shadow(0 0 ${40 * (1 - move)}px rgba(24,215,245,0.35))` }}>
        <Logo width={interpolate(move, [0, 1], [840, 460])} />
        {/* Light sweep, clipped to the logo's own shape (its alpha channel). */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sweep * 100 - 12}%, rgba(255,255,255,0.55) ${sweep * 100}%, transparent ${sweep * 100 + 12}%)`, maskImage: `url(${staticFile("logo.png")})`, maskSize: "100% 100%", WebkitMaskImage: `url(${staticFile("logo.png")})`, WebkitMaskSize: "100% 100%" }} />
      </div>
      <div style={{ position: "absolute", left: 150, top: 470, width: 760, opacity: move }}>
        <Headline text="Turn ideas into voiced video ads." at={1.75} size={78} accent={["voiced"]} />
      </div>
      <div style={{ position: "absolute", left: 1000, top: 250, opacity: Math.min(1, preview * 1.3), scale: `${0.9 + 0.1 * preview}`, rotate: `${(1 - Math.min(1, preview)) * 3}deg` }}>
        <DemoPlayer offset={5.0} width={780} label="quietdesk-demo-16x9.mp4" />
      </div>
    </AbsoluteFill>
  );
}

const TASKS = [
  { label: "Write the script", word: "scripts", x: 150, y: 300, tool: "docs" },
  { label: "Record the voiceover", word: "recording", x: 1150, y: 280, tool: "audio" },
  { label: "Animate the scenes", word: "animating", x: 200, y: 600, tool: "motion" },
  { label: "Add captions", word: "captions", x: 1180, y: 580, tool: "subtitles" },
  { label: "Render the video", word: "takes", x: 690, y: 760, tool: "export" },
];

function Problem() {
  const s = scene("problem");
  const fade = useSceneFade(s.from, s.to);
  const frame = useCurrentFrame();
  const merge = interpolate(frame, [sec(9.4), sec(10.5)], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1) });
  const one = usePop(10.05);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120 }}>
        <Headline text="Scripts. Voiceovers. Animation. Captions." at={4.85} size={72} align="center" stagger={0.35} accent={[]} />
      </div>
      {TASKS.map((task, i) => {
        const p = usePopAt(wordAt("problem", task.word) - 0.1);
        const x = interpolate(merge, [0, 1], [task.x, 960 - 290]);
        const y = interpolate(merge, [0, 1], [task.y, 540]);
        const wobble = Math.sin(frame / 14 + i) * 4 * (1 - merge);
        return (
          <div key={task.label} style={{ position: "absolute", left: x, top: y + wobble, width: 580, opacity: Math.min(1, p * 1.4) * (1 - merge * 0.9), scale: `${(0.85 + 0.15 * Math.min(1, p)) * (1 - merge * 0.3)}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "28px 32px", borderRadius: 24, backgroundColor: T.surface, border: `1.5px solid ${T.line}`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}>
              <span style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: T.raised, border: `1.5px solid ${T.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 18, color: T.muted }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, color: T.text }}>{task.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 23, color: T.muted, marginTop: 6 }}>another tool · {task.tool}</div>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", opacity: Math.min(1, one * 1.3) * merge }}>
        <Pill p={one} size={40} color={T.text} border={T.cyan} bg="rgba(24,215,245,0.08)">
          <Check size={40} /> One workflow
        </Pill>
      </div>
    </AbsoluteFill>
  );
}

function usePopAt(at: number): number {
  return usePop(at);
}

const TERMINAL = [
  { at: 11.3, kind: "prompt", text: "Make a 20-second 16:9 ad for Quietdesk, a shared support inbox." },
  { at: 12.9, kind: "skill", text: "● Using skill: create-voiced-ad" },
  { at: 13.5, kind: "step", text: "1  Brief: voice, character, formats, music" },
  { at: 14.0, kind: "step", text: "2  Script ready → waiting for your approval" },
  { at: 14.6, kind: "step", text: "3  Copy templates/ into your Remotion project" },
  { at: 15.2, kind: "cmd", text: "4  pnpm run video:voice      # ElevenLabs, your API key" },
  { at: 15.9, kind: "cmd", text: "5  pnpm run video:render:horizontal" },
  { at: 16.9, kind: "done", text: "✓ out/quietdesk-16x9.mp4" },
];

function Solution() {
  const s = scene("solution");
  const fade = useSceneFade(s.from, s.to);
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const panel = usePop(11.0);
  const sub = useIn(12.4, 0.5);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: 140, top: 300, width: 640 }}>
        <Logo width={300} style={{ opacity: useIn(11.0, 0.5), marginBottom: 28 }} />
        <Headline text="Meet Create Voiced Ad." at={11.15} size={84} accent={["create", "voiced", "ad."]} />
        <div style={{ marginTop: 26, opacity: sub, translate: `0px ${(1 - sub) * 20}px`, fontFamily: INTER, fontWeight: 500, fontSize: 32, color: T.muted, lineHeight: 1.35 }}>
          A free, open-source skill for Claude Code. One reusable workflow, from brief to render.
        </div>
      </div>
      <div style={{ position: "absolute", left: 860, top: 230, opacity: Math.min(1, panel * 1.3), scale: `${0.94 + 0.06 * panel}` }}>
        <Window title="~/quietdesk-site — claude" style={{ width: 940 }}>
          <div style={{ padding: "28px 32px", fontFamily: MONO, fontSize: 24, lineHeight: 1.7, minHeight: 470 }}>
            {TERMINAL.map((l, i) => {
              if (t < l.at) return null;
              const typed = l.kind === "prompt" ? Math.floor(interpolate(t, [l.at, l.at + 1.3], [0, l.text.length], clamp)) : l.text.length;
              const color = l.kind === "prompt" ? T.text : l.kind === "skill" ? T.orange : l.kind === "done" ? T.cyan : l.kind === "cmd" ? "#C7D2E0" : T.muted;
              return (
                <div key={i} style={{ color, whiteSpace: "pre", opacity: interpolate(t, [l.at, l.at + 0.2], [0, 1], clamp) }}>
                  {l.kind === "prompt" && <span style={{ color: T.cyan }}>{"> "}</span>}
                  {l.kind === "prompt" ? <span style={{ whiteSpace: "pre-wrap" }}>{l.text.slice(0, typed)}</span> : l.text}
                  {l.kind === "prompt" && typed < l.text.length && <span style={{ backgroundColor: T.text, opacity: frame % 20 < 10 ? 1 : 0 }}>&nbsp;</span>}
                </div>
              );
            })}
          </div>
        </Window>
        <div style={{ marginTop: 14, fontFamily: INTER, fontSize: 20, color: T.muted, textAlign: "right" }}>Steps from the skill's SKILL.md. The script is approved before any paid voice generation.</div>
      </div>
    </AbsoluteFill>
  );
}

const FEATURES = [
  { label: "Animated SVG character", word: "animated" },
  { label: "AI voiceover (ElevenLabs)", word: "narration" },
  { label: "Lip-sync from timestamps", word: "synchronized" },
  { label: "Synchronized captions", word: "captions" },
  { label: "Remotion composition", word: "captions", delay: 0.35 },
];

function Demo() {
  const s = scene("demo");
  const fade = useSceneFade(s.from, s.to);
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const player = usePop(18.35);
  const live = t >= DEMO_CLIP.at - 0.1;
  const flash = interpolate(t, [DEMO_CLIP.at - 0.1, DEMO_CLIP.at, DEMO_CLIP.at + 0.25], [0, 0.5, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: 120, top: 80, width: 1680 }}>
        <Headline text="Animated characters. AI voice. Captions." at={18.45} size={60} stagger={0.12} accent={["animated", "ai", "captions."]} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 210, opacity: Math.min(1, player * 1.3), scale: `${0.94 + 0.06 * player}` }}>
        {/* Before the clip: the ad plays silently from its phone scenes. Then its own sound is heard. */}
        {!live ? (
          <DemoPlayer offset={6.4 - 18.3} width={1150} label="quietdesk-demo-16x9.mp4 · real render, fictional product" />
        ) : (
          <DemoPlayer offset={DEMO_CLIP.from - DEMO_CLIP.at} width={1150} label="quietdesk-demo-16x9.mp4 · sound on" />
        )}
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#fff", opacity: flash, borderRadius: 22 }} />
      </div>
      <div style={{ position: "absolute", left: 1330, top: 260, display: "flex", flexDirection: "column", gap: 22 }}>
        {FEATURES.map((f) => {
          const p = usePopAt(wordAt("demo", f.word) - 0.05 + (f.delay ?? 0));
          return (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: Math.min(1, p * 1.4), translate: `${(1 - Math.min(1, p)) * 40}px 0px` }}>
              <Check size={38} />
              <span style={{ fontFamily: INTER, fontWeight: 600, fontSize: 31, color: T.text }}>{f.label}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 16, border: `1.5px dashed ${T.line}`, fontFamily: INTER, fontSize: 21, lineHeight: 1.4, color: T.muted, width: 470, opacity: useIn(24.8, 0.5) }}>
          Voice by ElevenLabs with your own account (paid by usage). Quietdesk is a fictional product.
        </div>
      </div>
    </AbsoluteFill>
  );
}

const CODE = [
  ["k", "export const VOICEOVER = ["],
  ["s", '  { id: "problem", text: "Is your support inbox on fire again?…" },'],
  ["s", '  { id: "solution", text: "Quietdesk puts every customer message…" },'],
  ["k", "];"],
  ["c", ""],
  ["c", "// acting.ts: gestures keyed to spoken words"],
  ["k", 'case "assign":'],
  ["s", '  ...taps(w("tap"), 455, 560, 1, cues),'],
  ["s", '  { at: w("everyone"), pose: { ...pointAtPanel(layout), smile: 1 } },'],
] as const;

const TREE = ["templates/", "  scripts/generate-voiceover.mts", "  src/video/voiceover.ts", "  src/video/character.tsx", "  src/video/acting.ts", "  src/video/lipsync.ts", "  src/video/voiced.tsx", "  src/video/root.tsx"];

function Developer() {
  const s = scene("developer");
  const fade = useSceneFade(s.from, s.to);
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const editor = usePop(29.1);
  const badges = usePop(wordAt("developer", "open"));
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 96 }}>
        <Headline text="Open source. Customizable. Developer friendly." at={29.2} size={66} align="center" stagger={0.18} accent={["open", "customizable."]} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 250, display: "flex", gap: 36, opacity: Math.min(1, editor * 1.3), scale: `${0.95 + 0.05 * editor}` }}>
        <Window title="templates/src/video" style={{ width: 470 }}>
          <div style={{ padding: "24px 26px", fontFamily: MONO, fontSize: 22, lineHeight: 1.75 }}>
            {TREE.map((line, i) => (
              <div key={line} style={{ color: line.endsWith("/") ? T.cyan : T.text, whiteSpace: "pre", opacity: interpolate(t, [29.2 + i * 0.12, 29.4 + i * 0.12], [0, 1], clamp) }}>
                {line}
              </div>
            ))}
          </div>
        </Window>
        <Window title="voiceover.ts · acting.ts" style={{ width: 1150 }}>
          <div style={{ padding: "24px 30px", fontFamily: MONO, fontSize: 23, lineHeight: 1.75 }}>
            {CODE.map(([kind, line], i) => (
              <div key={i} style={{ whiteSpace: "pre", color: kind === "k" ? T.orange : kind === "c" ? T.muted : T.text, opacity: interpolate(t, [29.6 + i * 0.18, 29.8 + i * 0.18], [0, 1], clamp) }}>
                <span style={{ color: T.line, marginRight: 22 }}>{String(i + 1).padStart(2, " ")}</span>
                {line || " "}
              </div>
            ))}
          </div>
        </Window>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center", gap: 20 }}>
        <Pill p={badges} size={28} border={T.cyan}>Built with Remotion</Pill>
        <Pill p={usePopAt(wordAt("developer", "open") + 0.25)} size={28} border={T.orange}>MIT license</Pill>
        <Pill p={usePopAt(wordAt("developer", "customize"))} size={28}>Edit the text, acting and visuals in code</Pill>
      </div>
    </AbsoluteFill>
  );
}

function Cta() {
  const s = scene("cta");
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [sec(s.from), sec(s.from + 0.4)], [0, 1], clamp);
  const logo = usePop(34.6);
  const free = usePop(wordAt("cta", "free"));
  const agensi = usePop(wordAt("cta", "community") + 0.2);
  const note = useIn(37.4, 0.6);
  return (
    <AbsoluteFill style={{ opacity: fadeIn, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34, paddingBottom: 90 }}>
      <div style={{ opacity: Math.min(1, logo * 1.3), scale: `${0.88 + 0.12 * logo}`, filter: "drop-shadow(0 0 50px rgba(24,215,245,0.25))" }}>
        <Logo width={760} />
      </div>
      <div style={{ display: "flex", gap: 22 }}>
        <Pill p={free} size={38} color={T.text} border={T.cyan} bg="rgba(24,215,245,0.08)">
          <Check size={38} /> Free Community Edition
        </Pill>
        <Pill p={agensi} size={38} color={T.text} border={T.orange} bg="rgba(255,138,31,0.08)">
          Available on Agensi
        </Pill>
      </div>
      <div style={{ opacity: note, fontFamily: INTER, fontWeight: 500, fontSize: 22, color: T.muted, textAlign: "center" }}>
        A Claude Code skill · Remotion · AI voice needs your own ElevenLabs account (paid by usage)
      </div>
    </AbsoluteFill>
  );
}

// ── Composition ────────────────────────────────────────────────────────────

const LINES = captionLines();

export function CommunityPromo() {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{ backgroundColor: T.bg }}>
      <Backdrop />

      {SCENES.map((s) => (
        <Sequence key={`vo-${s.id}`} from={sec(s.voice)} durationInFrames={sec(8)} layout="none">
          <Html5Audio src={staticFile(`promo/voiceover/${s.id}.mp3`)} />
        </Sequence>
      ))}
      {/* The real ad's own audio (voice, music, sound effects), heard between two promo sentences. */}
      <Sequence from={sec(DEMO_CLIP.at)} durationInFrames={sec(DEMO_CLIP.to - DEMO_CLIP.from)} layout="none">
        <Sequence from={-sec(DEMO_CLIP.from)} layout="none">
          <AudioOnlyDemo />
        </Sequence>
      </Sequence>
      <Html5Audio
        src={staticFile("music/promo-bed.wav")}
        volume={(f) => {
          const now = f / FPS;
          const voiced = SCENES.some((s) => now >= s.voice - 0.15 && now <= s.voice + TIMINGS[s.id].duration + 0.1);
          const clip = now >= DEMO_CLIP.at - 0.2 && now <= DEMO_CLIP.at + (DEMO_CLIP.to - DEMO_CLIP.from) + 0.1;
          const base = clip ? 0.06 : voiced ? 0.16 : 0.34;
          const fade = Math.min(1, now / 1, (40 - now) / 1.5);
          return base * Math.max(0, fade);
        }}
      />
      {SCENES.slice(1).map((s) => (
        <Sequence key={`sfx-${s.id}`} from={Math.max(0, sec(s.from - 0.2))} durationInFrames={sec(1)} layout="none">
          <Html5Audio src={staticFile("sfx/whoosh.wav")} volume={0.32} />
        </Sequence>
      ))}

      <Sequence from={0} durationInFrames={sec(scene("hook").to)} layout="none"><Hook /></Sequence>
      <Sequence from={0} durationInFrames={sec(scene("problem").to)} layout="none"><Problem /></Sequence>
      <Sequence from={0} durationInFrames={sec(scene("solution").to)} layout="none"><Solution /></Sequence>
      <Sequence from={0} durationInFrames={sec(scene("demo").to)} layout="none"><Demo /></Sequence>
      <Sequence from={0} durationInFrames={sec(scene("developer").to)} layout="none"><Developer /></Sequence>
      <Sequence from={0} layout="none"><Cta /></Sequence>

      {t < 39.8 && <Captions lines={LINES} />}
    </AbsoluteFill>
  );
}

/** Only the audio of the Quietdesk ad: its picture is shown by the Demo scene's player. */
function AudioOnlyDemo() {
  return (
    <div style={{ display: "none" }}>
      <QuietdeskVoiced layout="horizontal" ending="fin-description" audio audioFadeOut={DEMO_CLIP.to} />
    </div>
  );
}

