import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ElevenLabs voiceover with character timestamps, adapted from the Community template
// (templates/scripts/generate-voiceover.mts) for the two sets of this folder:
//   --set demo   → src/demo/voiceover.ts   (Quietdesk demo ad made with the Community templates)
//   --set promo  → src/promo/voiceover.ts  (the Agensi promo)
// One MP3 per scene in public/<set>/voiceover/ (normalized to -15 LUFS) and the timing of each
// character in src/<set>/voiceover-timings.json (lip-sync and captions).
//
// Paid: without --approve it only prints the plan and the estimated credits. With --approve, it
// refuses to run if the estimate exceeds --max-credits. Only new or changed scenes are generated.
// Changes from the template: cost gate, no `language_code` (eleven_multilingual_v2 detects the
// language itself), one script for both sets.

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const set = flag("--set");
if (set !== "demo" && set !== "promo") {
  console.error("Usage: pnpm voice -- --set demo|promo [--approve --max-credits N] [--all]");
  process.exit(2);
}
const { VOICE_ID, VOICEOVER } = (await import(`../src/${set}/voiceover.ts`)) as {
  VOICE_ID: string;
  VOICEOVER: readonly { id: string; text: string }[];
};

const outDir = join("public", set, "voiceover");
const timingsPath = join("src", set, "voiceover-timings.json");
type Timing = { duration: number; chars: string[]; starts: number[]; ends: number[] };
const previous: Record<string, Timing> = existsSync(timingsPath) ? JSON.parse(readFileSync(timingsPath, "utf8")) : {};
const all = args.includes("--all");
const todo = VOICEOVER.filter((s) => all || previous[s.id]?.chars.join("") !== s.text || !existsSync(join(outDir, `${s.id}.mp3`)));
const characters = todo.reduce((n, s) => n + s.text.length, 0);

console.log(`Voiceover "${set}" (voice ${VOICE_ID}, eleven_multilingual_v2):`);
for (const s of VOICEOVER) console.log(`  ${todo.includes(s) ? "generate" : "cached  "}  ${s.id.padEnd(16)} ${s.text.length} chars`);
if (todo.length === 0) {
  console.log("All scenes are cached: nothing to generate, no cost.");
} else {
  console.log(`To generate: ${todo.length} scene(s), ${characters} characters ≈ ${characters} credits (PAID, 1 credit per character on eleven_multilingual_v2; check your plan).`);
  if (!args.includes("--approve")) {
    console.log("Nothing generated: rerun with --approve --max-credits N after the cost is approved.");
    process.exit(3);
  }
  const max = Number(flag("--max-credits"));
  if (!(max >= 0) || characters > max) {
    console.error(`Estimate ${characters} credits exceeds --max-credits ${flag("--max-credits") ?? "(missing)"}. Nothing generated.`);
    process.exit(1);
  }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    console.error("ELEVENLABS_API_KEY is missing (.env.local).");
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
}

const timings: Record<string, Timing> = {};
for (const scene of VOICEOVER) {
  if (!todo.includes(scene)) {
    timings[scene.id] = previous[scene.id]!;
    continue;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: scene.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    // Not retried: a failed request may still have been billed. Finished scenes are kept.
    console.error(`${scene.id}: ElevenLabs ${res.status}`, (await res.text()).slice(0, 300));
    writeFileSync(timingsPath, JSON.stringify(timings) + "\n");
    process.exit(1);
  }
  const data = (await res.json()) as {
    audio_base64: string;
    alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
  };
  const file = join(outDir, `${scene.id}.mp3`);
  writeFileSync(`${file}.raw.mp3`, Buffer.from(data.audio_base64, "base64"));
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", `${file}.raw.mp3`, "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "128k", `${file}.tmp.mp3`]);
  renameSync(`${file}.tmp.mp3`, file);
  unlinkSync(`${file}.raw.mp3`);
  const a = data.alignment;
  timings[scene.id] = { duration: a.character_end_times_seconds.at(-1) ?? 0, chars: a.characters, starts: a.character_start_times_seconds, ends: a.character_end_times_seconds };
  console.log(`  ${scene.id}: ${timings[scene.id]!.duration.toFixed(2)} s`);
  writeFileSync(timingsPath, JSON.stringify(timings) + "\n");
}
writeFileSync(timingsPath, JSON.stringify(timings) + "\n");
console.log("Voiceover ready.");
