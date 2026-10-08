import { staticFile } from "remotion";
import { C } from "./theme";

// Le personnage de la vidéo : un étudiant camerounais en buste, dessiné en SVG (viewBox 600 × 900).
// Les bras sont articulés (cinématique inverse à deux segments) : on donne la position voulue de
// chaque main, l'épaule et le coude suivent. Tout est piloté par la pose, calculée image par image.

const SKIN = "#7A4A2E";
const SKIN_SHADE = "#663B23";
const HAIR = "#1B1412";
const LIP = "#5A2E1E";
const MOUTH_IN = "#3A1810";
const SLEEVE = "#27357A";
const SLEEVE_EDGE = "#141C45";

export type HandShape = "open" | "fist" | "point" | "thumb" | "phone";
/** Écran affiché sur le téléphone : capture « prochaine étape », fiche C3, ou cadenas. */
export type Screen = "next-step" | "step" | "lock";

export interface CharacterPose {
  // Corps
  lean: number;
  bounce: number;
  // Tête et visage
  headTilt: number;
  headYaw: number;
  nod: number;
  lookX: number;
  lookY: number;
  brows: number;
  worry: number;
  smile: number;
  eyes: number;
  mouthOpen: number;
  mouthRound: number;
  // Mains (coordonnées du dessin) et forme
  lx: number;
  ly: number;
  rx: number;
  ry: number;
  handL: HandShape;
  handR: HandShape;
  // Téléphone tenu dans la main droite
  phoneSize: number;
  screen: Screen;
  screenZoom: number;
  screenScroll: number;
  ring: number;
  screenLang: "fr" | "en";
}

const SHOULDER_L = { x: 205, y: 625 };
const SHOULDER_R = { x: 395, y: 625 };
const UPPER = 150;
const FORE = 148;

/** Cinématique inverse : coude et main à partir de l'épaule et de la cible, coude vers l'extérieur. */
function solveArm(shoulder: { x: number; y: number }, tx: number, ty: number, outward: 1 | -1) {
  const dx = tx - shoulder.x;
  const dy = ty - shoulder.y;
  const dist = Math.min(Math.max(Math.hypot(dx, dy), 20), UPPER + FORE - 2);
  const base = Math.atan2(dy, dx);
  const alpha = Math.acos((UPPER * UPPER + dist * dist - FORE * FORE) / (2 * UPPER * dist));
  const candidates = [base + alpha, base - alpha].map((a) => ({ x: shoulder.x + UPPER * Math.cos(a), y: shoulder.y + UPPER * Math.sin(a) }));
  // Le coude part vers l'extérieur du corps (et plutôt vers le bas).
  const elbow = candidates.sort((a, b) => outward * (b.x - a.x) + (b.y - a.y) * 0.3)[0];
  const hand = { x: shoulder.x + dist * Math.cos(base), y: shoulder.y + dist * Math.sin(base) };
  return { elbow, hand };
}

