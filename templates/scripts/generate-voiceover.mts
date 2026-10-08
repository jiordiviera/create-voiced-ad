import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { VOICE_ID, VOICEOVER } from "../src/video/voiceover";

// Génère la voix off de la vidéo avec ElevenLabs (ELEVENLABS_API_KEY dans .env.local) :
// un MP3 par scène dans public/video/voiceover/, et le minutage de chaque caractère dans
// src/video/voiceover-timings.json (bouche du personnage et sous-titres).

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY manquante (.env.local).");
  process.exit(1);
}

const outDir = join("public", "video", "voiceover");
mkdirSync(outDir, { recursive: true });

interface Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

const timingsPath = join("src", "video", "voiceover-timings.json");
type Timing = { duration: number; chars: string[]; starts: number[]; ends: number[] };
const previous: Record<string, Timing> = existsSync(timingsPath) ? JSON.parse(readFileSync(timingsPath, "utf8")) : {};
const timings: Record<string, Timing> = {};

// Seules les scènes nouvelles ou dont le texte a changé sont régénérées (les crédits comptent).
// Pour tout refaire : pnpm run video:voice -- --all
const all = process.argv.includes("--all");

for (const scene of VOICEOVER) {
  const old = previous[scene.id];
  if (!all && old && old.chars.join("") === scene.text && existsSync(join(outDir, `${scene.id}.mp3`))) {
    timings[scene.id] = old;
    continue;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: scene.text,
      model_id: "eleven_multilingual_v2",
      language_code: "fr",
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    console.error(`${scene.id} : ElevenLabs ${res.status}`, (await res.text()).slice(0, 300));
    process.exit(1);
  }
  const data = (await res.json()) as { audio_base64: string; alignment: Alignment };
  const file = join(outDir, `${scene.id}.mp3`);
  writeFileSync(`${file}.raw.mp3`, Buffer.from(data.audio_base64, "base64"));
  // La voix sort très bas d'ElevenLabs : normalisation au niveau des réseaux sociaux (-15 LUFS), durée inchangée.
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", `${file}.raw.mp3`, "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "128k", `${file}.tmp.mp3`]);
  renameSync(`${file}.tmp.mp3`, file);
  unlinkSync(`${file}.raw.mp3`);
  const a = data.alignment;
  timings[scene.id] = {
    duration: a.character_end_times_seconds.at(-1) ?? 0,
    chars: a.characters,
    starts: a.character_start_times_seconds,
    ends: a.character_end_times_seconds,
  };
  console.log(`${scene.id} : ${timings[scene.id].duration.toFixed(1)} s`);
}

writeFileSync(timingsPath, JSON.stringify(timings) + "\n");
