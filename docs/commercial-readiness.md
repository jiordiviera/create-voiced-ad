# Commercial readiness audit

Status: **planning only**. This repository remains the free, MIT-licensed community edition. No proprietary Pro edition is included or promised here.

## Findings from the current repository

| Area | Current state | Release blocker / action |
| --- | --- | --- |
| Skill manifest | Root `SKILL.md` has `name` and `description` frontmatter, in French | Validate ZIP root structure and parser compatibility on the target marketplace |
| Voice and captions | ElevenLabs TTS scripts and Remotion templates exist | Verify account permissions, usage limits, commercial usage and generated audio quality |
| Product-specific materials | `templates/src/video/voiceover.ts` contains Mbeng copy, claims, prices and domain | Replace with a fictitious, claim-safe demo before distribution to paying users |
| Product-specific theme | `templates/src/video/theme.ts` includes Mbeng colors and font configuration | Create a brand-neutral example with configurable tokens |
| Product-specific references | `references/exemple-script-mbeng.md` and `references/journal.md` include original project context | Keep the historical case study separate from the reusable default workflow |
| Environment assumptions | Workflow assumes a Remotion project, package scripts, ffmpeg, tsx, local API credentials and project-specific paths | Add dependency validation, setup guide, clean-room installation test and graceful errors |
| Tests | `templates/src/video/lipsync.test.ts` exists | Provide a runnable sample project with package manifest and repeatable CI test matrix |
| Supported agents | README primarily documents Claude Code | Verify other clients independently, do not advertise untested compatibility |
| Usage costs | ElevenLabs generation consumes credits | Require user approval before chargeable generation, document credit consumption |
| Secrets / assets | ElevenLabs key is expected in local env, screenshots are captured from apps | Ensure no secrets or personal customer assets enter ZIP, commits, logs or examples |
| Licensing | Repository is MIT licensed | Preserve notice and existing recipients' rights; develop separately owned new material if creating a paid package |

## Edition boundary

**Community (this public repository):** maintain the current MIT code and keep it usable. Improvements and bug fixes remain possible. Do not remove already published files to retroactively restrict use.

**Potential Pro (separate private codebase or distribution):** *proposed*, not yet implemented: independently created starter project, configurable brand-neutral templates, reviewed scripts, robust installer and diagnostics, more use-case examples, bilingual docs and verified end-to-end sample renders. Identify the genuinely new value before selecting a price.

A commercial ZIP should only be sold when the new functionality and quality improvements actually exist. The current MIT package can legally be sold by anyone who preserves its license notice.

## Release gates

- [ ] Define a clean-room demo project with no Mbeng branding, sensitive screenshots or unverified numeric claims
- [ ] Validate manifest YAML and root-path ZIP layout
- [ ] Run dependency installation, unit tests, lint and TypeScript checks in the standalone sample project
- [ ] Render and manually inspect one vertical and one horizontal demo, including subtitles, safe areas and sound
- [ ] Verify absent-API-key behavior and obtain explicit consent before external paid API calls
- [ ] Confirm rights to example graphics, audio, voices, screenshots and fonts for commercial distribution
- [ ] Write honest supported-client and supported-language matrix
- [ ] Confirm seller account, Stripe onboarding, VAT/tax handling, refund terms and support obligations
- [ ] Validate installation on a machine with no Mbeng project or local assets
- [ ] Prepare listing copy backed by actual tested capabilities and customer-ready examples

## Initial offer hypothesis (not a promise)

Single-purpose **Create Voiced Ad Pro**, one-time **$19** listing test on Agensi. Track listing impressions, clicks, installs, support requests, refunds and actual sales. Revisit positioning after first five paying customers.

Keep the Pro package private. This document only tracks readiness of the existing open-source project and possible separation.
