# Known pitfalls

- **Remotion props**: `component` expects indexable props → `type Props = {...}`, not `interface` (otherwise TS2322).
- **Scripts with top-level `await`**: `.mts` extension (tsx outputs CJS for `.ts`). Import the project without an extension
  (`../src/video/voiceover`), otherwise TS5097 at typecheck.
- **`tsx --env-file=.env.local`** to read the key without printing it. Never run `echo $ELEVENLABS_API_KEY`.
- **ElevenLabs voice very quiet** (peak −24 dB): normalize with `loudnorm=I=-15:TP=-1.5:LRA=11` (already in the script).
  Music −16 LUFS, sound effects −18 LUFS, then volumes in the composition.
- **Library voices**: usable directly by `voice_id` in TTS; the `preview_url` previews are free.
- **Timing**: endpoint `/v1/text-to-speech/{id}/with-timestamps` → `alignment.characters` + start/end times.
  `wordTime` looks for the first lowercase occurrence: choose words that are unique in the scene (or a group of words).
- **Captions**: `text` and `caption` must have the same breaks (punctuation followed by a space); the dots of a URL do not break.
- **`Date.now()`** forbidden in React rendering (lint "impure") and in Next prerendering (Cache Components): go through a utility function outside the component.
- **Screenshots**: `NEXT_LOCALE` (cookie) can redirect to `/en`; set the cookie first. Dexie stores `version(1)` as IndexedDB version 10.
  Delete the test database afterwards (`indexedDB.deleteDatabase`).
- **French typography**: non-breaking spaces between digit groups ("85 000"), before units and in dates, otherwise ugly breaks in the screenshots.
- **Html5Audio** (not `Audio`, not `@remotion/media` if not installed); `volume` accepts a function of the frame (ducking).
- **Render**: ~3 to 5 min per format for 1 min of video; run it in the background and check a contact sheet of frames first.
- **SVG**: `transform-origin` in px works in viewBox coordinates; `overflow: visible` on the `<svg>` for raised arms.
