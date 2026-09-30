import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import yaml from "js-yaml";

import {
  addAttributionToCode,
  type RemixEntry,
} from "../utils/exampleAttribution";
import { getExampleCodePath } from "../utils/examplePaths";

import { getCurationSketches } from "./openprocessing";

interface ExampleFrontmatter {
  title: string;
  oneLineDescription: string;
  remix?: RemixEntry[];
}

interface PreparedExample {
  id: string;
  title: string;
  description: string;
  code: string;
}

const EXAMPLES_DIRECTORY = "src/content/examples/en";

async function findDescriptionFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await findDescriptionFiles(fullPath)));
    } else if (entry.name === "description.mdx") {
      files.push(fullPath);
    }
  }

  return files;
}

function parseFrontmatter(contents: string): ExampleFrontmatter {
  const match = contents.match(/^---\s*\n([\s\S]*?)\n---/);

  if (!match) {
    throw new Error("Example does not contain YAML frontmatter.");
  }

  const data = yaml.load(match[1]);

  if (
    typeof data !== "object" ||
    data === null ||
    !("title" in data) ||
    !("oneLineDescription" in data)
  ) {
    throw new Error("Example frontmatter is missing required fields.");
  }

  return data as ExampleFrontmatter;
}

async function prepareExample(
  descriptionPath: string
): Promise<PreparedExample> {
  const descriptionContents = await readFile(
    descriptionPath,
    "utf-8"
  );

  const data = parseFrontmatter(descriptionContents);

  const codePath = getExampleCodePath(descriptionPath);

  let code = await readFile(codePath, "utf-8");

  // Match the website's existing asset-path behavior.
  code = code.replaceAll(/\(["']assets/g, "('/assets");

  const attributedCode = addAttributionToCode(
    code,
    data.title,
    data.remix ?? []
  );

  const id = descriptionPath
    .replace(`${EXAMPLES_DIRECTORY}/`, "")
    .replace("/description.mdx", "");

  return {
    id,
    title: data.title,
    description: data.oneLineDescription,
    code: attributedCode,
  };
}

async function getEnglishExamples(): Promise<PreparedExample[]> {
  const descriptionFiles = await findDescriptionFiles(
    EXAMPLES_DIRECTORY
  );

  return Promise.all(
    descriptionFiles.map((file) => prepareExample(file))
  );
}

async function main(): Promise<void> {
  console.log("Loading p5.js examples...");

  const examples = await getEnglishExamples();

  console.log(`Found ${examples.length} English examples.`);

  console.log("Loading OpenProcessing curation...");

  const curationSketches = await getCurationSketches();

  console.log(
    `Found ${curationSketches.length} sketches in the OpenProcessing curation.`
  );

  const curationTitles = new Set(
    curationSketches
      .map((sketch) => sketch.title)
      .filter((title): title is string => Boolean(title))
  );

  const websiteTitles = new Set(
    examples.map((example) => example.title)
  );

  const missingExamples = examples.filter(
    (example) => !curationTitles.has(example.title)
  );

  const extraSketches = curationSketches.filter(
    (sketch) =>
      sketch.title !== undefined &&
      !websiteTitles.has(sketch.title)
  );

  console.log("");
  console.log("Sync summary");
  console.log("------------");
  console.log(`Website examples: ${examples.length}`);
  console.log(`Curation sketches: ${curationSketches.length}`);
  console.log(`Missing from curation: ${missingExamples.length}`);
  console.log(`Extra in curation: ${extraSketches.length}`);

  if (missingExamples.length > 0) {
    console.log("");
    console.log("Missing examples:");

    for (const example of missingExamples) {
      console.log(`- ${example.title}`);
    }
  }

  if (extraSketches.length > 0) {
    console.log("");
    console.log("Extra sketches:");

    for (const sketch of extraSketches) {
      console.log(
        `- ${sketch.title ?? "Untitled"} (${sketch.visualID})`
      );
    }
  }

  console.log("");
  console.log(
    "Dry run complete. No OpenProcessing sketches were modified."
  );
}

main().catch((error: unknown) => {
  console.error("OpenProcessing sync failed.");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});