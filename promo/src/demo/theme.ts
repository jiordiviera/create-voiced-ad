import { Easing, interpolate } from "remotion";

// Quietdesk demo palette (fictional product). Keys kept from the Community template, values changed.
// Fonts come from @remotion/google-fonts (loaded in src/root.tsx).

export const C = {
  creme: "#F3F6F5",
  papier: "#FFFFFF",
  ligne: "#DCE5E3",
  indigo: "#16324F",
  indigoDoux: "#4B6177",
  indigoPale: "#D5E3EE",
  ocre: "#F2994A",
  ocrePale: "#FDEBDC",
  ocreTexte: "#9A4E12",
  foret: "#2E9C7A",
  foretPale: "#DDF3EB",
  foretTexte: "#1E6B53",
  terre: "#D64545",
  terrePale: "#F9DEDE",
};

export const FONT_HEADING = "var(--font-bricolage, 'Bricolage Grotesque'), ui-sans-serif, sans-serif";
export const FONT_BODY = "var(--font-raleway, 'Raleway'), ui-sans-serif, sans-serif";

export const FPS = 30;
export const SIZE = 1080;

const OUT = Easing.bezier(0.16, 1, 0.3, 1);

/** Progression 0 → 1 entre deux frames, avec un départ vif et un arrêt doux. */
export function ease(frame: number, from: number, duration = 18): number {
  return interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });
}
