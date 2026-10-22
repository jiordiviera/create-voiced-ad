import { AbsoluteFill } from "remotion";
import { C, FONT_BODY, FONT_HEADING } from "./theme";

// Phone screens of the fictional Quietdesk app, rendered as stills (750 × 1624, i.e. 375 × 812 at
// 2x) into public/screens/en/<screen>.jpg: pnpm screen -- --props='{"screen":"inbox"}'.
// The character's highlight frame (acting `ring`) sits at 51.5–63% of the image height, so the
// highlighted conversation is drawn there.

export type ScreenProps = { screen: "inbox" | "assign" };

const ROWS = [
  { name: "Priya Shah", subject: "Can I change my plan?", time: "9:41", tag: "Billing", who: null },
  { name: "Tom Becker", subject: "Export to CSV is greyed out", time: "9:32", tag: "Bug", who: "L" },
  { name: "Ines Moreau", subject: "Thanks, that fixed it!", time: "9:20", tag: "Solved", who: "A" },
  { name: "Sam Okafor", subject: "Refund request #2048", time: "9:12", tag: "Refund", who: null },
  { name: "Lena Fischer", subject: "Invite my teammate?", time: "8:58", tag: "Account", who: "M" },
  { name: "Diego Ruiz", subject: "Invoice for March", time: "8:40", tag: "Billing", who: "L" },
];

export function QuietdeskScreen({ screen }: ScreenProps) {
  const assign = screen === "assign";
  return (
    <AbsoluteFill style={{ backgroundColor: C.creme, fontFamily: FONT_BODY, padding: "80px 40px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 64, color: C.indigo }}>Inbox</div>
        <div style={{ padding: "12px 24px", borderRadius: 999, backgroundColor: C.foretPale, color: C.foretTexte, fontWeight: 700, fontSize: 28 }}>6 open</div>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
        {["All", "Mine", "Unassigned"].map((t, i) => (
          <div key={t} style={{ padding: "12px 26px", borderRadius: 999, backgroundColor: i === 0 ? C.indigo : C.papier, color: i === 0 ? C.papier : C.indigoDoux, fontWeight: 700, fontSize: 28 }}>
            {t}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 34 }}>
        {ROWS.map((r, i) => {
          const focus = i === 3;
          const who = focus && assign ? "M" : r.who;
          return (
            <div
              key={r.subject}
              style={{ display: "flex", gap: 20, alignItems: "center", padding: "22px 24px", borderRadius: 26, backgroundColor: C.papier, border: `3px solid ${focus ? C.ocre : C.ligne}`, height: 170, boxSizing: "border-box" }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: C.indigoPale, color: C.indigo, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 30, flexShrink: 0 }}>
                {r.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: C.indigoDoux, fontWeight: 600 }}>
                  <span>{r.name}</span>
                  <span>{r.time}</span>
                </div>
                <div style={{ fontSize: 31, color: C.indigo, fontWeight: 700, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.subject}</div>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: 999, backgroundColor: who ? (who === "M" ? C.ocre : C.foret) : C.ligne, color: C.papier, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, flexShrink: 0 }}>
                {who ?? "+"}
              </div>
            </div>
          );
        })}
      </div>
      {assign && (
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 70, padding: "26px 30px", borderRadius: 26, backgroundColor: C.indigo, color: C.papier, fontWeight: 700, fontSize: 30, textAlign: "center" }}>
          Refund request #2048 assigned to Maya
        </div>
      )}
    </AbsoluteFill>
  );
}
