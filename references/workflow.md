# Déroulé détaillé

## 1. Brief (une seule série de questions)

- Voix : ElevenLabs (recommandé), voix de l'utilisateur enregistrée, ou Runway.
- Personnage : persona du public cible (ex. étudiant camerounais), mascotte, ou avatar réaliste (déconseillé).
- Formats : 9:16 (TikTok, Reels, Statuts) et/ou 16:9 (YouTube), 1:1 si demandé (ajouter un cadrage dans `stage`).
- Musique : ElevenLabs Music, fichier fourni, ou aucune.

## 2. Script

Modèle validé (Mbeng) : [exemple-script-mbeng.md](exemple-script-mbeng.md). 6 scènes, ~55 s avec silences.
Le personnage est un guide, pas un faux témoignage.

## 3. ElevenLabs

```bash
# voix de la bibliothèque (filtre langue + recherche), extraits gratuits
curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/shared-voices?language=fr&page_size=100&search=africa"
```

Lire la clé via `set -a && . ./.env.local && set +a` dans la même commande, sans l'afficher.
Envoyer à l'utilisateur 6 à 8 extraits (jeunes voix d'abord pour un public étudiant).

- TTS : `eleven_multilingual_v2`, `language_code: "fr"`, `stability 0.45, similarity_boost 0.8, style 0.35`.
- Musique : `POST /v1/music` `{ prompt, music_length_ms, force_instrumental: true }` (3 s à 10 min).
- Bruitages : `POST /v1/sound-generation` `{ text, duration_seconds (0,5–30), prompt_influence: 0.6 }`.

## 4. Adapter les templates

- `theme.ts` : couleurs et polices de la marque.
- `character.tsx` : constantes `SKIN`, `HAIR`, `SLEEVE`, couleurs du sweat ; écrans `Screen` → noms des captures dans `public/screens/<lang>/`.
- `voiceover.ts` : scènes, `VOICE_ID`.
- `acting.ts` : `sceneBeats` par scène (mots de la nouvelle voix), `POPS`.
- `voiced.tsx` : `Panel` par scène (visuels, chiffres), textes de fin (URL).
- `root.tsx` : identifiants de compositions ; scripts npm de rendu vers `out/…`.

## 5. Rendu

```bash
pnpm run video:render:vertical && pnpm run video:render:horizontal   # en arrière-plan
```

Envoyer les MP4 (SendUserFile, `display: attach`). Ne pas commiter `out/`.
