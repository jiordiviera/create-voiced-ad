# Validation report: Agensi promo (Community Edition)

Date: 2026-10-22. Machine: Linux (Ubuntu 26.04), Node 22, pnpm 12.14.0, Remotion 4.0.533, system
FFmpeg. Only checks that were actually run are listed.

## Results

| Check | Result | How |
|---|---|---|
| Rendering | **PASS**: exit 0, 1200 frames in about 2.5 min | `pnpm render:promo` |
| Format | **PASS**: H.264 High, 1920 × 1080, 30 fps; AAC LC, 48 kHz stereo, 192 kb/s | `ffprobe` |
| Duration | **PASS**: 40.02 s (target 40 s) | `ffprobe` |
| Missing visual or audio assets | **PASS**: none. Remotion fails on a missing `staticFile`; the render log has no error. Its only "404" is the frame counter ("Rendered 404/1200"). | render log |
| Browser rendering errors | **PASS**: 0 browser console lines in the render log | render log |
| Loudness | **PASS**: −14.0 LUFS integrated, LRA 2.5 LU | two-pass `loudnorm`, then re-measured |
| Clipping | **PASS**: true peak −2.0 dBTP, sample peak −2.05 dBFS, flat factor 0 | `loudnorm`, `astats` |
| Unwanted silence | **PASS**: one quiet stretch under −40 dB lasting ≥ 0.4 s, at 0.00–0.47 s, which is the music fade-in at the start | `silencedetect` |
| Text readability | **PASS**: 16 frames extracted from the final MP4 and looked at. Every headline, caption and label is inside the frame; the smallest text is the footnotes (20–22 px). | frames from the MP4 |
| Captions | **PASS** (by construction): built from the exact narration text and ElevenLabs character timestamps; spoken word highlighted; SRT has 15 cues with no overlaps, including the demo ad line heard on its own | `pnpm srt` and an overlap check |
| Official branding | **PASS**: `public/logo.png` is the supplied image converted from WEBP to PNG, verified pixel-identical; only scaled; the light sweep is clipped to the logo's alpha. No other brand identity. | pixel comparison, frames |
| Demo ad (real output) | **PASS**: Quietdesk ad rendered from the adapted Community templates, 1920 × 1080, 23.04 s, −16.6 LUFS (the template's per-clip −15 LUFS, not normalized further); 8-frame contact sheet looked at; 3 template tests pass | `pnpm render:demo`, `pnpm test` |
| Types | **PASS** | `pnpm typecheck` |

## Paid generation

ElevenLabs, approved by the owner (budget ≈ 789 credits): 759 credits used.
- 488 for the promo narration (6 lines).
- 271 for the Quietdesk demo narration (4 lines).

Each run was capped with `--max-credits` at its estimate. No ElevenLabs Music or Sound Effects was
used.

## Accuracy of claims

The on-screen text and narration were checked against the Community `SKILL.md`. Shown as such:
- a Claude Code skill;
- Remotion templates copied into the user's project and adapted;
- an articulated SVG character;
- ElevenLabs voiceover with timestamps, using the user's key and paid by usage, after the script is
  approved;
- lip-sync and captions.

Stated explicitly on screen:
- AI voice needs your own ElevenLabs account, paid by usage;
- Quietdesk is fictional.

Not claimed: one-click generation, other agents, free AI voice, fully autonomous generation.

## Not verified

- Captions against an independent speech-to-text transcript (they come from the generation timestamps).
- A human listening pass.
- The 9:16 export (optional, not made).
- Commercial rights of the two ElevenLabs Voice Library voices for the owner's plan.
- "Available on Agensi": the listing does not exist yet. The video should be published only with the
  listing.
