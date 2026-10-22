import { writeFileSync } from "node:fs";
import demoTimings from "../src/demo/voiceover-timings.json" with { type: "json" };
import { LEAD } from "../src/demo/lipsync.ts";
import { captionLines, DEMO_CLIP } from "../src/promo/timeline.ts";

// Subtitles of the promo (SRT), from the ElevenLabs word timings: the promo narration, plus the line
// of the Quietdesk demo ad that is heard on its own ("Is your support inbox on fire again?").
//   pnpm srt → ../demos/agensi-community-promo-16x9.en.srt

const ts = (s: number) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)},${pad(ms % 1000, 3)}`;
};

const cues = captionLines().map((l) => ({ from: l.from, to: l.to, text: l.words.map((w) => w.text).join(" ") }));

// Demo clip: its first sentence, shifted to where the promo plays it.
const problem = (demoTimings as Record<string, { chars: string[]; starts: number[]; ends: number[] }>).problem!;
const sentence = "Is your support inbox on fire again?";
const end = problem.chars.join("").indexOf(sentence) + sentence.length - 1;
const shift = DEMO_CLIP.at - DEMO_CLIP.from + LEAD;
cues.push({ from: shift + problem.starts[0]!, to: shift + problem.ends[end]!, text: `[Quietdesk demo ad] ${sentence}` });
cues.sort((a, b) => a.from - b.from);

// Each cue stays a little after its last word, never past the next cue (no overlaps).
const srt = cues
  .map((c, i) => {
    const next = cues[i + 1]?.from ?? Infinity;
    const end = Math.min(Math.max(c.to + 0.15, c.from + 0.8), next - 0.02);
    return `${i + 1}\n${ts(c.from)} --> ${ts(end)}\n${c.text}\n`;
  })
  .join("\n");
writeFileSync("../demos/agensi-community-promo-16x9.en.srt", srt);
console.log(`Wrote ../demos/agensi-community-promo-16x9.en.srt (${cues.length} cues)`);
