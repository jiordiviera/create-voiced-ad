import { useMemo } from "react";
import { AbsoluteFill, Easing, Html5Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { basePose, evaluate, perform, type ActingPose, type Layout } from "./acting";
import { Character } from "./character";
import { captions, mouthAt, planFor, totalSeconds, wordTime, type Ending, type ScenePlan } from "./lipsync";
import { C, FONT_BODY, FONT_HEADING, FPS } from "./theme";
import type { VoiceoverId } from "./voiceover";

// Quietdesk demo ad (fictional product), made with the Community templates: ElevenLabs voiceover,
// an SVG presenter that acts the lines, captions, music and sound effects. Acting in acting.ts,
// text in voiceover.ts. Music and sound effects are synthesized locally (scripts/generate-music.mts)
// instead of the template's ElevenLabs Music/Sound Effects, to avoid paid generation.

export type { Layout };

// Un alias (et non une interface) : Remotion attend des props indexables.
export type VoicedProps = {
  layout: Layout;
  ending: Ending;
  /** false: picture only (the promo embeds the ad silently while its own narrator speaks). */
  audio?: boolean;
  /** Fades all audio out over 0.4 s ending at this time (s), for excerpts. */
  audioFadeOut?: number;
};

export function voicedDuration(ending: Ending): number {
  return Math.ceil(totalSeconds(planFor(ending)) * FPS);
}

const BACK = Easing.bezier(0.34, 1.5, 0.64, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** 0 → 1 entre deux images, avec léger dépassement (effet « pop »). */
function pop(frame: number, from: number, duration = 12): number {
  return interpolate(frame, [from, from + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: BACK });
}

function slide(frame: number, from: number, duration = 16): number {
  return interpolate(frame, [from, from + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
}

function sceneAt(plan: ScenePlan[], seconds: number): { scene: ScenePlan; t: number } {
  const scene = [...plan].reverse().find((s) => seconds >= s.start) ?? plan[0];
  return { scene, t: seconds - scene.start };
}

/** Pseudo-hasard stable (même rendu à chaque fois). */
function noise(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Micro-mouvements automatiques par-dessus le jeu : respiration, clignements, regards, mains qui parlent. */
function alive(pose: ActingPose, frame: number, speaking: boolean, mouth: { open: number; round: number }): ActingPose {
  const cycle = (frame + (Math.floor(frame / 97) % 3) * 13) % 97;
  const blink = cycle < 5 ? Math.abs(cycle - 2.5) / 2.5 : 1;
  const saccade = Math.floor(frame / 38);
  const talk = speaking ? 1 : 0.25;
  const beat = speaking ? Math.sin(frame / 6.5) : 0;
  const gesturing = (hand: string) => hand === "point" || hand === "open";
  return {
    ...pose,
    mouthOpen: mouth.open,
    mouthRound: mouth.round,
    eyes: Math.min(pose.eyes, blink),
    bounce: pose.bounce + Math.sin(frame / 20) * 3 + Math.abs(beat) * 3 * mouth.open,
    lean: pose.lean + Math.sin(frame / 47) * 1.3,
    headTilt: pose.headTilt + Math.sin(frame / 33) * 2.4 * talk,
    nod: pose.nod + Math.sin(frame / 5.5) * 3.5 * mouth.open,
    lookX: pose.lookX + (noise(saccade) - 0.5) * 0.25,
    lookY: pose.lookY + (noise(saccade + 99) - 0.5) * 0.2,
    lx: pose.lx + pose.waveL * Math.sin(frame / 3.2) * 34 + (gesturing(pose.handL) ? beat * 7 : 0),
    ly: pose.ly + (gesturing(pose.handL) ? Math.cos(frame / 6.5) * 5 * talk : 0),
    rx: pose.rx + pose.waveR * Math.sin(frame / 3.2) * 34 + (gesturing(pose.handR) ? beat * 7 : 0),
    ry: pose.ry + (gesturing(pose.handR) ? Math.cos(frame / 6.5) * 5 * talk : 0),
  };
}

/** Grosse étiquette qui surgit (mots clés). */
function Chip({ children, p, color = C.indigo, bg = C.papier, size = 46, rotate = 0 }: { children: React.ReactNode; p: number; color?: string; bg?: string; size?: number; rotate?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.3,
        opacity: Math.min(1, p * 1.5),
        scale: `${Math.max(0, p)}`,
        rotate: `${rotate * (1 - Math.min(1, p))}deg`,
        padding: `${size * 0.32}px ${size * 0.6}px`,
        borderRadius: 999,
        backgroundColor: bg,
        color,
        fontFamily: FONT_HEADING,
        fontWeight: 800,
        fontSize: size,
        boxShadow: "0 12px 34px rgba(30, 42, 94, 0.14)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** Quietdesk mark (fictional): a speech bubble with a calm wave. */
export function QuietdeskMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="26" fill={C.indigo} />
      <path d="M24 30 h52 a8 8 0 0 1 8 8 v24 a8 8 0 0 1 -8 8 h-30 l-14 12 v-12 h-8 a8 8 0 0 1 -8 -8 v-24 a8 8 0 0 1 8 -8 z" fill={C.papier} />
      <path d="M32 51 q6 -8 12 0 t12 0 t12 0" fill="none" stroke={C.ocre} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Scene visual, driven by the spoken words. `frame` is local to the scene. */
function Panel({ id, frame, layout }: { id: VoiceoverId; frame: number; layout: Layout }) {
  const at = (word: string) => Math.round(wordTime(id, word) * FPS);
  const k = layout === "vertical" ? 1 : 0.9;
  const float = (seed: number) => ({ translate: `0px ${Math.sin(frame / 18 + seed) * 8}px` });
  const center: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 * k, width: "100%", height: "100%" };

  if (id === "problem") {
    const tools = ["Email", "Live chat", "Spreadsheet"];
    const tilt = [-6, 5, -4];
    const count = interpolate(frame, [at("fifty"), at("fifty") + 18], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT });
    const big = pop(frame, at("fifty"), 14);
    const who = pop(frame, at("nobody"), 12);
    return (
      <div style={center}>
        <span style={float(0)}>
          <Chip p={pop(frame, at("fire"), 12)} size={46 * k} bg={C.terrePale} color={C.terre} rotate={-10}>
            Inbox on fire
          </Chip>
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, maxWidth: 920, opacity: 1 - Math.min(1, big) * 0.35 }}>
          {tools.map((t, i) => (
            <span key={t} style={float(i + 1)}>
              <Chip p={pop(frame, at(i === 0 ? "three" : "tools") + i * 3, 12)} size={48 * k} rotate={tilt[i]! * 3}>
                {t}
              </Chip>
            </span>
          ))}
        </div>
        <div style={{ opacity: Math.min(1, big * 1.5), scale: `${big}`, textAlign: "center" }}>
          <div style={{ fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 180 * k, lineHeight: 0.95, color: C.terre }}>{Math.round(count)}</div>
          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 48 * k, color: C.indigo }}>open tabs</div>
        </div>
        <span style={{ rotate: `${Math.sin(frame / 3) * 4 * Math.min(1, who)}deg` }}>
          <Chip p={who} size={44 * k} bg={C.ocrePale} color={C.ocreTexte}>
            Who replied?
          </Chip>
        </span>
      </div>
    );
  }

  if (id === "solution") {
    const title = pop(frame, at("quietdesk"), 14);
    const sub = pop(frame, at("calm"), 14);
    return (
      <div style={center}>
        <div style={{ ...float(1), opacity: Math.min(1, title * 1.4), scale: `${title}`, fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 92 * k, color: C.indigo, textAlign: "center", lineHeight: 1 }}>
          One calm,
          <br />
          <span style={{ color: C.foret }}>shared inbox.</span>
        </div>
        <Chip p={sub} size={42 * k} bg={C.foretPale} color={C.foretTexte}>
          Every customer message, one place
        </Chip>
      </div>
    );
  }

  if (id === "assign") {
    const card = pop(frame, at("tap"), 14);
    const team = pop(frame, at("everyone"), 12);
    const names = ["Maya", "Leo", "Ana"];
    return (
      <div style={center}>
        <div style={{ ...float(2), opacity: Math.min(1, card * 1.4), scale: `${card}`, padding: `${26 * k}px ${44 * k}px`, borderRadius: 40, backgroundColor: C.papier, boxShadow: "0 20px 60px rgba(22, 50, 79, 0.16)", textAlign: "center" }}>
          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 36 * k, color: C.indigoDoux }}>Refund request #2048</div>
          <div style={{ fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 70 * k, color: C.indigo, lineHeight: 1.1 }}>Assigned to Maya ✓</div>
        </div>
        <div style={{ display: "flex", gap: 18 * k, opacity: Math.min(1, team * 1.5), scale: `${team}` }}>
          {names.map((n, i) => (
            <span key={n} style={{ width: 110 * k, height: 110 * k, borderRadius: 999, backgroundColor: [C.ocre, C.foret, C.indigoPale][i], color: i === 2 ? C.indigo : C.papier, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 46 * k, outline: i === 0 ? `6px solid ${C.indigo}` : undefined }}>
              {n[0]}
            </span>
          ))}
        </div>
        <Chip p={team} size={40 * k} bg={C.foretPale} color={C.foretTexte}>
          Everyone sees who is on it
        </Chip>
      </div>
    );
  }

  // Ending: logo, "Free", link (in the description, 16:9).
  const logo = pop(frame, 0, 14);
  const free = pop(frame, at("free"), 12);
  const url = pop(frame, at("link"), 14);
  return (
    <div style={center}>
      <span style={{ opacity: Math.min(1, logo * 1.5), scale: `${logo}`, rotate: `${(1 - Math.min(1, logo)) * -20}deg`, display: "flex", alignItems: "center", gap: 24 * k }}>
        <QuietdeskMark size={150 * k} />
        <span style={{ fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 84 * k, color: C.indigo }}>Quietdesk</span>
      </span>
      <Chip p={free} size={60 * k} bg={C.foretPale} color={C.foretTexte} rotate={-10}>
        Try it free
      </Chip>
      <div style={{ opacity: Math.min(1, url * 1.4), scale: `${url}`, textAlign: "center" }}>
        <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 40 * k, color: C.ocreTexte }}>Link in the description</div>
        <div style={{ fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 66 * k, color: C.indigo }}>quietdesk.example</div>
      </div>
    </div>
  );
}

