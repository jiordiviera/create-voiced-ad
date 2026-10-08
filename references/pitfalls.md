# Pièges rencontrés

- **Props Remotion** : `component` attend des props indexables → `type Props = {...}`, pas `interface` (sinon TS2322).
- **Scripts avec `await` au niveau racine** : extension `.mts` (tsx sort du CJS pour `.ts`). Import du projet sans extension
  (`../src/video/voiceover`), sinon TS5097 au typecheck.
- **`tsx --env-file=.env.local`** pour lire la clé sans l'afficher. Ne jamais faire `echo $ELEVENLABS_API_KEY`.
- **Voix ElevenLabs très basse** (crête −24 dB) : normaliser avec `loudnorm=I=-15:TP=-1.5:LRA=11` (déjà dans le script).
  Musique −16 LUFS, bruitages −18 LUFS, puis volumes dans la composition.
- **Voix de la bibliothèque** : utilisable directement par `voice_id` en TTS ; les extraits `preview_url` sont gratuits.
- **Minutage** : endpoint `/v1/text-to-speech/{id}/with-timestamps` → `alignment.characters` + temps de début/fin.
  `wordTime` cherche la première occurrence en minuscules : choisir des mots uniques dans la scène (ou un groupe de mots).
- **Sous-titres** : `text` et `caption` doivent avoir les mêmes coupures (ponctuation suivie d'une espace) ; les points d'une URL ne coupent pas.
- **`Date.now()`** interdit au rendu React (lint « impure ») et au prérendu Next (Cache Components) : passer par une fonction utilitaire hors composant.
- **Captures** : `NEXT_LOCALE` (cookie) peut rediriger vers `/en` ; poser le cookie avant. Dexie stocke `version(1)` en version IndexedDB 10.
  Supprimer la base de test après (`indexedDB.deleteDatabase`).
- **Typographie française** : espaces insécables entre chiffres (« 85 000 »), avant les unités et dans les dates, sinon coupures moches dans les captures.
- **Html5Audio** (pas `Audio`, pas `@remotion/media` si non installé) ; `volume` accepte une fonction de la frame (ducking).
- **Rendu** : ~3 à 5 min par format pour 1 min ; lancer en arrière-plan et vérifier une planche d'images avant.
- **SVG** : `transform-origin` en px fonctionne en coordonnées du viewBox ; `overflow: visible` sur le `<svg>` pour les bras levés.
