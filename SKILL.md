---
name: create-voiced-ad
description: Crée une vidéo pub (TikTok, Reels, Statuts WhatsApp, YouTube) avec voix off IA, personnage animé qui joue la scène et utilise l'app, sous-titres, musique et bruitages, en Remotion + ElevenLabs. À utiliser quand l'utilisateur demande une vidéo pub, une vidéo de présentation avec voix, un personnage animé qui présente un produit, une « vidéo motion design » pour les réseaux, ou veut refaire / faire évoluer une vidéo existante faite avec ce skill.
---

<objective>
Produire en une passe une pub vidéo vivante (pas une présentation PowerPoint) : un personnage SVG articulé qui parle
(bouche synchronisée sur la voix), gesticule, tient le téléphone avec les vraies captures de l'app, tape dessus,
réagit ; caméra qui bouge ; visuels qui surgissent sur les mots ; sous-titres ; musique atténuée sous la voix ;
bruitages. Formats 9:16 (fin « lien dans ma bio ») et 16:9 (fin « lien dans la description »).
Puis faire évoluer le skill avec ce qui a été appris (voir <evolution>).
</objective>

<context>
Modèle de référence : le projet Mbeng (`~/workspace/personal/mbeng`, `src/video/`). Les fichiers de
`templates/` en sont une copie prête à adapter :

| Fichier | Rôle |
|---|---|
| `src/video/voiceover.ts` | Texte par scène (`text` lu par la synthèse, chiffres en toutes lettres ; `caption` affichée) + `VOICE_ID`. Deux fins : `fin-bio`, `fin-description`. |
| `scripts/generate-voiceover.mts` | ElevenLabs TTS **with-timestamps** → `public/video/voiceover/<id>.mp3` (normalisé −15 LUFS) + `src/video/voiceover-timings.json`. Ne régénère que les scènes changées (`--all` pour tout). |
| `scripts/generate-audio.mts` | Musique (ElevenLabs Music, instrumentale) + bruitages (Sound Effects) → `public/video/music/`, `public/video/sfx/`, normalisés. Fichiers absents seulement. |
| `src/video/lipsync.ts` | `planFor(ending)` (enchaînement des scènes), `mouthAt` (forme de bouche par caractère), `wordTime(scène, mot)`, `captions` (segments regroupés ≤ 8 mots). |
| `src/video/character.tsx` | Personnage SVG 600×900 : bras à cinématique inverse (on donne la main, le coude suit), mains `open/fist/point/thumb/phone`, téléphone en main avec capture (`screen`, zoom, scroll, cadre `ring`), visage (yaw, regard, sourcils, inquiétude, sourire). |
| `src/video/acting.ts` | Le jeu : « beats » calés sur des mots (`w("mot")`), cadrage (`stage` large/serré), coups de zoom (`punches`), bruitages (`cues`, `POPS`). |
| `src/video/voiced.tsx` | Composition : micro-mouvements automatiques (`alive`), caméra, décor animé, `Panel` par scène, sous-titres, musique avec ducking, audio. |
| `src/video/root.tsx` | Compositions `…Vertical` 1080×1920 et `…Horizontal` 1920×1080. |

Les détails : [references/workflow.md](references/workflow.md), vocabulaire de gestes :
[references/acting.md](references/acting.md), pièges déjà rencontrés : [references/pitfalls.md](references/pitfalls.md),
historique des demandes et corrections : [references/journal.md](references/journal.md).
</context>

