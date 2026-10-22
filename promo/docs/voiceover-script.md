# Voiceover script: Agensi promo (Community Edition)

Language: English, neutral American. Voice: ElevenLabs Voice Library "Justin Case – Warm, Trustworthy,
Clear" (`DtQLDxHbTiQTpVVanTy1`), model `eleven_multilingual_v2`, stability 0.5, similarity 0.8, style
0.25. Generated once with character timestamps (488 characters ≈ 488 credits), normalized to −15 LUFS
per clip; the final mix is normalized to −14 LUFS.

| # | Scene | Starts | Length | Line |
|---|---|---|---|---|
| 1 | Hook | 0.75 s | 3.67 s | What if creating a video ad was as simple as describing your idea? |
| 2 | Problem | 4.75 s | 5.90 s | Writing scripts, recording voiceovers, animating scenes, and adding captions takes time. |
| 3 | Solution | 11.05 s | 4.64 s | Create Voiced Ad brings these steps together in a reusable Claude Code workflow. |
| 4 | Demo | 18.55 s | 7.11 s | Bring your message to life with animated characters, AI narration, synchronized speech, and captions. |
| — | Demo ad, own audio | 25.95 s | 2.9 s | *(Quietdesk demo ad)* Is your support inbox on fire again? |
| 5 | Developer | 29.25 s | 4.97 s | Built with Remotion, open source, and ready for developers to customize. |
| 6 | CTA | 34.75 s | 4.92 s | Create your next voiced ad with Create Voiced Ad. Get the free Community Edition. |

Source of truth: `src/promo/voiceover.ts` (lines) and `src/promo/timeline.ts` (start times).

## Replacing the narration

1. Edit the lines in `src/promo/voiceover.ts` (and `VOICE_ID` for another voice).
2. `pnpm voice -- --set promo` prints the scenes to generate and the estimated credits; nothing is
   generated. After approval: `pnpm voice -- --set promo --approve --max-credits <estimate>`
   (needs `ELEVENLABS_API_KEY` in `promo/.env.local`; paid by your ElevenLabs plan).
3. If a line got longer, adjust its scene window in `src/promo/timeline.ts`, then `pnpm render:promo`
   and `pnpm srt`.

To use a recorded human voice instead: replace `public/promo/voiceover/<scene>.mp3` and provide
character timings in `src/promo/voiceover-timings.json` (same format), or the captions will not match.
