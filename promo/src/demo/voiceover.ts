// Voiceover of the Quietdesk demo ad, made with the Community templates (fictional product).
// One entry per scene: `text` is read by the voice, `caption` (if set) is the displayed subtitle.
// After editing: pnpm voice -- --set demo (shows the cost first; generation needs --approve).

export const VOICE_ID = "9HBoEQ8LqyvVZFYDodnr"; // ElevenLabs Voice Library: "Emma – Professional Commercial Voice"

export const VOICEOVER = [
  { id: "problem", text: "Is your support inbox on fire again? Three tools, fifty tabs, and nobody knows who replied." },
  { id: "solution", text: "Quietdesk puts every customer message in one calm, shared inbox." },
  { id: "assign", text: "Assign a conversation in one tap, and everyone sees who is on it." },
  // 16:9 ending (YouTube: "in the description").
  { id: "fin-description", text: "Try Quietdesk free. The link is in the description." },
] as const satisfies readonly { id: string; text: string; caption?: string }[];

export type VoiceoverId = (typeof VOICEOVER)[number]["id"];
