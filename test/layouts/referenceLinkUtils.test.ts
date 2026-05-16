import { describe, expect, test } from "vitest";
import { normalizeP5ReferenceLinks } from "@layouts/referenceLinkUtils";

describe("normalizeP5ReferenceLinks", () => {
  test("normalizes slash notation references without duplicating p5", () => {
    expect(
      normalizeP5ReferenceLinks(
        '<a href="#/p5/rectMode">rectMode</a>',
      ),
    ).toBe('<a href="/reference/p5/rectMode/">rectMode</a>');
  });

  test("normalizes dot notation references to class routes", () => {
    expect(
      normalizeP5ReferenceLinks(
        '<a href="#/p5.Color">p5.Color</a>',
      ),
    ).toBe('<a href="/reference/p5/p5.Color/">p5.Color</a>');
  });

  test("normalizes existing class links in parameter descriptions", () => {
    const input =
      '<p><a href="#/p5/lightness">lightness()</a> receives a <a href="#/p5.Color">p5.Color</a>.</p>';
    const output =
      '<p><a href="/reference/p5/lightness/">lightness()</a> receives a <a href="/reference/p5/p5.Color/">p5.Color</a>.</p>';

    expect(normalizeP5ReferenceLinks(input)).toBe(output);
  });
});
