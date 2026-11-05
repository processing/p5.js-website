import { describe, expect, test } from "vitest";
import { testingExports } from "../../src/scripts/builders/arena-resources";

const { parseStructuredDescription, normalizeBlock, areNaBlockSchema } =
  testingExports;

describe("parseStructuredDescription", () => {
  test("parses a fully-formed by-line/description/tags block", () => {
    const description = [
      "By: Casey Reas",
      "A gentle introduction to generative art",
      "#p5jsv2 #English",
    ].join("\n");

    expect(parseStructuredDescription(description)).toEqual({
      author: "Casey Reas",
      description: "A gentle introduction to generative art",
      tags: ["p5jsv2", "english"],
    });
  });

  test("is case-insensitive on the by-line prefix and tags", () => {
    const description = ["BY: Casey Reas", "#P5JSV1"].join("\n");

    expect(parseStructuredDescription(description)).toEqual({
      author: "Casey Reas",
      description: undefined,
      tags: ["p5jsv1"],
    });
  });

  test("accepts any of the proposed version tag spellings", () => {
    for (const tag of ["p5js", "p5jsv1", "p5jsv2", "p5v1", "p5v2"]) {
      const description = `By: Someone\n#${tag}`;
      expect(parseStructuredDescription(description)?.tags).toContain(tag);
    }
  });

  test("returns null when there is no by-line", () => {
    const description = ["A gentle introduction to generative art", "#p5jsv2"].join(
      "\n",
    );

    expect(parseStructuredDescription(description)).toBeNull();
  });

  test("returns null when there is no required version tag", () => {
    const description = ["By: Casey Reas", "#English #Spanish"].join("\n");

    expect(parseStructuredDescription(description)).toBeNull();
  });

  test("returns null for an empty or missing description", () => {
    expect(parseStructuredDescription(null)).toBeNull();
    expect(parseStructuredDescription("")).toBeNull();
  });
});

describe("areNaBlockSchema", () => {
  const validBlock = {
    id: 1,
    title: "raw page title",
    generated_title: "A generative art primer",
    description: "By: Casey Reas\n#p5jsv2",
    state: "available",
    source: { url: "https://example.com/primer", title: "Primer" },
    image: { display: { url: "https://images.are.na/some-image.jpg" } },
  };

  test("accepts a well-formed block, including null source/image/description", () => {
    expect(areNaBlockSchema.safeParse(validBlock).success).toBe(true);
    expect(
      areNaBlockSchema.safeParse({
        ...validBlock,
        description: null,
        source: null,
        image: null,
      }).success,
    ).toBe(true);
  });

  test("rejects a block missing a required field", () => {
    const blockWithoutId: Record<string, unknown> = { ...validBlock };
    delete blockWithoutId.id;
    expect(areNaBlockSchema.safeParse(blockWithoutId).success).toBe(false);
  });

  test("rejects a block with a field of the wrong type", () => {
    expect(
      areNaBlockSchema.safeParse({ ...validBlock, id: "not-a-number" })
        .success,
    ).toBe(false);
  });
});

const availableBlock = {
  id: 1,
  title: "raw page title",
  generated_title: "A generative art primer",
  description: ["By: Casey Reas", "A gentle intro", "#p5jsv2"].join("\n"),
  state: "available",
  source: { url: "https://example.com/primer", title: "Primer" },
  image: {
    display: { url: "https://images.are.na/some-processed-image.jpg" },
  },
};

describe("normalizeBlock", () => {
  test("normalizes a well-formed block", () => {
    expect(normalizeBlock(availableBlock)).toEqual({
      areNaId: 1,
      title: "A generative art primer",
      description: "A gentle intro",
      sourceUrl: "https://example.com/primer",
      sourceTitle: "Primer",
      imageUrl: "https://images.are.na/some-processed-image.jpg",
      author: "Casey Reas",
      tags: ["p5jsv2"],
    });
  });

  test("returns null when the description doesn't match the required format", () => {
    expect(
      normalizeBlock({ ...availableBlock, description: "no by-line here" }),
    ).toBeNull();
  });

  test("returns null when there is neither a source link nor a supported image", () => {
    expect(
      normalizeBlock({ ...availableBlock, source: null, image: null }),
    ).toBeNull();
  });

  test("drops images not served from images.are.na, but keeps the block if it has a source link", () => {
    const result = normalizeBlock({
      ...availableBlock,
      image: {
        display: { url: "https://d2w9rnfcy7mm78.cloudfront.net/some.gif" },
      },
    });

    expect(result?.imageUrl).toBeUndefined();
    expect(result?.sourceUrl).toBe("https://example.com/primer");
  });
});
