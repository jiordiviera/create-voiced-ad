import { describe, expect, it } from "vitest";
import { captions, planFor, segments, wordTime } from "./lipsync";
import { VOICEOVER } from "./voiceover";

describe("voix off de la vidéo", () => {
  it("a autant de sous-titres que de segments prononcés, dans l'ordre", () => {
    for (const scene of VOICEOVER) {
      const shown = segments("caption" in scene ? scene.caption : scene.text);
      expect(shown.length, scene.id).toBe(segments(scene.text).length);
      const caps = captions(scene.id);
      for (let i = 1; i < caps.length; i++) expect(caps[i].from).toBeGreaterThanOrEqual(caps[i - 1].from);
    }
  });

  it("enchaîne les scènes sans chevauchement, avec une seule fin", () => {
    for (const ending of ["fin-bio", "fin-description"] as const) {
      const plan = planFor(ending);
      expect(plan.filter((s) => s.id.startsWith("fin-")).map((s) => s.id)).toEqual([ending]);
      for (let i = 1; i < plan.length; i++) expect(plan[i].start).toBeCloseTo(plan[i - 1].start + plan[i - 1].length);
    }
  });

  it("retrouve les mots qui déclenchent les animations", () => {
    expect(wordTime("verifie", "quatre-vingt-cinq")).toBeGreaterThan(0);
    expect(wordTime("confidentialite", "téléphone")).toBeGreaterThan(wordTime("confidentialite", "compte"));
  });
});
