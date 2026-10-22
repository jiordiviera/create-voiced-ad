import { describe, expect, it } from "vitest";
import { captions, planFor, segments, wordTime } from "./lipsync";
import { VOICEOVER } from "./voiceover";

// From the Community template test, adapted to the Quietdesk demo (one 16:9 ending).

describe("demo ad voiceover", () => {
  it("has as many captions as spoken segments, in order", () => {
    for (const scene of VOICEOVER) {
      const shown = segments("caption" in scene ? (scene as { caption: string }).caption : scene.text);
      expect(shown.length, scene.id).toBe(segments(scene.text).length);
      const caps = captions(scene.id);
      for (let i = 1; i < caps.length; i++) expect(caps[i]!.from).toBeGreaterThanOrEqual(caps[i - 1]!.from);
    }
  });

  it("chains scenes without overlap, with one ending", () => {
    const plan = planFor("fin-description");
    expect(plan.filter((s) => s.id.startsWith("fin-")).map((s) => s.id)).toEqual(["fin-description"]);
    for (let i = 1; i < plan.length; i++) expect(plan[i]!.start).toBeCloseTo(plan[i - 1]!.start + plan[i - 1]!.length);
  });

  it("finds the words that trigger animations", () => {
    expect(wordTime("problem", "fifty")).toBeGreaterThan(wordTime("problem", "three"));
    expect(wordTime("assign", "everyone")).toBeGreaterThan(wordTime("assign", "tap"));
  });
});