/** Décor vivant : grandes formes douces qui dérivent lentement. */
function Backdrop({ frame, width, height }: { frame: number; width: number; height: number }) {
  const blob = (color: string, x: number, y: number, r: number, speed: number, seed: number) => (
    <div
      style={{
        position: "absolute",
        left: x * width + Math.sin(frame / speed + seed) * 60 - r,
        top: y * height + Math.cos(frame / (speed * 1.3) + seed) * 50 - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        backgroundColor: color,
        opacity: 0.55,
        filter: "blur(40px)",
      }}
    />
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.creme, overflow: "hidden" }}>
      {blob(C.ocrePale, 0.85, 0.15, 340, 40, 1)}
      {blob(C.indigoPale, 0.1, 0.45, 300, 52, 2)}
      {blob(C.foretPale, 0.7, 0.8, 360, 46, 3)}
    </AbsoluteFill>
  );
}

function Subtitle({ text }: { text: string }) {
  return (
    <div
      style={{
        maxWidth: 940,
        padding: "16px 30px",
        borderRadius: 26,
        backgroundColor: C.papier,
        color: C.indigo,
        fontFamily: FONT_BODY,
        fontWeight: 800,
        fontSize: 46,
        lineHeight: 1.22,
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(30, 42, 94, 0.16)",
      }}
    >
      {text}
    </div>
  );
}

