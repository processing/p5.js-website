import path from "node:path";
import yaml from "js-yaml";
import { z } from "astro/zod";
import { cleanUpDirectory, repoRootPath, writeFile } from "../utils";

/* Are.na channel that hosts community-submitted education resources */
const channelSlug = "education-resources-p5-js-processing-java";
/* How many blocks to request per page (Are.na's max is 100) */
const perPage = 100;

const outputDirectory = path.join(
  repoRootPath,
  "src",
  "content",
  "arena-resources",
  "en",
);

/*
 * Which hashtags count as "this is a p5.js resource" for the required
 * version tag (see parseStructuredDescription below). Proposed on #1547
 * with both #p5jsv1/#p5jsv2 (format example) and #p5v1/#p5v2/#p5js
 * (skip-rule text) - accepting all spellings until that's clarified.
 */
const versionTags = ["p5js", "p5jsv1", "p5jsv2", "p5v1", "p5v2"];

/*
 * Runtime shape of a single Are.na block, validated against the real API
 * response rather than just asserted with `as`. If Are.na changes a field
 * (or a block just doesn't look like we expect), that block is skipped with
 * a warning instead of silently producing `undefined`s or crashing deep in
 * parseStructuredDescription.
 */
const areNaBlockSchema = z.object({
  id: z.number(),
  title: z.string(),
  generated_title: z.string(),
  description: z.string().nullable(),
  state: z.string(),
  source: z
    .object({
      url: z.string(),
      title: z.string().nullable(),
    })
    .nullable(),
  image: z
    .object({
      display: z.object({
        url: z.string(),
      }),
    })
    .nullable(),
});

type AreNaBlock = z.infer<typeof areNaBlockSchema>;

/* Only validates the pagination wrapper - each block is validated
 * individually below, since one malformed block shouldn't sink the page */
const areNaChannelResponseSchema = z.object({
  length: z.number(),
  contents: z.array(z.unknown()),
});

const fetchAllBlocks = async (): Promise<AreNaBlock[]> => {
  const blocks: AreNaBlock[] = [];
  let page = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const url = `https://api.are.na/v2/channels/${channelSlug}?page=${page}&per=${perPage}`;
    console.log(`Fetching ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Are.na API request failed with status ${response.status}: ${response.statusText}`,
      );
    }

    const data = areNaChannelResponseSchema.parse(await response.json());

    for (const rawBlock of data.contents) {
      const result = areNaBlockSchema.safeParse(rawBlock);
      if (!result.success) {
        const id =
          typeof rawBlock === "object" && rawBlock && "id" in rawBlock
            ? (rawBlock as { id: unknown }).id
            : "unknown";
        console.warn(
          `Skipping block ${id}: didn't match the expected Are.na API shape (${result.error.message})`,
        );
        continue;
      }
      blocks.push(result.data);
    }

    hasMorePages = data.contents.length === perPage;
    page += 1;
  }

  return blocks;
};

interface ParsedDescription {
  author: string;
  description?: string;
  tags: string[];
}

/**
 * Curators opt a block into the Education Resources page by writing its
 * Are.na description in a specific format (proposed on #1547):
 *
 *   By: Author Name
 *   Short description for the website
 *   #p5jsv1 #p5jsv2 #English #Spanish #ProcessingJava
 *
 * A block missing a by-line or a version tag is left out entirely - that's
 * the review boundary, rather than a separate moderation step.
 *
 * @param description Raw `description` field from an Are.na block
 * @returns The parsed author/description/tags, or null if the block doesn't
 *          match the required format and should be skipped
 */
export const parseStructuredDescription = (
  description: string | null,
): ParsedDescription | null => {
  if (!description) return null;

  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const byLineIndex = lines.findIndex((line) => /^by:/i.test(line));
  if (byLineIndex === -1) return null;
  const author = lines[byLineIndex].replace(/^by:\s*/i, "").trim();
  if (!author) return null;

  const tagLineIndex = lines.findIndex((line) => /#\S+/.test(line));
  const tags =
    tagLineIndex === -1
      ? []
      : Array.from(lines[tagLineIndex].matchAll(/#(\S+)/g)).map((match) =>
          match[1].toLowerCase(),
        );

  const hasRequiredVersionTag = tags.some((tag) => versionTags.includes(tag));
  if (!hasRequiredVersionTag) return null;

  const descriptionLine = lines.find(
    (_, index) => index !== byLineIndex && index !== tagLineIndex,
  );

  return { author, description: descriptionLine, tags };
};

/*
 * Are.na normally serves images through their own resizing proxy at
 * images.are.na, but for content it can't resize (e.g. animated GIFs) the
 * `display` URL instead points straight at their origin CDN. That host isn't
 * in astro.config.mjs's image domain allowlist, so treat those as if there
 * were no image rather than growing the allowlist for a single edge case.
 */
const isSupportedImageHost = (url: string) =>
  new URL(url).hostname === "images.are.na";

/* Returns null for blocks that shouldn't appear on the resources page */
export const normalizeBlock = (block: AreNaBlock) => {
  const parsed = parseStructuredDescription(block.description);
  if (!parsed) return null;

  const rawImageUrl = block.image?.display?.url;
  const hasSupportedImage = Boolean(
    rawImageUrl && isSupportedImageHost(rawImageUrl),
  );
  if (!hasSupportedImage && !block.source?.url) return null;

  return {
    areNaId: block.id,
    title: block.generated_title || block.title,
    description: parsed.description,
    sourceUrl: block.source?.url || undefined,
    sourceTitle: block.source?.title || undefined,
    imageUrl: hasSupportedImage ? rawImageUrl : undefined,
    author: parsed.author,
    tags: parsed.tags,
  };
};

const run = async () => {
  console.log("Fetching education resources from Are.na...");

  const blocks = await fetchAllBlocks();
  const entries = blocks
    .filter((block) => block.state === "available")
    .map(normalizeBlock)
    .filter((entry) => entry !== null);

  console.log(
    `Fetched ${blocks.length} blocks, ${entries.length} match the required by-line/tag format. Writing to ${outputDirectory}...`,
  );

  await cleanUpDirectory(outputDirectory);

  for (const entry of entries) {
    const filePath = path.join(outputDirectory, `${entry.areNaId}.yaml`);
    await writeFile(filePath, yaml.dump(entry));
  }

  console.log("Done!");
};

export const testingExports = {
  parseStructuredDescription,
  normalizeBlock,
  areNaBlockSchema,
};

if (import.meta.main) {
  run();
}
