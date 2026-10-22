import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadRaleway } from "@remotion/google-fonts/Raleway";
import { Composition, Still } from "remotion";
import { QuietdeskVoiced, voicedDuration } from "./demo/voiced";
import { QuietdeskScreen } from "./demo/screens";
import { CommunityPromo } from "./promo/Promo";
import { PromoThumbnail } from "./promo/Thumbnail";
import { DURATION, FPS } from "./promo/timeline";

// Fonts of the Quietdesk demo (from the Community template); the promo loads Inter and JetBrains Mono.
loadBricolage("normal", { weights: ["700", "800"], subsets: ["latin"] });
loadRaleway("normal", { weights: ["600", "700"], subsets: ["latin"] });

export function RemotionRoot() {
  return (
    <>
      {/* The promo for Agensi (16:9 primary). */}
      <Composition id="CommunityPromo16x9" component={CommunityPromo} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
      <Still id="CommunityPromoThumbnail" component={PromoThumbnail} width={1920} height={1080} />
      {/* The demo ad made with the Community templates (fictional product), 16:9 "link in the description". */}
      <Composition
        id="QuietdeskAdHorizontal"
        component={QuietdeskVoiced}
        defaultProps={{ layout: "horizontal" as const, ending: "fin-description" as const }}
        durationInFrames={voicedDuration("fin-description")}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Still id="QuietdeskScreen" component={QuietdeskScreen} defaultProps={{ screen: "inbox" as const }} width={750} height={1624} />
    </>
  );
}