<quick_start>
1. Lire `references/journal.md` (préférences déjà exprimées par l'utilisateur) et `references/pitfalls.md`.
2. Brief en une question groupée (AskUserQuestion) : voix (ElevenLabs recommandé), personnage, formats, musique.
3. Écrire le script (5 à 7 scènes, 40 à 55 s, une idée par scène, chiffres vérifiés) → **faire valider avant toute génération payante**.
4. Copier `templates/` dans le projet, adapter `theme.ts`, `voiceover.ts`, le personnage et les `Panel`.
5. `pnpm run video:voice`, `pnpm run video:audio`, planche d'images fixes, puis rendu des deux formats.
</quick_start>

<workflow>
1. **Prérequis** : Remotion déjà installé dans le projet (sinon `remotion`, `@remotion/cli`, `@remotion/google-fonts`, même version exacte), `ffmpeg` disponible, `tsx`.
   Clé `ELEVENLABS_API_KEY` ajoutée **par l'utilisateur** dans `.env.local` (jamais collée dans le chat), avec les permissions
   Text to Speech, Voices (lecture), Music, Sound Effects. Scripts npm : `video:voice`, `video:audio`, `video:render:vertical`, `video:render:horizontal`
   (`tsx --env-file=.env.local scripts/….mts`).
2. **Script** : accroche question → problème (chiffre fort) → solution (l'app en action) → preuve (chiffre sourcé) → bénéfice → confidentialité/gratuité → appel à l'action.
   Tutoiement si le produit tutoie. Chiffres uniquement depuis les données vérifiées du projet. Écrire `text` (chiffres en lettres, « mbeng point jiordiviera point me ») et `caption`.
   Même ponctuation dans `text` et `caption` (le test le vérifie).
3. **Voix** : lister la bibliothèque (`GET /v1/shared-voices?language=fr&search=africa…`), télécharger les `preview_url` (gratuit) et les envoyer à l'utilisateur ; il choisit. Puis `video:voice`.
4. **Captures** : vraies captures de l'app au format téléphone 375×812 (navigateur intégré, viewport mobile), profil de test injecté dans le stockage local puis **supprimé** après. Vérifier qu'aucun chiffre périmé n'y apparaît et que nombres/dates ne se coupent pas (espaces insécables).
5. **Personnage** : adapter peau, cheveux, vêtements (couleurs de la marque) dans `character.tsx` ; garder la géométrie (épaules, longueurs de bras) sauf besoin.
6. **Jeu** (`acting.ts`) : pour chaque scène, au moins 4 à 6 actions calées sur des mots (voir `references/acting.md`). Le personnage doit **faire** ce que dit la voix (sortir le téléphone, taper, montrer, réagir). Zoom de caméra sur 3 à 4 mots clés max.
7. **Visuels** (`Panel`) : un visuel par scène qui surgit sur les mots (effet pop avec dépassement), flotte légèrement, avec bruitage « pop ».
8. **Audio** : `video:audio` (musique instrumentale ~62 s, bruitages whoosh/pop/tap/ding/bell/swipe). Musique à ~0,13 sous la voix, ~0,30 dans les silences, fondus.
9. **Vérifier** puis rendre (voir <validation>), envoyer les MP4 (SendUserFile, `display: attach`).
10. **Faire évoluer le skill** (voir <evolution>).
</workflow>

<validation>
- `pnpm exec vitest run src/video` : sous-titres alignés, scènes sans chevauchement, mots déclencheurs trouvés.
- `pnpm typecheck` et `pnpm lint` passent.
- Planche d'images fixes avant tout rendu complet :
  `pnpm exec remotion still src/video/index.ts <Composition> out.png --frame=N --scale=0.3` sur 8 images, puis
  `ffmpeg -pattern_type glob -i 'v-*.png' -filter_complex tile=4x2 grid.png` et la regarder : gestes visibles,
  sous-titres qui ne recouvrent ni le titre ni le téléphone, rien de coupé au bord.
- Son : `ffmpeg -i out.mp4 -af volumedetect -f null -` → moyenne autour de −19 dB, crête autour de −3 dB.
- Durée attendue (`ffprobe`), deux formats rendus.
</validation>

<anti_patterns>
- Personnage qui ne fait que bouger la bouche et visuels en simple fondu : rejeté par l'utilisateur (« pas dynamique », « présentation PowerPoint »).
- Générer voix/musique avant validation du texte, ou tout régénérer pour une phrase changée (les scripts ne refont que le nécessaire).
- Chiffre non vérifié ou périmé dans la voix, les visuels ou les captures.
- Sous-titres mot à mot ou trop hachés ; sous-titres sur le téléphone en plan serré.
- « Lien en bio » en 16:9 YouTube (il n'y a pas de bio) : fin dédiée « dans la description ».
- Avatar réaliste IA : peu contrôlable, coûteux, l'écran de l'app devient faux.
</anti_patterns>

<success_criteria>
- Deux MP4 (9:16 et 16:9) avec voix, sous-titres, musique atténuée, bruitages, son normalisé.
- Le personnage agit à chaque scène (au moins un geste lié au sens de la phrase) et réagit (expressions).
- Tous les chiffres viennent de données vérifiées ; captures à jour.
- Tests, typecheck, lint OK ; fichiers commités (pas les MP4 de `out/`).
- `references/journal.md` mis à jour, et les templates si le code a progressé.
</success_criteria>

<evolution>
Ce skill s'améliore à chaque vidéo :
1. Ajouter une entrée datée dans `references/journal.md` : demande, retours de l'utilisateur, ce qui a été changé.
2. Un nouveau piège technique → `references/pitfalls.md`. Un nouveau geste ou une nouvelle forme de main → `references/acting.md` et `templates/`.
3. Si le code du projet a progressé (nouveau geste, nouveau visuel, meilleur réglage), recopier les fichiers concernés dans `templates/`
   en retirant ce qui est propre au projet (textes, couleurs) ou en le signalant en commentaire.
4. Garder ce SKILL.md court : les détails vont dans `references/`.
</evolution>
