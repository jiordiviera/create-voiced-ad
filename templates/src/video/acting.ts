import { Easing } from "remotion";
import { IDLE, REST, type CharacterPose } from "./character";
import { wordTime, type ScenePlan } from "./lipsync";
import type { VoiceoverId } from "./voiceover";

// Jeu du personnage : gestes, expressions, cadrage, coups de caméra et bruitages, calés sur les mots
// de la voix off. Chaque « beat » fixe des valeurs cibles à un instant ; on y glisse en `d` secondes.

export type Layout = "vertical" | "horizontal";

/** Pose étendue : agitation des mains (salut, « non ») et cadrage du personnage dans l'image. */
export interface ActingPose extends CharacterPose {
  waveL: number;
  waveR: number;
  /** Centre horizontal, bas du dessin (y = 900) et échelle, en pixels de la vidéo. */
  stageX: number;
  stageBottom: number;
  stageScale: number;
  /** Position verticale des sous-titres (part de la hauteur de l'image). */
  captionY: number;
}

type Ease = "smooth" | "back" | "snap";

interface Beat {
  at: number;
  pose: Partial<ActingPose>;
  d?: number;
  e?: Ease;
}

export interface Cue {
  at: number;
  sound: "whoosh" | "pop" | "tap" | "ding" | "bell" | "swipe";
  volume?: number;
}

const NUMERIC = [
  "lean",
  "bounce",
  "headTilt",
  "headYaw",
  "nod",
  "lookX",
  "lookY",
  "brows",
  "worry",
  "smile",
  "lx",
  "ly",
  "rx",
  "ry",
  "phoneSize",
  "screenZoom",
  "screenScroll",
  "ring",
  "waveL",
  "waveR",
  "stageX",
  "stageBottom",
  "stageScale",
  "captionY",
] as const;

type NumericKey = (typeof NUMERIC)[number];

const EASE: Record<Ease, (t: number) => number> = {
  smooth: Easing.bezier(0.45, 0, 0.2, 1),
  back: Easing.bezier(0.34, 1.45, 0.64, 1),
  snap: Easing.bezier(0.2, 0.9, 0.3, 1),
};

/** Cadrage par défaut et cadrage serré (téléphone en main), selon le format. */
function stage(layout: Layout, close: boolean): Partial<ActingPose> {
  if (layout === "vertical") {
    return close
      ? { stageX: 470, stageBottom: 2180, stageScale: 1.95, captionY: 0.345 }
      : { stageX: 540, stageBottom: 1990, stageScale: 1.68, captionY: 0.79 };
  }
  return close
    ? { stageX: 560, stageBottom: 1330, stageScale: 1.45, captionY: 0.84 }
    : { stageX: 430, stageBottom: 1230, stageScale: 1.25, captionY: 0.84 };
}

export function basePose(layout: Layout): ActingPose {
  return { ...IDLE, waveL: 0, waveR: 0, ...(stage(layout, false) as Required<Pick<ActingPose, "stageX" | "stageBottom" | "stageScale" | "captionY">>) };
}

/** Geste « regarde ça » vers le visuel : en haut à gauche (vertical), à droite (horizontal). */
function pointAtPanel(layout: Layout): Partial<ActingPose> {
  return layout === "vertical"
    ? { lx: 110, ly: 330, handL: "point", lookX: -0.7, lookY: -0.9, headYaw: -0.25 }
    : { rx: 600, ry: 440, handR: "point", lookX: 1, lookY: -0.2, headYaw: 0.3 };
}

function lowerPointing(layout: Layout): Partial<ActingPose> {
  return layout === "vertical" ? { lx: REST.lx, ly: REST.ly, handL: "fist" } : { rx: REST.rx, ry: REST.ry, handR: "fist" };
}

/** Petit rebond du corps (accent sur un mot). */
function pulse(at: number, amount = -12): Beat[] {
  return [
    { at, pose: { bounce: amount }, d: 0.1, e: "snap" },
    { at: at + 0.12, pose: { bounce: 0 }, d: 0.3, e: "back" },
  ];
}

