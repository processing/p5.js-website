import path from "path";
import yaml from "js-yaml";
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

interface AreNaBlock {
  id: number;
  title: string;
  generated_title: string;
  description: string | null;
  state: string;
  source: {
    url: string;
    title: string;
  } | null;
  image: {
    display: {
      url: string;
    };
  } | null;
  connected_by_username: string;
}

interface AreNaChannelResponse {
  length: number;
  contents: AreNaBlock[];
}

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

    const data = (await response.json()) as AreNaChannelResponse;
    blocks.push(...data.contents);

    hasMorePages = data.contents.length === perPage;
    page += 1;
  }

  return blocks;
};

/* Only keep blocks that are fully processed and have something to display */
const isUsableBlock = (block: AreNaBlock) =>
  block.state === "available" && Boolean(block.image?.display?.url || block.source?.url);

/*
 * Are.na normally serves images through their own resizing proxy at
 * images.are.na, but for content it can't resize (e.g. animated GIFs) the
 * `display` URL instead points straight at their origin CDN. That host isn't
 * in astro.config.mjs's image domain allowlist, so treat those as if there
 * were no image rather than growing the allowlist for a single edge case.
 */
const isSupportedImageHost = (url: string) =>
  new URL(url).hostname === "images.are.na";

const normalizeBlock = (block: AreNaBlock) => {
  const imageUrl = block.image?.display?.url;
  return {
    areNaId: block.id,
    title: block.generated_title || block.title,
    description: block.description || undefined,
    sourceUrl: block.source?.url || undefined,
    sourceTitle: block.source?.title || undefined,
    imageUrl: imageUrl && isSupportedImageHost(imageUrl) ? imageUrl : undefined,
    author: block.connected_by_username || undefined,
  };
};

const run = async () => {
  console.log("Fetching education resources from Are.na...");

  const blocks = await fetchAllBlocks();
  const usableBlocks = blocks.filter(isUsableBlock);

  console.log(
    `Fetched ${blocks.length} blocks, ${usableBlocks.length} are usable. Writing to ${outputDirectory}...`,
  );

  await cleanUpDirectory(outputDirectory);

  for (const block of usableBlocks) {
    const filePath = path.join(outputDirectory, `${block.id}.yaml`);
    await writeFile(filePath, yaml.dump(normalizeBlock(block)));
  }

  console.log("Done!");
};

run();
