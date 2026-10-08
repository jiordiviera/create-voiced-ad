import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Musique de fond et bruitages de la vidéo, générés avec ElevenLabs (ELEVENLABS_API_KEY, permissions
// Music et Sound Effects). Seuls les fichiers absents sont générés (les crédits comptent) ;
// --all pour tout refaire, --music ou --sfx pour une seule partie.

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error("ELEVENLABS_API_KEY manquante (.env.local).");
  process.exit(1);
}

const args = process.argv.slice(2);
const all = args.includes("--all");
const only = args.includes("--music") ? "music" : args.includes("--sfx") ? "sfx" : null;

export const MUSIC = {
  file: "public/video/music/fond.mp3",
  prompt:
    "Upbeat, warm Afrobeats and Amapiano instrumental bed for a 60-second social media ad aimed at African students. Bright log drum, shakers, soft electric piano chords, light guitar plucks, positive and modern, 112 BPM, steady energy without big drops so a voice-over stays clear, clean ending. No vocals.",
  lengthMs: 62_000,
};

export const SFX: Record<string, { text: string; seconds: number }> = {
  whoosh: { text: "Fast airy whoosh transition, short and clean, for a video scene change", seconds: 0.8 },
  pop: { text: "Playful cartoon bubble pop, short bright UI pop", seconds: 0.5 },
  tap: { text: "Soft smartphone touchscreen tap click, short", seconds: 0.5 },
  ding: { text: "Bright cheerful success chime ding, notification", seconds: 1.2 },
  bell: { text: "Small alarm bell ringing quickly, friendly reminder", seconds: 1.5 },
  swipe: { text: "Smartphone screen swipe swoosh, short", seconds: 0.6 },
};

async function post(url: string, body: unknown): Promise<Buffer> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": key!, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status} : ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Écrit le fichier normalisé (LUFS donné), durée inchangée. */
function save(file: string, audio: Buffer, lufs: number) {
  mkdirSync(join(file, ".."), { recursive: true });
  writeFileSync(`${file}.raw.mp3`, audio);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", `${file}.raw.mp3`, "-af", `loudnorm=I=${lufs}:TP=-1.5:LRA=11`, "-ar", "44100", "-b:a", "128k", `${file}.tmp.mp3`]);
  renameSync(`${file}.tmp.mp3`, file);
  unlinkSync(`${file}.raw.mp3`);
}

if (only !== "sfx" && (all || !existsSync(MUSIC.file))) {
  const audio = await post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    prompt: MUSIC.prompt,
    music_length_ms: MUSIC.lengthMs,
    force_instrumental: true,
  });
  save(MUSIC.file, audio, -16);
  console.log(`musique : ${MUSIC.file}`);
}

if (only !== "music") {
  for (const [name, sfx] of Object.entries(SFX)) {
    const file = `public/video/sfx/${name}.mp3`;
    if (!all && existsSync(file)) continue;
    const audio = await post("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
      text: sfx.text,
      duration_seconds: sfx.seconds,
      prompt_influence: 0.6,
    });
    save(file, audio, -18);
    console.log(`bruitage : ${name}`);
  }
}