/** Hochement de tête. */
function nodAt(at: number): Beat[] {
  return [
    { at, pose: { nod: 10 }, d: 0.12 },
    { at: at + 0.14, pose: { nod: 0 }, d: 0.25 },
  ];
}

/** Tapotement de l'index gauche sur un point (écran du téléphone, poignet), avec clic. */
function taps(at: number, x: number, y: number, count: number, cues: Cue[]): Beat[] {
  const beats: Beat[] = [{ at: at - 0.3, pose: { lx: x + 14, ly: y + 34, handL: "point" }, d: 0.28 }];
  for (let i = 0; i < count; i++) {
    const t = at + i * 0.3;
    beats.push({ at: t, pose: { lx: x, ly: y }, d: 0.08, e: "snap" });
    beats.push({ at: t + 0.1, pose: { lx: x + 10, ly: y + 24 }, d: 0.12 });
    cues.push({ at: t + 0.04, sound: "tap", volume: 0.7 });
  }
  return beats;
}

export interface Performance {
  beats: Beat[];
  cues: Cue[];
  /** Instants des coups de zoom de caméra. */
  punches: number[];
}

/** Mots où un visuel surgit dans le Panel (voiced.tsx) : un « pop » sonore les accompagne. */
const POPS: Record<VoiceoverId, (string | 0)[]> = {
  probleme: ["campus", "visa", "logement", "banque", "apl", "quarante", "chaque"],
  "prochaine-etape": ["mbeng", "prochaine"],
  verifie: ["officielle", "quatre-vingt-cinq", "seize"],
  visa: [0, "valider"],
  confidentialite: [0, "compte", "pub", "téléphone"],
  "fin-bio": [0, "lien"],
  "fin-description": [0, "lien"],
};

