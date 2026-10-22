import timingsJson from "./voiceover-timings.json";
import { VOICEOVER, type PromoVoiceId } from "./voiceover";

// Timeline of the 40 s promo: where each scene is on screen and where its narration starts.
// Narration timings come from ElevenLabs character timestamps (scripts/generate-voiceover.mts).

export const FPS = 30;
export const DURATION_S = 40;
export const DURATION = DURATION_S * FPS;

interface Timing {
  duration: number;
  chars: string[];
  starts: number[];
  ends: number[];
}
export const TIMINGS = timingsJson as Record<PromoVoiceId, Timing>;

export interface PromoScene {
  id: PromoVoiceId;
  /** On-screen window, seconds. */
  from: number;
  to: number;
  /** Narration start, seconds. */
  voice: number;
}

export const SCENES: PromoScene[] = [
  { id: "hook", from: 0, to: 4.6, voice: 0.75 },
  { id: "problem", from: 4.6, to: 10.9, voice: 4.75 },
  { id: "solution", from: 10.9, to: 18.3, voice: 11.05 },
  { id: "demo", from: 18.3, to: 29.0, voice: 18.55 },
  { id: "developer", from: 29.0, to: 34.5, voice: 29.25 },
  { id: "cta", from: 34.5, to: DURATION_S, voice: 34.75 },
];

/**
 * The real Quietdesk ad is heard (its own audio) between two promo sentences: demo time
 * DEMO_CLIP.from → DEMO_CLIP.to ("Is your support inbox on fire again?") at promo time DEMO_CLIP.at.
 */
export const DEMO_CLIP = { at: 25.95, from: 0, to: 2.9 };

export const scene = (id: PromoVoiceId) => SCENES.find((s) => s.id === id)!;

/** Absolute time (s) at which `word` is first spoken in scene `id`. */
export function wordAt(id: PromoVoiceId, word: string): number {
  const t = TIMINGS[id];
  const i = t.chars.join("").toLowerCase().indexOf(word.toLowerCase());
  if (i < 0) throw new Error(`"${word}" is not in the ${id} narration`);
  return scene(id).voice + t.starts[i]!;
}

export interface CaptionWord {
  text: string;
  from: number;
  to: number;
}
export interface CaptionLine {
  words: CaptionWord[];
  from: number;
  to: number;
}

/** Caption lines (absolute seconds), at most `max` words, broken after punctuation. */
export function captionLines(max = 7): CaptionLine[] {
  const lines: CaptionLine[] = [];
  for (const s of SCENES) {
    const t = TIMINGS[s.id];
    const text = VOICEOVER.find((v) => v.id === s.id)!.text;
    const words: CaptionWord[] = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const a = m.index;
      const b = a + m[0].length - 1;
      words.push({ text: m[0], from: s.voice + t.starts[Math.min(a, t.starts.length - 1)]!, to: s.voice + t.ends[Math.min(b, t.ends.length - 1)]! });
    }
    let line: CaptionWord[] = [];
    const flush = () => {
      if (line.length) lines.push({ words: line, from: line[0]!.from, to: line.at(-1)!.to });
      line = [];
    };
    for (const w of words) {
      line.push(w);
      // Break after a sentence end, or a comma once the line is long enough, or at `max` words.
      if (/[.?!]$/.test(w.text) || (/,$/.test(w.text) && line.length >= 4) || line.length >= max) flush();
    }
    flush();
  }
  return lines;
}
