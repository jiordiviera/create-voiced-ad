---
name: create-voiced-ad
description: Creates a video ad (TikTok, Reels, WhatsApp Status, YouTube) with an AI voiceover, an animated character who acts out the scene and uses the app, captions, music and sound effects, with Remotion + ElevenLabs. Use when the user asks for a video ad, a promo or presentation video with a voiceover, an animated character presenting a product, a "motion design video" for social networks, or wants to remake or evolve a video made with this skill. Works for ads in English or French (e.g. "vidéo pub avec voix off").
---

<objective>
Produce, in one pass, a lively video ad (not a PowerPoint presentation): an articulated SVG character who speaks
(mouth synced to the voice), gestures, holds the phone with real screenshots of the app, taps on it,
reacts; a moving camera; visuals that pop on the words; captions; music lowered under the voice;
sound effects. Formats 9:16 (ending "link in my bio") and 16:9 (ending "link in the description").
Then improve the skill with what was learned (see <evolution>).
</objective>

<context>
Reference model: the Mbeng project (`~/workspace/personal/mbeng`, `src/video/`). The files in
`templates/` are a copy of it, ready to adapt:

| File | Role |
|---|---|
| `src/video/voiceover.ts` | Text per scene (`text` read by the speech synthesis, numbers spelled out; `caption` displayed) + `VOICE_ID`. Two endings: `fin-bio`, `fin-description`. |
| `scripts/generate-voiceover.mts` | ElevenLabs TTS **with-timestamps** → `public/video/voiceover/<id>.mp3` (normalized to −15 LUFS) + `src/video/voiceover-timings.json`. Only regenerates changed scenes (`--all` for everything). |
| `scripts/generate-audio.mts` | Music (ElevenLabs Music, instrumental) + sound effects (Sound Effects) → `public/video/music/`, `public/video/sfx/`, normalized. Missing files only. |
| `src/video/lipsync.ts` | `planFor(ending)` (scene sequence), `mouthAt` (mouth shape per character), `wordTime(scene, word)`, `captions` (segments grouped into ≤ 8 words). |
| `src/video/character.tsx` | SVG character 600×900: arms with inverse kinematics (you give the hand, the elbow follows), hands `open/fist/point/thumb/phone`, phone in hand with a screenshot (`screen`, zoom, scroll, `ring` frame), face (yaw, gaze, eyebrows, worry, smile). |
| `src/video/acting.ts` | The acting: "beats" keyed to words (`w("word")`), framing (`stage` wide/close), zoom punches (`punches`), sound effects (`cues`, `POPS`). |
| `src/video/voiced.tsx` | Composition: automatic micro-movements (`alive`), camera, animated backdrop, `Panel` per scene, captions, music with ducking, audio. |
| `src/video/root.tsx` | Compositions `…Vertical` 1080×1920 and `…Horizontal` 1920×1080. |

Details: [references/workflow.md](references/workflow.md), gesture vocabulary:
[references/acting.md](references/acting.md), known pitfalls: [references/pitfalls.md](references/pitfalls.md),
history of requests and corrections: [references/journal.md](references/journal.md).
</context>

<quick_start>
1. Read `references/journal.md` (preferences the user already expressed) and `references/pitfalls.md`.
2. Brief in one grouped question (AskUserQuestion): voice (ElevenLabs recommended), character, formats, music.
3. Write the script (5 to 7 scenes, 40 to 55 s, one idea per scene, verified numbers) → **get it approved before any paid generation**.
4. Copy `templates/` into the project, adapt `theme.ts`, `voiceover.ts`, the character and the `Panel`s.
5. `pnpm run video:voice`, `pnpm run video:audio`, a contact sheet of still frames, then render both formats.
</quick_start>

<workflow>
1. **Prerequisites**: Remotion already installed in the project (otherwise `remotion`, `@remotion/cli`, `@remotion/google-fonts`, same exact version), `ffmpeg` available, `tsx`.
   `ELEVENLABS_API_KEY` added **by the user** to `.env.local` (never pasted in the chat), with the permissions
   Text to Speech, Voices (read), Music, Sound Effects. npm scripts: `video:voice`, `video:audio`, `video:render:vertical`, `video:render:horizontal`
   (`tsx --env-file=.env.local scripts/….mts`).
