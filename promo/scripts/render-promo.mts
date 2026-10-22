import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync } from "node:fs";
import { dirname } from "node:path";

// Renders a promo composition, then normalizes its loudness to -14 LUFS integrated / -1.5 dBTP
// (two-pass loudnorm, video stream copied) — the level social platforms and marketplaces play at.
//   pnpm render:promo            → ../demos/agensi-community-promo-16x9.mp4
//   pnpm render:promo:vertical   → ../demos/agensi-community-promo-9x16.mp4

const [composition, output] = process.argv.slice(2);
if (!composition || !output) {
  console.error("Usage: tsx scripts/render-promo.mts <Composition> <output.mp4>");
  process.exit(2);
}
mkdirSync("out", { recursive: true });
mkdirSync(dirname(output), { recursive: true });
const raw = `out/${composition}.raw.mp4`;
execFileSync("pnpm", ["exec", "remotion", "render", "src/index.ts", composition, raw, "--codec=h264", "--crf=18", "--audio-bitrate=192k"], { stdio: "inherit" });

const target = "I=-14:TP=-1.5:LRA=11";
const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${raw}" -af loudnorm=${target}:print_format=json -f null - 2>&1`], { encoding: "utf8" });
const m = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1)) as Record<string, string>;
const second = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
const tmp = `${output}.tmp.mp4`;
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-c:v", "copy", "-af", second, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp], { stdio: "inherit" });
renameSync(tmp, output);
console.log(`✔ ${output} (loudness measured before: ${m.input_i} LUFS, ${m.input_tp} dBTP)`);
