import { afterEach, describe, expect, it } from "vitest";
import { getCurationSketches } from "../../src/scripts/openprocessing";

const originalToken = process.env.OPENPROCESSING_TOKEN;
const originalCurationId = process.env.OPENPROCESSING_CURATION_ID;

afterEach(() => {
  if (originalToken === undefined) {
    delete process.env.OPENPROCESSING_TOKEN;
  } else {
    process.env.OPENPROCESSING_TOKEN = originalToken;
  }

  if (originalCurationId === undefined) {
    delete process.env.OPENPROCESSING_CURATION_ID;
  } else {
    process.env.OPENPROCESSING_CURATION_ID = originalCurationId;
  }
});

describe("OpenProcessing configuration", () => {
  it("requires an API token", async () => {
    delete process.env.OPENPROCESSING_TOKEN;
    process.env.OPENPROCESSING_CURATION_ID = "91157";

    await expect(getCurationSketches()).rejects.toThrow(
      "Missing OPENPROCESSING_TOKEN environment variable."
    );
  });

  it("requires a curation ID", async () => {
    process.env.OPENPROCESSING_TOKEN = "test-token";
    delete process.env.OPENPROCESSING_CURATION_ID;

    await expect(getCurationSketches()).rejects.toThrow(
      "Missing OPENPROCESSING_CURATION_ID environment variable."
    );
  });
});