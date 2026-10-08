# create-voiced-ad

Skill Claude Code pour créer en une passe une **vidéo pub avec voix off et personnage animé** (TikTok, Reels,
Statuts WhatsApp, YouTube), avec [Remotion](https://www.remotion.dev) et [ElevenLabs](https://elevenlabs.io).

Le personnage n'est pas un simple avatar qui bouge la bouche : il joue la scène. Il salue, montre ce qui
apparaît à l'écran, sort son téléphone avec les vraies captures de ton app, tape dessus, se prend la tête,
lève le pouce. La caméra bouge, les mots clés surgissent au rythme de la voix, la musique baisse quand il parle.

- Voix off ElevenLabs avec minutage par caractère → bouche synchronisée et sous-titres calés
- Personnage SVG à bras articulés (cinématique inverse), téléphone en main, expressions
- Micro-mouvements automatiques : respiration, clignements, regards, mains qui parlent
- Musique et bruitages générés (ElevenLabs Music et Sound Effects), son normalisé pour les réseaux
- Formats 9:16 (« lien dans ma bio ») et 16:9 (« lien dans la description »)

## Installation

```bash
git clone https://github.com/jiordiviera/create-voiced-ad ~/.claude/skills/create-voiced-ad
```

Puis, dans Claude Code : « fais une vidéo pub avec voix off et personnage animé pour mon app », ou `/create-voiced-ad`.

## Prérequis

- Un projet avec Remotion (le skill l'ajoute sinon), `ffmpeg`, `tsx`
- Une clé ElevenLabs dans `.env.local` (`ELEVENLABS_API_KEY`), avec les permissions Text to Speech,
  Voices (lecture), Music et Sound Effects. Vérifie que ton forfait autorise l'usage commercial avant de diffuser.

## Contenu

| Chemin | Rôle |
|---|---|
| `SKILL.md` | Instructions pour Claude : déroulé, validation, pièges, critères de réussite |
| `references/` | Vocabulaire de gestes, pièges techniques, déroulé détaillé, journal des retours |
| `templates/` | Code de départ (Remotion + scripts de génération audio), tiré du projet [Mbeng](https://mbeng.jiordiviera.me) |

Le skill s'améliore à chaque vidéo : les retours et nouveaux gestes sont ajoutés au journal et aux modèles.

## Licence

MIT
