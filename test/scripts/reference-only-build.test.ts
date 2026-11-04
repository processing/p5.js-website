/** Covers the stash-dir safety check in src/scripts/referenceOnlyBuild.ts. */
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { assertStashDirUsable } from "../../src/scripts/referenceOnlyBuild";

let tempDir: string;

describe("assertStashDirUsable", () => {
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ref-only-stash-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test("refuses a non-empty stash dir and says how to recover", async () => {
    // The leftovers of a run that was killed before restoring src/pages;
    // starting a new run over them would mix two stashes.
    await fs.writeFile(path.join(tempDir, "about.astro"), "");

    expect(() => assertStashDirUsable(tempDir)).toThrow(/Refusing to run/);
    expect(() => assertStashDirUsable(tempDir)).toThrow(/mv .*src\/pages/);
  });

  test("accepts a missing or empty stash dir", async () => {
    expect(() =>
      assertStashDirUsable(path.join(tempDir, "does-not-exist")),
    ).not.toThrow();
    expect(() => assertStashDirUsable(tempDir)).not.toThrow();
  });
});
