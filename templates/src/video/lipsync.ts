import timingsJson from "./voiceover-timings.json";
import { VOICEOVER, type VoiceoverId } from "./voiceover";

// Minutage de la voix off (généré par scripts/generate-voiceover.mts) : bouche du personnage,
// sous-titres et apparition des éléments au moment où le mot est prononcé.

interface SceneTiming {
  duration: number;
  chars: string[];
  starts: number[];
  ends: number[];
}

const TIMINGS = timingsJson as Record<VoiceoverId, SceneTiming>;

/** Silence avant la première phrase et entre deux scènes (secondes). */
export const LEAD = 0.4;
export const GAP = 0.45;

export interface ScenePlan {
  id: VoiceoverId;
  /** Début de la scène et de son audio, en secondes depuis le début de la vidéo. */
  start: number;
  /** Durée de la scène (audio + silence qui suit). */
  length: number;
  audio: number;
}

export type Ending = "fin-bio" | "fin-description";

/** Enchaînement des scènes, avec la fin adaptée au réseau (bio ou description). */
export function planFor(ending: Ending): ScenePlan[] {
  const scenes = VOICEOVER.filter((s) => !s.id.startsWith("fin-") || s.id === ending);
  let t = LEAD;
  return scenes.map((s, i) => {
    const audio = TIMINGS[s.id].duration;
    const length = audio + (i === scenes.length - 1 ? 1.8 : GAP);
    const plan = { id: s.id, start: t, length, audio };
    t += length;
    return plan;
  });
}

export function totalSeconds(plan: ScenePlan[]): number {
  return plan.at(-1)!.start + plan.at(-1)!.length;
}

/** Caractère prononcé à l'instant t (secondes dans l'audio de la scène), ou null. */
function charAt(id: VoiceoverId, t: number): string | null {
  const { chars, starts, ends } = TIMINGS[id];
  for (let i = 0; i < chars.length; i++) {
    if (t >= starts[i] && t < ends[i]) return chars[i].toLowerCase();
  }
  return null;
}

/** Forme de bouche approximative d'un caractère : ouverture (0-1) et arrondi (0-1). */
function shape(c: string | null): { open: number; round: number } {
  if (!c || !/\p{L}/u.test(c)) return { open: 0, round: 0 };
  if ("aàâ".includes(c)) return { open: 1, round: 0.2 };
  if ("oôuùûœ".includes(c)) return { open: 0.6, round: 1 };
  if ("eéèêëiîïy".includes(c)) return { open: 0.45, round: 0 };
  if ("mbp".includes(c)) return { open: 0, round: 0 };
  if ("fv".includes(c)) return { open: 0.15, round: 0 };
  return { open: 0.3, round: 0.2 };
}

/** Bouche lissée sur quelques centièmes de seconde, pour éviter les sauts d'une image à l'autre. */
export function mouthAt(id: VoiceoverId, t: number): { open: number; round: number } {
  const samples = [-0.05, -0.025, 0, 0.025, 0.05].map((d) => shape(charAt(id, t + d)));
  return {
    open: samples.reduce((s, m) => s + m.open, 0) / samples.length,
    round: samples.reduce((s, m) => s + m.round, 0) / samples.length,
  };
}

/** Instant (secondes dans la scène) où le mot est prononcé pour la première fois. */
export function wordTime(id: VoiceoverId, word: string): number {
  const text = TIMINGS[id].chars.join("").toLowerCase();
  const i = text.indexOf(word.toLowerCase());
  if (i < 0) throw new Error(`Mot absent de la voix off ${id} : ${word}`);
  return TIMINGS[id].starts[i];
}

/** Découpe aux signes de ponctuation suivis d'une espace (les points d'une adresse ne coupent pas). */
export function segments(text: string): string[] {
  return text
    .split(/(?<=[.,:?!…])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface Caption {
  text: string;
  from: number;
  to: number;
}

/** Sous-titres d'une scène : le texte affiché, calé sur les segments prononcés. */
export function captions(id: VoiceoverId): Caption[] {
  const scene = VOICEOVER.find((s) => s.id === id)!;
  const spoken = segments(scene.text);
  const shown = segments("caption" in scene ? scene.caption : scene.text);
  const { chars, starts, ends } = TIMINGS[id];
  const full = chars.join("");
  let cursor = 0;
  const parts = spoken.map((seg, i) => {
    const at = full.indexOf(seg, cursor);
    const endAt = at + seg.length - 1;
    cursor = endAt + 1;
    return { text: shown[i], from: starts[at], to: ends[Math.min(endAt, ends.length - 1)] };
  });
  // Regroupe les segments courts (« Visa, logement, banque… ») en lignes d'au plus 8 mots.
  const words = (t: string) => t.split(/\s+/).length;
  const merged: Caption[] = [];
  for (const part of parts) {
    const last = merged.at(-1);
    if (last && words(last.text) + words(part.text) <= 8 && !/[.?!]$/.test(last.text)) {
      last.text = `${last.text} ${part.text}`;
      last.to = part.to;
    } else merged.push({ ...part });
  }
  // Pas de virgule ni de deux-points en fin de sous-titre.
  return merged.map((c) => ({ ...c, text: c.text.replace(/\s*[,:]$/, "") }));
}
