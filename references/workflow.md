# Detailed workflow

## 1. Brief (a single set of questions)

- Voice: ElevenLabs (recommended), the user's own recorded voice, or Runway.
- Character: a persona of the target audience (e.g. a Cameroonian student), a mascot, or a realistic avatar (not recommended).
- Formats: 9:16 (TikTok, Reels, Status) and/or 16:9 (YouTube), 1:1 if requested (add a framing in `stage`).
- Music: ElevenLabs Music, a provided file, or none.

## 2. Script

Approved model (Mbeng): [exemple-script-mbeng.md](exemple-script-mbeng.md). 6 scenes, ~55 s with pauses.
The character is a guide, not a fake testimonial.

## 3. ElevenLabs

```bash
# library voices (language filter + search), free previews
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/shared-voices?language=fr&page_size=100&search=africa"
```

Read the key with `set -a && . ./.env.local && set +a` in the same command, without printing it.
Send the user 6 to 8 previews (young voices first for a student audience).

- TTS: `eleven_multilingual_v2`, `language_code: "fr"`, `stability 0.45, similarity_boost 0.8, style 0.35`.
- Music: `POST /v1/music` `{ prompt, music_length_ms, force_instrumental: true }` (3 s to 10 min).
- Sound effects: `POST /v1/sound-generation` `{ text, duration_seconds (0.5–30), prompt_influence: 0.6 }`.

## 4. Adapt the templates

- `theme.ts`: brand colors and fonts.
- `character.tsx`: constants `SKIN`, `HAIR`, `SLEEVE`, hoodie colors; screens `Screen` → names of the screenshots in `public/screens/<lang>/`.
- `voiceover.ts`: scenes, `VOICE_ID`.
- `acting.ts`: `sceneBeats` per scene (words of the new voice), `POPS`.
- `voiced.tsx`: `Panel` per scene (visuals, numbers), ending text (URL).
- `root.tsx`: composition ids; npm render scripts to `out/…`.

## 5. Render

```bash
pnpm run video:render:vertical && pnpm run video:render:horizontal   # in the background
```

Send the MP4s (SendUserFile, `display: attach`). Do not commit `out/`.
