import { describe, expect, it } from "vitest";
import { posix, win32 } from "node:path";

import { getExampleCodePath } from "../../src/utils/examplePaths";

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