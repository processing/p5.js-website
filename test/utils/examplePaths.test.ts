import { describe, expect, it } from "vitest";
import { posix, win32 } from "node:path";

import {
  getExampleCodePath,
  getExampleId,
} from "../../src/utils/examplePaths";

describe("getExampleCodePath", () => {
  it("creates a code path for POSIX paths", () => {
    const descriptionPath =
      "src/content/examples/en/07_Repetition/03_Kaleidoscope/description.mdx";

    expect(
      getExampleCodePath(descriptionPath, posix)
    ).toBe(
      "src/content/examples/en/07_Repetition/03_Kaleidoscope/code.js"
    );
  });

  it("creates a code path for Windows paths", () => {
    const descriptionPath =
      "src\\content\\examples\\en\\07_Repetition\\03_Kaleidoscope\\description.mdx";

    expect(
      getExampleCodePath(descriptionPath, win32)
    ).toBe(
      "src\\content\\examples\\en\\07_Repetition\\03_Kaleidoscope\\code.js"
    );
  });
});

describe("getExampleId", () => {
  it("creates an ID for POSIX paths", () => {
    expect(
      getExampleId(
        "src/content/examples/en/07_Repetition/03_Kaleidoscope/description.mdx",
        "src/content/examples/en",
        posix
      )
    ).toBe("07_Repetition/03_Kaleidoscope");
  });

  it("creates the same ID for Windows paths", () => {
    expect(
      getExampleId(
        "src\\content\\examples\\en\\07_Repetition\\03_Kaleidoscope\\description.mdx",
        "src/content/examples/en",
        win32
      )
    ).toBe("07_Repetition/03_Kaleidoscope");
  });
});
