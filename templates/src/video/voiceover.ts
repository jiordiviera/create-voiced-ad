// Texte de la voix off (validé, voir docs/video-voix-off.md). Une entrée par scène.
// Les chiffres sont écrits en toutes lettres pour la synthèse vocale ; `caption` est le sous-titre affiché.
// Après modification : pnpm run video:voice (régénère l'audio et le minutage, consomme des crédits ElevenLabs).

export const VOICE_ID = "IoJlyfNV7PnlZKiAVm4M"; // Guillou Martial (bibliothèque ElevenLabs)

export const VOICEOVER = [
  {
    id: "probleme",
    text: "Tu pars étudier en France ? Campus France, visa, logement, banque, APL… Il y a plus de quarante démarches, et chaque date compte.",
  },
  {
    id: "prochaine-etape",
    text: "Mbeng te dit quoi faire, maintenant. Tu réponds à quelques questions, et l'appli calcule ta prochaine étape, avec sa date limite.",
  },
  {
    id: "verifie",
    text: "Chaque chiffre vient d'une source officielle, et il est daté. Les frais Campus France au Cameroun, par exemple : quatre-vingt-cinq mille francs CFA, plus seize mille de frais TLS.",
    caption:
      "Chaque chiffre vient d'une source officielle, et il est daté. Les frais Campus France au Cameroun, par exemple : 85 000 FCFA, plus 16 000 de frais TLS.",
  },
  {
    id: "visa",
    text: "Une fois en France, tu as trois mois pour valider ton visa. Mbeng te le rappelle, avant qu'il soit trop tard.",
    caption: "Une fois en France, tu as 3 mois pour valider ton visa. Mbeng te le rappelle, avant qu'il soit trop tard.",
  },
  {
    id: "confidentialite",
    text: "Pas de compte, pas de pub : tes infos restent sur ton téléphone.",
  },
  // Deux fins : « lien en bio » pour TikTok, Reels et Statuts (9:16), « description » pour YouTube (16:9).
  {
    id: "fin-bio",
    text: "Mbeng, c'est gratuit. Le lien est dans ma bio : mbeng point jiordiviera point me.",
    caption: "Mbeng, c'est gratuit. Le lien est dans ma bio : mbeng.jiordiviera.me",
  },
  {
    id: "fin-description",
    text: "Mbeng, c'est gratuit. Le lien est dans la description : mbeng point jiordiviera point me.",
    caption: "Mbeng, c'est gratuit. Le lien est dans la description : mbeng.jiordiviera.me",
  },
] as const satisfies readonly { id: string; text: string; caption?: string }[];

export type VoiceoverId = (typeof VOICEOVER)[number]["id"];
