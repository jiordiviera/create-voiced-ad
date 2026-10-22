import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Music beds and sound effects for the promo and the demo ad, synthesized from code (no samples, no
// third-party license): the files are as free as this repository (MIT). Deterministic: the same code
// gives the same audio. The Community template generates these with ElevenLabs Music and Sound
// Effects (paid); this script avoids that cost.
//   public/music/promo-bed.wav  (42 s, 96 bpm, D minor → F, calm launch-trailer pad and pulse)
//   public/music/demo-bed.wav   (48 s, 104 bpm, C major, light pluck and pad)
//   public/sfx/{whoosh,pop,tap,ding,bell,swipe}.wav

const RATE = 44100;
const midi = (m: number) => 440 * 2 ** ((m - 69) / 12);

function wav(samples: Float32Array): Buffer {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i]!)) * 32767), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

function noise(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s / 0xffffffff) * 2 - 1;
  };
}

/** Adds a note to the buffer: `voice(t, phase)` is the enveloped waveform. */
function note(buf: Float32Array, start: number, dur: number, freq: number, gain: number, voice: (t: number, ph: number, dur: number) => number) {
  const i0 = Math.round(start * RATE);
  const n = Math.round(dur * RATE);
  const step = (2 * Math.PI * freq) / RATE;
  for (let i = 0; i < n && i0 + i < buf.length; i++) buf[i0 + i]! += voice(i / RATE, i * step, dur) * gain;
}

const pad = (t: number, ph: number, d: number) => {
  let s = 0;
  for (let k = 1; k <= 5; k++) s += (Math.sin(k * ph) + Math.sin(k * ph * 1.003)) / (k * 2);
  return s * Math.min(1, t / 0.8) * Math.min(1, (d - t) / 1.2) * 0.16;
};
const pluck = (t: number, ph: number) => {
  let s = 0;
  for (let k = 1; k <= 4; k++) s += (Math.sin(k * ph) * Math.exp(-t * k * 5)) / k;
  return s * Math.exp(-t * 6) * Math.min(1, t * 300) * 0.4;
};
const bass = (t: number, ph: number, d: number) => Math.tanh(1.3 * Math.sin(ph)) * Math.min(1, t * 120) * Math.min(1, (d - t) / 0.08) * 0.35;

function kick(buf: Float32Array, at: number, gain: number) {
  let ph = 0;
  const i0 = Math.round(at * RATE);
  for (let i = 0; i < 0.35 * RATE && i0 + i < buf.length; i++) {
    const t = i / RATE;
    ph += (2 * Math.PI * (48 + 80 * Math.exp(-t * 28))) / RATE;
    buf[i0 + i]! += Math.sin(ph) * Math.exp(-t * 9) * gain;
  }
}

function hat(buf: Float32Array, at: number, gain: number, rnd: () => number) {
  const i0 = Math.round(at * RATE);
  let lp = 0;
  for (let i = 0; i < 0.06 * RATE && i0 + i < buf.length; i++) {
    const x = rnd();
    lp += 0.35 * (x - lp);
    buf[i0 + i]! += (x - lp) * Math.exp(-(i / RATE) * 70) * gain;
  }
}

/** Gentle saturation, fades, and a fixed RMS so the bed sits under the voice. */
function master(buf: Float32Array, fadeIn: number, fadeOut: number): Float32Array {
  const len = buf.length / RATE;
  const out = buf.map((v, i) => Math.tanh(v) * Math.min(1, i / RATE / fadeIn, (len - i / RATE) / fadeOut));
  const rms = Math.sqrt(out.reduce((a, v) => a + v * v, 0) / out.length) || 1;
  const peak = out.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  const g = Math.min(0.14 / rms, 0.9 / peak);
  return out.map((v) => v * g);
}

