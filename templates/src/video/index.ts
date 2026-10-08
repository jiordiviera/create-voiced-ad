// Point d'entrée Remotion (Studio et rendu MP4) : pnpm run video:studio / pnpm run video:render.
// Sur le site, la vidéo est jouée en direct par <Player> (src/components/promo-player.tsx).
import { registerRoot } from "remotion";
import { RemotionRoot } from "./root";

registerRoot(RemotionRoot);
