import { describe, expect, it } from "vitest";
import {
  addAttributionToCode,
  generateExampleAttribution,
} from "../../src/utils/exampleAttribution";

describe("generateExampleAttribution", () => {
  it("generates attribution for remix authors", () => {
    const result = generateExampleAttribution("Kaleidoscope", [
      {
        description: "Revised by",
        attribution: [
          {
            name: "Kasey Lichtyler",
            URL: "https://www.klich.co/",
          },
        ],
      },
    ]);

    expect(result).toContain("Kaleidoscope");
    expect(result).toContain(
      "Revised by: Kasey Lichtyler (https://www.klich.co/)"
    );
    expect(result).toContain("p5.js Contributors");
    expect(result).toContain("CC BY-NC-SA 4.0");
  });

  it("supports collective attribution years", () => {
    const result = generateExampleAttribution("Example", [
      {
        collectivelyAttributedSince: 2023,
      },
    ]);

    expect(result).toContain(
      "From 2023 onwards, edited and maintained by p5.js Contributors and Processing Foundation."
    );
  });

  it("adds attribution as comments above sketch code", () => {
    const code = `function setup() {
  createCanvas(400, 400);
}`;

    const result = addAttributionToCode(code, "Kaleidoscope", [
      {
        description: "Revised by",
        attribution: [
          {
            name: "Kasey Lichtyler",
          },
        ],
      },
    ]);

    expect(result).toContain("// Kaleidoscope");
    expect(result).toContain("// Revised by: Kasey Lichtyler");
    expect(result).toContain("// Licensed under CC BY-NC-SA 4.0.");
    expect(result).toContain("function setup()");
  });
});