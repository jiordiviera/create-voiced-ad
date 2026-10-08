import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadRaleway } from "@remotion/google-fonts/Raleway";
import { Composition } from "remotion";
import { MbengPromo, PROMO_DURATION } from "./mbeng-promo";
import { MbengVoiced, voicedDuration } from "./voiced";
import { FPS, SIZE } from "./theme";

// Rendu hors du site : les polices sont chargées ici, pas sur le site (qui les héberge lui-même).
loadBricolage("normal", { weights: ["700", "800"], subsets: ["latin"] });
loadRaleway("normal", { weights: ["600", "700"], subsets: ["latin"] });

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="MbengPromo"
        component={MbengPromo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={SIZE}
        height={SIZE}
      />
      {/* Pub avec voix off et personnage : 9:16 (TikTok, Reels, Statuts : « lien en bio ») et 16:9 (YouTube : « en description »). */}
      <Composition
        id="MbengVoixVertical"
        component={MbengVoiced}
        defaultProps={{ layout: "vertical" as const, ending: "fin-bio" as const }}
        durationInFrames={voicedDuration("fin-bio")}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MbengVoixHorizontal"
        component={MbengVoiced}
        defaultProps={{ layout: "horizontal" as const, ending: "fin-description" as const }}
        durationInFrames={voicedDuration("fin-description")}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
}
