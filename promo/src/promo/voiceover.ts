// Narration of the Agensi promo for the free Community Edition (English, neutral American voice).
// One entry per scene; `text` is spoken, `caption` (when different) is shown. After a change:
// pnpm voice -- --set promo (shows the cost first; generation needs --approve).

export const VOICE_ID = "DtQLDxHbTiQTpVVanTy1"; // ElevenLabs Voice Library: "Justin Case – Warm, Trustworthy, Clear"

export const VOICEOVER = [
  { id: "hook", text: "What if creating a video ad was as simple as describing your idea?" },
  { id: "problem", text: "Writing scripts, recording voiceovers, animating scenes, and adding captions takes time." },
  { id: "solution", text: "Create Voiced Ad brings these steps together in a reusable Claude Code workflow." },
  { id: "demo", text: "Bring your message to life with animated characters, AI narration, synchronized speech, and captions." },
  { id: "developer", text: "Built with Remotion, open source, and ready for developers to customize." },
  { id: "cta", text: "Create your next voiced ad with Create Voiced Ad. Get the free Community Edition." },
] as const satisfies readonly { id: string; text: string; caption?: string }[];

export type PromoVoiceId = (typeof VOICEOVER)[number]["id"];