2. **Script**: question hook → problem (strong number) → solution (the app in action) → proof (sourced number) → benefit → privacy/free → call to action.
   Address the viewer informally if the product does. Numbers only from the project's verified data. Write `text` (numbers spelled out, "mbeng point jiordiviera point me") and `caption`.
   Same punctuation in `text` and `caption` (the test checks it).
3. **Voice**: list the library (`GET /v1/shared-voices?language=fr&search=africa…`), download the `preview_url`s (free) and send them to the user; they choose. Then `video:voice`.
4. **Screenshots**: real screenshots of the app in phone format 375×812 (built-in browser, mobile viewport), test profile injected into local storage then **deleted** afterwards. Check that no outdated number appears and that numbers/dates do not break across lines (non-breaking spaces).
5. **Character**: adapt skin, hair, clothes (brand colors) in `character.tsx`; keep the geometry (shoulders, arm lengths) unless needed.
6. **Acting** (`acting.ts`): for each scene, at least 4 to 6 actions keyed to words (see `references/acting.md`). The character must **do** what the voice says (take out the phone, tap, show, react). Camera zoom on 3 to 4 key words max.
7. **Visuals** (`Panel`): one visual per scene that pops on the words (pop effect with overshoot), floats slightly, with a "pop" sound effect.
8. **Audio**: `video:audio` (instrumental music ~62 s, sound effects whoosh/pop/tap/ding/bell/swipe). Music at ~0.13 under the voice, ~0.30 in silences, fades.
9. **Check** then render (see <validation>), send the MP4s (SendUserFile, `display: attach`).
10. **Improve the skill** (see <evolution>).
</workflow>

<validation>
- `pnpm exec vitest run src/video`: captions aligned, scenes without overlap, trigger words found.
- `pnpm typecheck` and `pnpm lint` pass.
- Contact sheet of still frames before any full render:
  `pnpm exec remotion still src/video/index.ts <Composition> out.png --frame=N --scale=0.3` on 8 frames, then
  `ffmpeg -pattern_type glob -i 'v-*.png' -filter_complex tile=4x2 grid.png` and look at it: gestures visible,
  captions covering neither the title nor the phone, nothing cut off at the edge.
- Sound: `ffmpeg -i out.mp4 -af volumedetect -f null -` → mean around −19 dB, peak around −3 dB.
- Expected duration (`ffprobe`), both formats rendered.
</validation>

<anti_patterns>
- A character that only moves its mouth and visuals that simply fade in: rejected by the user ("not dynamic", "PowerPoint presentation").
- Generating voice/music before the text is approved, or regenerating everything for one changed sentence (the scripts only redo what is needed).
- An unverified or outdated number in the voice, the visuals or the screenshots.
- Word-by-word or too choppy captions; captions over the phone in close-up.
- "Link in bio" in 16:9 YouTube (there is no bio): dedicated ending "in the description".
- AI realistic avatar: hard to control, expensive, the app screen becomes fake.
</anti_patterns>

<success_criteria>
- Two MP4s (9:16 and 16:9) with voice, captions, lowered music, sound effects, normalized sound.
- The character acts in every scene (at least one gesture tied to the meaning of the sentence) and reacts (expressions).
- All numbers come from verified data; screenshots up to date.
- Tests, typecheck, lint OK; files committed (not the MP4s in `out/`).
- `references/journal.md` updated, and the templates if the code improved.
</success_criteria>

<evolution>
This skill improves with every video:
1. Add a dated entry to `references/journal.md`: request, user feedback, what was changed.
2. A new technical pitfall → `references/pitfalls.md`. A new gesture or hand shape → `references/acting.md` and `templates/`.
3. If the project's code improved (new gesture, new visual, better setting), copy the files concerned back into `templates/`,
   removing what is project-specific (text, colors) or flagging it in a comment.
4. Keep this SKILL.md short: details go in `references/`.
</evolution>
