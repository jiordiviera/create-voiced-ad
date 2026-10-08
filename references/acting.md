# Vocabulaire de jeu (acting.ts)

Repère du dessin : 600 × 900, épaules à (205, 625) et (395, 625), bras 150 + 148. On donne la position de la main
(`lx, ly` gauche à l'écran, `rx, ry` droite) et sa forme ; le coude se place tout seul (cinématique inverse, coude vers l'extérieur).
Mains au repos : `REST` = (188, 905) et (412, 905), forme `fist`.

Un beat : `{ at: w("mot", décalage), pose: {...}, d: durée, e: "smooth" | "back" | "snap" }`.
`back` = dépassement (gestes joyeux, apparitions), `snap` = vif (surprise, tapotement).

## Gestes qui marchent

| Intention | Pose |
|---|---|
| Salut d'arrivée / au revoir | `rx: 520, ry: 330, handR: "open", waveR: 1, smile: 0.9` (e: back) |
| Question | `headTilt: 7, brows: 1` |
| « Regarde ça » vers le visuel | vertical : main gauche `lx: 110, ly: 330, handL: "point"`, regard `lookX: -0.7, lookY: -0.9` ; horizontal : main droite `rx: 600, ry: 440` |
| Débordé, trop de choses | deux mains sur la tête `lx: 232, ly: 330, rx: 368, ry: 330, open`, `worry: 1, smile: -0.7` (e: snap) |
| Point important, index levé | `rx: 455, ry: 425, handR: "point", brows: 0.6` |
| Sortir le téléphone | `rx: 480, ry: 690, handR: "phone", phoneSize: 1` (e: back) + cadrage serré `stage(layout, true)` + regard vers l'écran `headYaw: 0.3, lookX: 0.8, lookY: 0.35` |
| Taper sur l'écran | `taps(at, x, y, n, cues)` (index gauche, clic à chaque appui) ; écran vers (450, 470) |
| Mettre en valeur une zone de l'écran | `screenZoom: 1.14`, `screenScroll: 0.22`, `ring: 1` |
| Changer d'écran | `screen: "step"` + bruitage `swipe` |
| Ranger le téléphone | `phoneSize: 0` (e: snap) 0,3 s avant, puis main au repos |
| « Le temps presse » | bras droit en travers `rx: 330, ry: 650, fist` + tapotement du poignet `taps(at, 340, 615, 2)`, regard vers le poignet |
| « Non » | main ouverte `waveR: 1` (ou `waveL`) devant soi |
| Serrer contre soi (confiance) | `rx: 330, ry: 770, handR: "phone", phoneSize: 0.75, screen: "lock", headTilt: 6, smile: 1` |
| Pouce levé | `rx: 470, ry: 420, handR: "thumb", smile: 1` + `pulse` + `punches` + `ding` |
| Accent sur un mot | `pulse(at, -12)` (rebond), `nodAt(at)` (hochement) |

## Automatique (voiced.tsx, `alive`)

Respiration, balancement, clignements irréguliers, petits regards, tête qui accompagne la voix, mains qui bougent
quand elles sont `open`/`point` pendant la parole. Ne pas les recoder dans les beats.

## Règles de mise en scène

- Chaque scène : au moins une action qui illustre la phrase, une expression, et un retour au calme à la fin (`audio + 0.05`).
- Le personnage regarde ce qu'il montre, puis revient vers la caméra pour la phrase suivante.
- 3 à 4 zooms de caméra maximum sur toute la vidéo (chiffres clés, « gratuit »).
- Plans serrés (téléphone en main) : sous-titres au-dessus de la tête (`captionY` ~0,345 en vertical).