function sceneBeats(id: VoiceoverId, layout: Layout, cues: Cue[], punches: number[], audio: number): Beat[] {
  const w = (word: string, offset = 0) => wordTime(id, word) + offset;
  for (const p of POPS[id]) cues.push({ at: p === 0 ? 0.05 : w(p), sound: "pop", volume: 0.45 });
  const far = stage(layout, false);
  const close = stage(layout, true);

  switch (id) {
    case "probleme":
      return [
        { at: 0, pose: { ...far, rx: 520, ry: 330, handR: "open", waveR: 1, smile: 0.9, brows: 0.6 }, d: 0.45, e: "back" },
        { at: w("étudier"), pose: { waveR: 0, brows: 0.3 }, d: 0.3 },
        { at: w("france"), pose: { headTilt: 7, brows: 1, lookY: -0.2 }, d: 0.3 },
        { at: w("campus", -0.25), pose: { rx: REST.rx, ry: REST.ry, handR: "fist", headTilt: 0, brows: 0.4, ...pointAtPanel(layout) }, d: 0.35 },
        ...["campus", "visa", "logement", "banque", "apl"].flatMap((word) => pulse(w(word), -8)),
        { at: w("quarante", -0.2), pose: { lx: 232, ly: 330, rx: 368, ry: 330, handL: "open", handR: "open", worry: 1, smile: -0.7, brows: 0.2, lookX: 0, lookY: 0, headYaw: 0, headTilt: -5 }, d: 0.3, e: "snap" },
        { at: w("chaque"), pose: { lx: REST.lx, ly: REST.ly, handL: "fist", rx: 455, ry: 425, handR: "point", worry: 0.2, smile: 0, brows: 0.6, headTilt: 0 }, d: 0.35 },
        ...nodAt(w("compte")),
        { at: audio + 0.05, pose: { rx: REST.rx, ry: REST.ry, handR: "fist", brows: 0 }, d: 0.4 },
      ];

    case "prochaine-etape": {
      const tapAt = w("questions");
      return [
        { at: -0.1, pose: { ...close, worry: 0, smile: 0.9, brows: 0.4, rx: 480, ry: 690, handR: "phone", phoneSize: 1, screen: "next-step", screenZoom: 1, screenScroll: 0, ring: 0, headYaw: 0.3, lookX: 0.8, lookY: 0.35 }, d: 0.5, e: "back" },
        { at: w("maintenant"), pose: { headYaw: 0, lookX: 0, lookY: 0, brows: 0.7 }, d: 0.25 },
        ...pulse(w("maintenant")),
        { at: w("réponds"), pose: { headYaw: 0.3, lookX: 0.8, lookY: 0.35, brows: 0.2 }, d: 0.3 },
        ...taps(tapAt, 450, 470, 2, cues),
        { at: w("calcule"), pose: { lx: REST.lx, ly: REST.ly, handL: "fist" }, d: 0.35 },
        { at: w("prochaine"), pose: { screenZoom: 1.14, headYaw: 0, lookX: 0, lookY: 0, smile: 1 }, d: 0.5 },
        ...nodAt(w("étape")),
        { at: w("date limite", -0.1), pose: { screenZoom: 1, ring: 1, headYaw: 0.3, lookX: 0.8, lookY: 0.35 }, d: 0.3 },
        ...taps(w("limite"), 470, 505, 1, cues),
        { at: audio, pose: { lx: REST.lx, ly: REST.ly, handL: "fist" }, d: 0.3 },
      ];
    }

    case "verifie": {
      cues.push({ at: 0.05, sound: "swipe", volume: 0.6 });
      punches.push(w("quatre-vingt-cinq"));
      return [
        { at: 0, pose: { screen: "step", ring: 0, screenZoom: 1, screenScroll: 0, smile: 0.5, headYaw: 0.3, lookX: 0.8, lookY: 0.3 }, d: 0.3 },
        { at: w("officielle", -0.15), pose: { brows: 0.7 }, d: 0.25 },
        ...taps(w("officielle"), 455, 560, 1, cues),
        { at: w("daté"), pose: { screenScroll: 0.22, lx: REST.lx, ly: REST.ly, handL: "fist", headYaw: 0, lookX: 0, lookY: 0 }, d: 0.7 },
        ...nodAt(w("daté")),
        { at: w("frais", -0.35), pose: { phoneSize: 0 }, d: 0.3, e: "snap" },
        { at: w("frais"), pose: { ...far, rx: REST.rx, ry: REST.ry, handR: "fist", brows: 0.3 }, d: 0.45 },
        { at: w("cameroun"), pose: pointAtPanel(layout), d: 0.35 },
        { at: w("quatre-vingt-cinq"), pose: { brows: 1, smile: 0.7 }, d: 0.2 },
        ...pulse(w("quatre-vingt-cinq"), -16),
        ...pulse(w("seize"), -10),
        { at: audio + 0.05, pose: { ...lowerPointing(layout), brows: 0, lookX: 0, lookY: 0, headYaw: 0 }, d: 0.4 },
      ];
    }

    case "visa":
      punches.push(w("trois mois"));
      cues.push({ at: w("rappelle"), sound: "bell", volume: 0.55 });
      return [
        { at: 0, pose: { rx: 330, ry: 650, handR: "fist", lookX: -0.1, lookY: 0.6, worry: 0.3, smile: 0 }, d: 0.4 },
        ...taps(w("trois mois"), 340, 615, 2, cues),
        { at: w("valider"), pose: { lx: REST.lx, ly: REST.ly, handL: "fist", rx: 455, ry: 425, handR: "point", lookX: 0, lookY: 0, brows: 0.6 }, d: 0.35 },
        { at: w("rappelle", -0.15), pose: { ...pointAtPanel(layout), ...(layout === "vertical" ? { rx: REST.rx, ry: REST.ry, handR: "fist" } : {}), worry: 0, smile: 1, brows: 1 }, d: 0.3, e: "back" },
        ...pulse(w("rappelle")),
        { at: w("trop tard"), pose: { ...lowerPointing(layout), headTilt: -6, worry: 0.6, smile: -0.2, lookX: 0, lookY: 0, headYaw: 0 }, d: 0.3 },
        ...nodAt(w("tard")),
        { at: audio + 0.05, pose: { headTilt: 0, worry: 0, smile: 0.4 }, d: 0.3 },
      ];

    case "confidentialite":
      return [
        { at: -0.05, pose: { rx: 470, ry: 470, handR: "open", waveR: 1, smile: 0.3, brows: 0.4 }, d: 0.3, e: "back" },
        { at: w("pub", -0.1), pose: { waveR: 0, rx: REST.rx, ry: REST.ry, handR: "fist", lx: 130, ly: 470, handL: "open", waveL: 1 }, d: 0.3, e: "back" },
        { at: w("infos", -0.1), pose: { waveL: 0, lx: REST.lx, ly: REST.ly, handL: "fist", rx: 330, ry: 770, handR: "phone", phoneSize: 0.75, screen: "lock", screenZoom: 1, screenScroll: 0, ring: 0, smile: 1, brows: 0.2, headTilt: 6 }, d: 0.35, e: "back" },
        ...nodAt(w("téléphone")),
      ];

    case "fin-bio":
    case "fin-description": {
      punches.push(w("gratuit"));
      cues.push({ at: w("gratuit"), sound: "ding", volume: 0.7 });
      const end = audio + 0.25;
      return [
        { at: -0.1, pose: { phoneSize: 0, headTilt: 0 }, d: 0.25, e: "snap" },
        { at: 0.2, pose: { rx: REST.rx, ry: REST.ry, handR: "fist" }, d: 0.3 },
        { at: w("gratuit", -0.2), pose: { rx: 470, ry: 420, handR: "thumb", smile: 1, brows: 0.8 }, d: 0.3, e: "back" },
        ...pulse(w("gratuit"), -16),
        { at: w("lien", -0.1), pose: { rx: REST.rx, ry: REST.ry, handR: "fist", ...pointAtPanel(layout), smile: 0.8 }, d: 0.35 },
        ...nodAt(w("mbeng point")),
        { at: end, pose: { ...lowerPointing(layout), lookX: 0, lookY: 0, headYaw: 0 }, d: 0.3 },
        { at: end + 0.05, pose: { rx: 520, ry: 330, handR: "open", waveR: 1, smile: 1, brows: 0.5 }, d: 0.4, e: "back" },
      ];
    }
  }
}

