# create-voiced-ad

Claude Code skill to create, in one pass, a **video ad with a voiceover and an animated character** (TikTok, Reels,
WhatsApp Status, YouTube), with [Remotion](https://www.remotion.dev) and [ElevenLabs](https://elevenlabs.io).

The character is not just an avatar that moves its mouth: it acts out the scene. It waves, points at what
appears on screen, takes out its phone with real screenshots of your app, taps on it, holds its head in its
hands, gives a thumbs-up. The camera moves, key words pop in to the rhythm of the voice, the music lowers when it speaks.

- ElevenLabs voiceover with per-character timing → synced mouth and timed captions
- SVG character with articulated arms (inverse kinematics), phone in hand, expressions
- Automatic micro-movements: breathing, blinking, glances, talking hands
- Generated music and sound effects (ElevenLabs Music and Sound Effects), sound normalized for social networks
- Formats 9:16 ("link in my bio") and 16:9 ("link in the description")

## Installation

```bash
git clone https://github.com/jiordiviera/create-voiced-ad ~/.claude/skills/create-voiced-ad
```

Then, in Claude Code: "make a video ad with a voiceover and an animated character for my app", or `/create-voiced-ad`.

## Requirements

- A project with Remotion (the skill adds it otherwise), `ffmpeg`, `tsx`
- An ElevenLabs key in `.env.local` (`ELEVENLABS_API_KEY`), with the permissions Text to Speech,
  Voices (read), Music and Sound Effects. ElevenLabs usage is paid by your plan; check that your plan allows commercial use before publishing.

## Contents

| Path | Role |
|---|---|
| `SKILL.md` | Instructions for Claude: workflow, validation, pitfalls, success criteria |
| `references/` | Gesture vocabulary, technical pitfalls, detailed workflow, feedback journal |
| `templates/` | Starter code (Remotion + audio generation scripts), taken from the [Mbeng](https://mbeng.jiordiviera.me) project |

The skill improves with every video: feedback and new gestures are added to the journal and the templates.

## License

MIT