export function QuietdeskVoiced({ layout, ending, audio = true, audioFadeOut }: VoicedProps) {
  const frame = useCurrentFrame();
  const plan = useMemo(() => planFor(ending), [ending]);
  const perf = useMemo(() => perform(plan, layout), [plan, layout]);
  const base = useMemo(() => ({ ...basePose(layout), phoneSize: 0 }), [layout]);
  const vertical = layout === "vertical";
  const width = vertical ? 1080 : 1920;
  const height = vertical ? 1920 : 1080;
  const total = Math.ceil(totalSeconds(plan) * FPS);

  const seconds = frame / FPS;
  const excerpt = (s: number) => (audioFadeOut === undefined ? 1 : Math.max(0, Math.min(1, (audioFadeOut - s) / 0.4)));
  const { scene, t } = sceneAt(plan, seconds);
  const speaking = t >= 0 && t <= scene.audio;
  const mouth = speaking ? mouthAt(scene.id, t) : { open: 0, round: 0 };
  const pose = alive(evaluate(perf, base, seconds), frame, speaking, mouth);
  const local = frame - Math.round(scene.start * FPS);

  // Caméra : dérive lente + coups de zoom sur les mots clés.
  const punch = perf.punches.reduce((sum, p) => {
    const dt = seconds - p;
    if (dt < 0 || dt > 0.9) return sum;
    return sum + (dt < 0.12 ? dt / 0.12 : Math.exp(-(dt - 0.12) * 5));
  }, 0);
  const camScale = 1 + 0.015 * Math.sin(frame / 70) + 0.06 * punch;
  const camX = Math.sin(frame / 90) * 10;
  const camY = Math.cos(frame / 110) * 8;

  // Chaque visuel entre en glissant depuis un côté (en alternance) et sort en fondu.
  const enter = pop(local, 0, 16);
  const sceneFrames = Math.round(scene.length * FPS);
  const exit = interpolate(local, [sceneFrames - 8, sceneFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dir = plan.indexOf(scene) % 2 === 0 ? 1 : -1;

  const charWidth = 600 * pose.stageScale;
  const charHeight = 900 * pose.stageScale;
  const intro = pop(frame, 0, 20);
  const caption = captions(scene.id).find((c) => t >= c.from - 0.05 && t <= c.to + 0.25);

  return (
    <AbsoluteFill>
      <Backdrop frame={frame} width={width} height={height} />

      {audio && plan.map((s) => (
        <Sequence key={s.id} from={Math.round(s.start * FPS)} durationInFrames={Math.round(s.length * FPS) + FPS} layout="none">
          <Html5Audio src={staticFile(`demo/voiceover/${s.id}.mp3`)} volume={(f) => excerpt((Math.round(s.start * FPS) + f) / FPS)} />
        </Sequence>
      ))}
      {/* Background music: lower while the voice speaks, faded in and out */}
      {audio && <Html5Audio
        src={staticFile("music/demo-bed.wav")}
        volume={(f) => {
          const sec = f / FPS;
          // Distance (s) à la voix la plus proche : la musique remonte en douceur dans les silences.
          const gap = Math.min(...plan.map((s) => Math.max(0, s.start - sec, sec - (s.start + s.audio))));
          const fade = Math.min(1, sec / 0.8, Math.max(0, (total / FPS - sec) / 1.5));
          return (0.13 + 0.17 * Math.min(1, gap / 0.4)) * fade * excerpt(sec);
        }}
      />}
      {audio && perf.cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(c.at * FPS))} durationInFrames={2 * FPS} layout="none">
          <Html5Audio src={staticFile(`sfx/${c.sound}.wav`)} volume={(f) => (c.volume ?? 0.5) * excerpt(c.at + f / FPS)} />
        </Sequence>
      ))}

      <AbsoluteFill style={{ scale: `${camScale}`, translate: `${camX}px ${camY}px` }}>
        <div
          style={{
            position: "absolute",
            ...(vertical ? { left: 50, right: 50, top: 70, height: 640 } : { left: 900, right: 60, top: 70, height: 760 }),
            opacity: exit,
            translate: `${(1 - Math.min(1, enter)) * 140 * dir}px 0px`,
          }}
        >
          <Panel id={scene.id} frame={local} layout={layout} />
        </div>

        <Character
          pose={pose}
          style={{
            position: "absolute",
            width: charWidth,
            height: charHeight,
            left: pose.stageX - charWidth / 2,
            top: pose.stageBottom - charHeight + (1 - intro) * 500,
          }}
        />
      </AbsoluteFill>

      {/* Captions outside the camera, always readable */}
      {caption && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            ...(vertical ? { left: 40, right: 40 } : { left: 1000, right: 60 }),
            top: pose.captionY * height,
          }}
        >
          <Subtitle text={caption.text} />
        </div>
      )}

      <AbsoluteFill style={{ backgroundColor: C.creme, opacity: interpolate(frame, [total - 10, total], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
}