/** Tous les gestes et bruitages de la vidéo, en temps absolu. */
export function perform(plan: ScenePlan[], layout: Layout): Performance {
  const beats: Beat[] = [];
  const cues: Cue[] = [];
  const punches: number[] = [];
  for (const scene of plan) {
    const localCues: Cue[] = [];
    const localPunches: number[] = [];
    for (const b of sceneBeats(scene.id, layout, localCues, localPunches, scene.audio)) beats.push({ ...b, at: b.at + scene.start });
    for (const c of localCues) cues.push({ ...c, at: c.at + scene.start });
    for (const p of localPunches) punches.push(p + scene.start);
    if (scene.start > 1) cues.push({ at: scene.start - 0.15, sound: "whoosh", volume: 0.5 });
  }
  beats.sort((a, b) => a.at - b.at);
  return { beats, cues, punches };
}

interface Transition {
  from: number;
  to: number;
  start: number;
  d: number;
  e: Ease;
}

function valueAt(tr: Transition | undefined, t: number, fallback: number): number {
  if (!tr) return fallback;
  const p = Math.min(1, Math.max(0, (t - tr.start) / tr.d));
  return tr.from + (tr.to - tr.from) * EASE[tr.e](p);
}

/** Pose « jouée » à l'instant t (avant les micro-mouvements automatiques). */
export function evaluate(perf: Performance, base: ActingPose, t: number): ActingPose {
  const pose: ActingPose = { ...base };
  const tracks: Partial<Record<NumericKey, Transition>> = {};
  for (const beat of perf.beats) {
    if (beat.at > t) break;
    for (const [key, value] of Object.entries(beat.pose)) {
      if ((NUMERIC as readonly string[]).includes(key)) {
        const k = key as NumericKey;
        const from = valueAt(tracks[k], beat.at, base[k]);
        tracks[k] = { from, to: value as number, start: beat.at, d: beat.d ?? 0.35, e: beat.e ?? "smooth" };
      } else {
        (pose as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }
  for (const k of NUMERIC) pose[k] = valueAt(tracks[k], t, base[k]);
  return pose;
}