function Hand({ shape, x, y, angle }: { shape: HandShape; x: number; y: number; angle: number }) {
  // Repère local : la main prolonge l'avant-bras vers +y (angle de l'avant-bras).
  if (shape === "thumb") {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-30} y={-26} width={60} height={56} rx={24} fill={SKIN} />
        <rect x={-12} y={-74} width={24} height={56} rx={12} fill={SKIN} />
        <path d="M-26 -2 H26 M-26 12 H26" stroke={SKIN_SHADE} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle - 90})`}>
      {shape === "open" && (
        <>
          <ellipse cx={0} cy={30} rx={30} ry={34} fill={SKIN} />
          <rect x={-26} y={44} width={13} height={34} rx={6.5} fill={SKIN} />
          <rect x={-10} y={50} width={13} height={38} rx={6.5} fill={SKIN} />
          <rect x={6} y={48} width={13} height={36} rx={6.5} fill={SKIN} />
          <rect x={20} y={14} width={13} height={34} rx={6.5} fill={SKIN} transform="rotate(-35 26 30)" />
        </>
      )}
      {shape === "fist" && <circle cx={0} cy={26} r={29} fill={SKIN} />}
      {shape === "point" && (
        <>
          <circle cx={0} cy={24} r={28} fill={SKIN} />
          <rect x={-8} y={36} width={17} height={58} rx={8.5} fill={SKIN} />
        </>
      )}
      {shape === "phone" && <circle cx={0} cy={22} r={28} fill={SKIN} />}
    </g>
  );
}

function PhoneInHand({ x, y, pose }: { x: number; y: number; pose: CharacterPose }) {
  const w = 200 * pose.phoneSize;
  const h = w * 2.165;
  const left = x - w / 2;
  const top = y + 26 - h;
  const pad = w * 0.04;
  const inner = { x: left + pad, y: top + pad, w: w - 2 * pad, h: h - 2 * pad };
  const id = `screen-${Math.round(x)}-${Math.round(y)}`;
  const zoom = pose.screenZoom;
  const imgH = inner.w * (812 / 375);
  return (
    <g>
      <rect x={left} y={top} width={w} height={h} rx={w * 0.13} fill={C.indigo} />
      <clipPath id={id}>
        <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} rx={w * 0.1} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {pose.screen === "lock" ? (
          <>
            <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} fill={C.creme} />
            <rect x={x - w * 0.22} y={inner.y + inner.h * 0.36} width={w * 0.44} height={w * 0.36} rx={w * 0.06} fill={C.indigo} />
            <path
              d={`M${x - w * 0.13} ${inner.y + inner.h * 0.37} v${-w * 0.1} a${w * 0.13} ${w * 0.13} 0 0 1 ${w * 0.26} 0 v${w * 0.1}`}
              fill="none"
              stroke={C.indigo}
              strokeWidth={w * 0.06}
            />
            <circle cx={x} cy={inner.y + inner.h * 0.36 + w * 0.18} r={w * 0.045} fill={C.ocre} />
          </>
        ) : (
          <image
            href={staticFile(`screens/${pose.screenLang}/${pose.screen}.jpg`)}
            x={inner.x - (inner.w * (zoom - 1)) / 2}
            y={inner.y - pose.screenScroll * (imgH * zoom - inner.h)}
            width={inner.w * zoom}
            height={imgH * zoom}
            preserveAspectRatio="xMidYMin slice"
          />
        )}
        {pose.ring > 0.01 && (
          <rect
            x={inner.x + inner.w * 0.04}
            y={inner.y + imgH * 0.515 - pose.screenScroll * (imgH - inner.h)}
            width={inner.w * 0.92}
            height={imgH * 0.115}
            rx={14}
            fill="none"
            stroke={C.ocre}
            strokeWidth={7}
            opacity={pose.ring}
          />
        )}
      </g>
      {/* Pouce par-dessus le bord du téléphone */}
      <rect x={x - w / 2 - 10} y={y - 30} width={34} height={18} rx={9} fill={SKIN} />
    </g>
  );
}

function Arm({ shoulder, elbow, hand }: { shoulder: { x: number; y: number }; elbow: { x: number; y: number }; hand: { x: number; y: number } }) {
  const d = `M${shoulder.x} ${shoulder.y} L${elbow.x} ${elbow.y} L${hand.x} ${hand.y}`;
  return (
    <g>
      <path d={d} fill="none" stroke={SLEEVE_EDGE} strokeWidth={72} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={SLEEVE} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function Character({ pose, style }: { pose: CharacterPose; style?: React.CSSProperties }) {
  const { headTilt, headYaw, nod, lookX, lookY, brows, worry, smile, eyes, mouthOpen, mouthRound } = pose;
  const left = solveArm(SHOULDER_L, pose.lx, pose.ly, -1);
  const right = solveArm(SHOULDER_R, pose.rx, pose.ry, 1);
  const angle = (a: { x: number; y: number }, b: { x: number; y: number }) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

  // Visage : les traits glissent avec la rotation de la tête (yaw), les pupilles suivent le regard.
  const fx = headYaw * 22;
  const px = lookX * 7;
  const py = lookY * 6;
  const mw = 46 - 16 * mouthRound;
  const mh = 4 + 30 * mouthOpen;
  const eyeRy = 13 * Math.max(0.08, eyes);
  const browUp = -6 * brows;
  const corner = 8 * smile;

  return (
    <svg viewBox="0 0 600 900" style={{ overflow: "visible", ...style }} aria-hidden="true">
      <g transform={`rotate(${pose.lean} 300 900) translate(0 ${pose.bounce})`}>
        {/* Corps : sweat indigo, cordons ocre, bretelles de sac à dos */}
        <path d="M70 900 C80 700 150 610 230 590 L370 590 C450 610 520 700 530 900 Z" fill={C.indigo} />
        <path d="M150 640 C140 720 136 800 134 900" stroke={C.terre} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d="M450 640 C460 720 464 800 466 900" stroke={C.terre} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d="M230 590 C250 640 350 640 370 590" fill="none" stroke={C.indigoDoux} strokeWidth={14} strokeLinecap="round" />
        <path d="M268 625 L262 715" stroke={C.ocre} strokeWidth={7} strokeLinecap="round" />
        <path d="M332 625 L338 715" stroke={C.ocre} strokeWidth={7} strokeLinecap="round" />
        <circle cx={262} cy={721} r={8} fill={C.ocre} />
        <circle cx={338} cy={721} r={8} fill={C.ocre} />
        <path d="M255 505 L345 505 L350 600 C320 620 280 620 250 600 Z" fill={SKIN_SHADE} />

        {/* Tête */}
        <g transform={`rotate(${headTilt} 300 540) translate(0 ${nod})`}>
          <ellipse cx={170 + fx * 0.4} cy={360} rx={24} ry={36} fill={SKIN_SHADE} />
          <ellipse cx={430 + fx * 0.4} cy={360} rx={24} ry={36} fill={SKIN_SHADE} />
          <path d="M175 330 C175 210 230 160 300 160 C370 160 425 210 425 330 C425 450 370 530 300 530 C230 530 175 450 175 330 Z" fill={SKIN} />
          <path
            d="M172 315 C160 205 225 135 300 135 C378 135 442 200 428 315 C420 268 400 240 380 228 C340 250 260 250 222 228 C198 245 180 272 172 315 Z"
            fill={HAIR}
          />

          <g transform={`translate(${fx} 0)`}>
            {/* Sourcils : levés (brows) ou inquiets (worry : l'intérieur remonte) */}
            <g transform={`translate(0 ${browUp})`}>
              <path d={`M215 285 C235 ${272 - worry * 4} 262 ${272 - worry * 14} 280 ${280 - worry * 18}`} stroke={HAIR} strokeWidth={11} strokeLinecap="round" fill="none" />
              <path d={`M320 ${280 - worry * 18} C338 ${272 - worry * 14} 365 ${272 - worry * 4} 385 285`} stroke={HAIR} strokeWidth={11} strokeLinecap="round" fill="none" />
            </g>

            <ellipse cx={248} cy={322} rx={20} ry={eyeRy} fill="#FFFFFF" />
            <ellipse cx={352} cy={322} rx={20} ry={eyeRy} fill="#FFFFFF" />
            {eyes > 0.3 && (
              <>
                <circle cx={249 + px} cy={324 + py} r={9} fill={HAIR} />
                <circle cx={353 + px} cy={324 + py} r={9} fill={HAIR} />
                <circle cx={252 + px} cy={320 + py} r={3} fill="#FFFFFF" />
                <circle cx={356 + px} cy={320 + py} r={3} fill="#FFFFFF" />
              </>
            )}

            <path d="M290 350 C285 380 278 395 290 402 C298 406 306 406 314 402" stroke={SKIN_SHADE} strokeWidth={7} strokeLinecap="round" fill="none" />

            {mouthOpen < 0.06 ? (
              <path d={`M262 ${452 - corner} C285 ${452 + 14 * smile} 318 ${452 + 14 * smile} 338 ${452 - corner}`} stroke={LIP} strokeWidth={9} strokeLinecap="round" fill="none" />
            ) : (
              <g>
                <ellipse cx={300} cy={452} rx={mw + 4 * Math.max(0, smile)} ry={mh} fill={MOUTH_IN} stroke={LIP} strokeWidth={6} />
                {mouthOpen > 0.35 && <rect x={300 - mw * 0.6} y={452 - mh + 3} width={mw * 1.2} height={Math.min(10, mh * 0.35)} rx={4} fill="#F5EEE6" />}
              </g>
            )}
          </g>
        </g>

        {/* Bras et mains (devant le corps) */}
        <Arm shoulder={SHOULDER_L} elbow={left.elbow} hand={left.hand} />
        <Hand shape={pose.handL} x={left.hand.x} y={left.hand.y} angle={angle(left.elbow, left.hand)} />
        <Arm shoulder={SHOULDER_R} elbow={right.elbow} hand={right.hand} />
        {pose.handR === "phone" && <PhoneInHand x={right.hand.x} y={right.hand.y} pose={pose} />}
        <Hand shape={pose.handR} x={right.hand.x} y={right.hand.y} angle={angle(right.elbow, right.hand)} />
      </g>
    </svg>
  );
}

/** Mains au repos, le long du corps. */
export const REST = { lx: 188, ly: 905, rx: 412, ry: 905 };

export const IDLE: CharacterPose = {
  lean: 0,
  bounce: 0,
  headTilt: 0,
  headYaw: 0,
  nod: 0,
  lookX: 0,
  lookY: 0,
  brows: 0,
  worry: 0,
  smile: 0.3,
  eyes: 1,
  mouthOpen: 0,
  mouthRound: 0,
  ...REST,
  handL: "fist",
  handR: "fist",
  phoneSize: 1,
  screen: "next-step",
  screenZoom: 1,
  screenScroll: 0,
  ring: 0,
  screenLang: "fr",
};
