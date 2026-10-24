/** Covers the P5_DATA_JSON_PATH handoff in src/scripts/parsers/reference.ts. */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

vi.mock("../../src/scripts/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../src/scripts/utils")>();
  return {
    ...actual,
    cloneLibraryRepo: vi.fn(),
  };
});

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    execSync: vi.fn(),
  };
});

import { execSync } from "node:child_process";
import { prepareP5Data } from "../../src/scripts/parsers/reference";
import { cloneLibraryRepo } from "../../src/scripts/utils";

const dataP5OutputPath = path.join(
  __dirname,
  "../../src/scripts/parsers/out/data-p5/data.json",
);

let tempDir: string;
const originalEnv = process.env.P5_DATA_JSON_PATH;

describe("prepareP5Data with P5_DATA_JSON_PATH", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "p5-data-json-"));
  });

  afterEach(async () => {
    process.env.P5_DATA_JSON_PATH = originalEnv;
    if (originalEnv === undefined) delete process.env.P5_DATA_JSON_PATH;
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(path.dirname(dataP5OutputPath), {
      recursive: true,
      force: true,
    });
  });

  test("uses the given file without cloning p5.js", async () => {
    const fixture = path.join(tempDir, "data.json");
    const fixtureContent = JSON.stringify({ classes: { p5: { name: "p5" } } });
    await fs.writeFile(fixture, fixtureContent);
    process.env.P5_DATA_JSON_PATH = fixture;

    await prepareP5Data("v2.3.3");

    expect(cloneLibraryRepo).not.toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
    // getYuidocOutput('data-p5') must find the handed-over file here
    expect(await fs.readFile(dataP5OutputPath, "utf8")).toBe(fixtureContent);
  });

  test("fails instead of falling back to a clone when the path is wrong", async () => {
    process.env.P5_DATA_JSON_PATH = path.join(tempDir, "does-not-exist.json");

    await expect(prepareP5Data("v2.3.3")).rejects.toThrow(
      /P5_DATA_JSON_PATH.*no file exists/,
    );
    expect(cloneLibraryRepo).not.toHaveBeenCalled();
  });

  test("rejects a directory path", async () => {
    process.env.P5_DATA_JSON_PATH = tempDir;

    await expect(prepareP5Data("v2.3.3")).rejects.toThrow(/not a file/);
    expect(cloneLibraryRepo).not.toHaveBeenCalled();
  });
});
