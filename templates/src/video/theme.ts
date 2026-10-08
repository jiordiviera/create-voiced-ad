import { Easing, interpolate } from "remotion";

// Charte Mbeng pour la vidéo. Les polices viennent des variables next/font sur le site,
// et de @remotion/google-fonts pour le rendu MP4 (voir src/video/index.ts).

export const C = {
  creme: "#FAF7F2",
  papier: "#FFFFFF",
  ligne: "#E4DED2",
  indigo: "#1E2A5E",
  indigoDoux: "#4A5272",
  indigoPale: "#D6DAEA",
  ocre: "#E3A72F",
  ocrePale: "#FBF0D6",
  ocreTexte: "#7A5410",
  foret: "#2F7D4F",
  foretPale: "#E6F1EA",
  foretTexte: "#22603C",
  terre: "#C2502E",
  terrePale: "#F6DED5",
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