function bed(seconds: number, bpm: number, chords: { bass: number; pad: number[] }[], pulse: "trailer" | "light", seed: number): Float32Array {
  const buf = new Float32Array(Math.round(seconds * RATE));
  const spb = 60 / bpm;
  const bars = Math.ceil(seconds / (4 * spb));
  const rnd = noise(seed);
  for (let bar = 0; bar < bars; bar++) {
    const t0 = bar * 4 * spb;
    const c = chords[bar % chords.length]!;
    for (const m of c.pad) note(buf, t0, 4 * spb + 1, midi(m), 1, pad);
    note(buf, t0, 4 * spb * 0.95, midi(c.bass), 1, bass);
    if (pulse === "trailer") {
      // Builds: pad only for 2 bars, then a soft pulse, then a kick on every beat.
      if (bar >= 2) for (let b = 0; b < 8; b++) note(buf, t0 + b * spb * 0.5, 0.3, midi(c.pad[b % c.pad.length]! + 12), 0.5, pluck);
      if (bar >= 4) for (let b = 0; b < 4; b++) {
        kick(buf, t0 + b * spb, 0.5);
        hat(buf, t0 + b * spb + spb / 2, 0.25, rnd);
      }
    } else {
      for (let b = 0; b < 8; b++) note(buf, t0 + b * spb * 0.5, 0.3, midi(c.pad[[0, 2, 1, 2, 0, 1, 2, 1][b]!]! + 12), b % 2 ? 0.35 : 0.5, pluck);
      for (let b = 0; b < 4; b++) hat(buf, t0 + b * spb + spb / 2, 0.15, rnd);
    }
  }
  return master(buf, 1.2, 2.5);
}

const ch = (b: number, ...p: number[]) => ({ bass: b, pad: p });
const PROMO = [ch(38, 62, 65, 69, 72), ch(34, 62, 65, 70, 74), ch(41, 60, 65, 69, 72), ch(36, 60, 64, 67, 72)];
const DEMO = [ch(36, 60, 64, 67, 71), ch(33, 60, 64, 69, 72), ch(29, 60, 65, 69, 72), ch(31, 59, 62, 67, 71)];

function sfx(name: string): Float32Array {
  const rnd = noise(name.length * 7);
  const render = (d: number, f: (t: number) => number) => {
    const b = new Float32Array(Math.round(d * RATE));
    for (let i = 0; i < b.length; i++) b[i] = f(i / RATE);
    const peak = b.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
    return b.map((v) => (v / peak) * 0.7);
  };
  let lp = 0;
  let ph = 0;
  switch (name) {
    case "whoosh":
    case "swipe": {
      const d = name === "whoosh" ? 0.55 : 0.3;
      return render(d, (t) => {
        const p = t / d;
        lp += (0.02 + 0.25 * Math.sin(Math.PI * p)) * (rnd() - lp);
        return lp * Math.sin(Math.PI * p) ** 1.5;
      });
    }
    case "pop":
      return render(0.14, (t) => {
        ph += (2 * Math.PI * (900 * Math.exp(-t * 18) + 220)) / RATE;
        return Math.sin(ph) * Math.exp(-t * 30) * Math.min(1, t * 400);
      });
    case "tap":
      return render(0.06, (t) => rnd() * Math.exp(-t * 220) * 0.6 + Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 60));
    case "ding":
    case "bell": {
      const f = name === "ding" ? 1320 : 880;
      return render(1.1, (t) => (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(2 * Math.PI * f * 2 * t) + 0.2 * Math.sin(2 * Math.PI * f * 3.02 * t)) * Math.exp(-t * 4.5) * Math.min(1, t * 800));
    }
    default:
      throw new Error(name);
  }
}

mkdirSync(join("public", "music"), { recursive: true });
mkdirSync(join("public", "sfx"), { recursive: true });
writeFileSync(join("public", "music", "promo-bed.wav"), wav(bed(42, 96, PROMO, "trailer", 3)));
writeFileSync(join("public", "music", "demo-bed.wav"), wav(bed(48, 104, DEMO, "light", 5)));
for (const name of ["whoosh", "pop", "tap", "ding", "bell", "swipe"]) writeFileSync(join("public", "sfx", `${name}.wav`), wav(sfx(name)));
console.log("Wrote public/music/{promo,demo}-bed.wav and public/sfx/*.wav");
