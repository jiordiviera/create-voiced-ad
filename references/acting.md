# Acting vocabulary (acting.ts)

Drawing coordinates: 600 × 900, shoulders at (205, 625) and (395, 625), arms 150 + 148. You give the position of the hand
(`lx, ly` on the screen's left, `rx, ry` on the right) and its shape; the elbow places itself (inverse kinematics, elbow outward).
Hands at rest: `REST` = (188, 905) and (412, 905), shape `fist`.

A beat: `{ at: w("word", offset), pose: {...}, d: duration, e: "smooth" | "back" | "snap" }`.
`back` = overshoot (happy gestures, appearances), `snap` = sharp (surprise, tapping).

## Gestures that work

| Intention | Pose |
|---|---|
| Hello on arrival / goodbye | `rx: 520, ry: 330, handR: "open", waveR: 1, smile: 0.9` (e: back) |
| Question | `headTilt: 7, brows: 1` |
| "Look at this" toward the visual | vertical: left hand `lx: 110, ly: 330, handL: "point"`, gaze `lookX: -0.7, lookY: -0.9`; horizontal: right hand `rx: 600, ry: 440` |
| Overwhelmed, too many things | both hands on the head `lx: 232, ly: 330, rx: 368, ry: 330, open`, `worry: 1, smile: -0.7` (e: snap) |
| Important point, raised index finger | `rx: 455, ry: 425, handR: "point", brows: 0.6` |
| Take out the phone | `rx: 480, ry: 690, handR: "phone", phoneSize: 1` (e: back) + close framing `stage(layout, true)` + gaze toward the screen `headYaw: 0.3, lookX: 0.8, lookY: 0.35` |
| Tap on the screen | `taps(at, x, y, n, cues)` (left index finger, a click on each tap); screen around (450, 470) |
| Highlight an area of the screen | `screenZoom: 1.14`, `screenScroll: 0.22`, `ring: 1` |
| Change screens | `screen: "step"` + `swipe` sound effect |
| Put the phone away | `phoneSize: 0` (e: snap) 0.3 s before, then hand at rest |
| "Time is running out" | right arm across `rx: 330, ry: 650, fist` + tapping the wrist `taps(at, 340, 615, 2)`, gaze toward the wrist |
| "No" | open hand `waveR: 1` (or `waveL`) in front |
| Hold close (trust) | `rx: 330, ry: 770, handR: "phone", phoneSize: 0.75, screen: "lock", headTilt: 6, smile: 1` |
| Thumbs-up | `rx: 470, ry: 420, handR: "thumb", smile: 1` + `pulse` + `punches` + `ding` |
| Stress a word | `pulse(at, -12)` (bounce), `nodAt(at)` (nod) |

## Automatic (voiced.tsx, `alive`)

Breathing, sway, irregular blinking, small glances, head following the voice, hands moving
when they are `open`/`point` while speaking. Do not recode these in the beats.

## Staging rules

- Each scene: at least one action that illustrates the sentence, an expression, and a return to calm at the end (`audio + 0.05`).
- The character looks at what it shows, then comes back to the camera for the next sentence.
- 3 to 4 camera zooms maximum over the whole video (key numbers, "free").
- Close shots (phone in hand): captions above the head (`captionY` ~0.345 in vertical).
