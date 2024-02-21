import * as documentation from "documentation";
import {
  cloneLibraryRepo,
  fileExistsAt,
  isModifiedWithin24Hours,
} from "./utilities.js";
import matter from "gray-matter";
import { remark } from "remark";
import remarkMDX from "remark-mdx";
import fs from "fs";
import path from "path";

const examplesDirectory = "in/p5.js-website/src/data/examples/en/";

const localPath = "in/p5.js-website";
const repoUrl = "https://github.com/processing/p5.js-website.git";

const fileToCodeBlock = new Map();

async function main() {
  await cloneLibraryRepoIfNeeded();
  await convertExamplesCommentsToDocBlocks();
  const examples = await buildExamples();
  const mdx = await buildMDX(examples);
  await saveMDX(mdx);

  console.log("Done building examples!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/** SETUP */

async function cloneLibraryRepoIfNeeded() {
  const currentRepoExists =
    (await fileExistsAt(localPath)) &&
    (await isModifiedWithin24Hours(localPath));
  if (!currentRepoExists) {
    await cloneLibraryRepo(repoUrl, localPath);
  } else {
    console.log("Website repo already exists, skipping clone...");
  }
}

/** IO */

async function saveMDX(mdxDocs) {
  console.log("Saving MDX...");
  try {
    for (const mdxDoc of mdxDocs) {
      if (!mdxDoc.name || !mdxDoc.savePath || !mdxDoc.mdx) {
        console.log("Skipping file because of missing data: ", mdxDoc);
        continue;
      }
      console.log(mdxDoc.savePath, mdxDoc.name);
      await fs.mkdir(mdxDoc.savePath, { recursive: true }, function (err) {
        if (err) {
          console.error(`Error creating directory: ${err}`);
        }
      });
      await fs.writeFile(
        `${mdxDoc.savePath}/index.mdx`,
        mdxDoc.mdx.toString(),
        function (err) {
          if (err) {
            console.error(`Error saving MDX: ${err}`);
          }
        }
      );
    }
  } catch (err) {
    console.error(`Error saving MDX: ${err}`);
  }
}

/** PARSING EXAMPLES */

async function buildExamples() {
  return documentation.build(
    [
      "in/p5.js-website/src/data/examples/en/00_Structure/*.js",
      "in/p5.js-website/src/data/examples/en/01_Form/*.js",
      "in/p5.js-website/src/data/examples/en/02_Data/*.js",
      "in/p5.js-website/src/data/examples/en/03_Arrays/*.js",
      "in/p5.js-website/src/data/examples/en/04_Control/*.js",
      "in/p5.js-website/src/data/examples/en/05_Image/*.js",
      "in/p5.js-website/src/data/examples/en/06_Image_Processing/*.js",
      "in/p5.js-website/src/data/examples/en/07_Color/*.js",
      "in/p5.js-website/src/data/examples/en/08_Math/*.js",
      "in/p5.js-website/src/data/examples/en/09_Simulate/*.js",
      "in/p5.js-website/src/data/examples/en/10_Interaction/*.js",
      "in/p5.js-website/src/data/examples/en/11_Objects/*.js",
      "in/p5.js-website/src/data/examples/en/12_Lights/*.js",
      "in/p5.js-website/src/data/examples/en/13_Motion/*.js",
      "in/p5.js-website/src/data/examples/en/15_Instance_Mode/01_Instantiating.js",
      "in/p5.js-website/src/data/examples/en/16_Dom/*.js",
      "in/p5.js-website/src/data/examples/en/17_Drawing/*.js",
      "in/p5.js-website/src/data/examples/en/18_Transform/*.js",
      "in/p5.js-website/src/data/examples/en/19_Typography/*.js",
      "in/p5.js-website/src/data/examples/en/20_3D/*.js",
      "in/p5.js-website/src/data/examples/en/21_Input/*.js",
      "in/p5.js-website/src/data/examples/en/22_Advanced_Data/*.js",
      "in/p5.js-website/src/data/examples/en/33_Sound/*.js",
      "in/p5.js-website/src/data/examples/en/35_Mobile/*.js",
      "in/p5.js-website/src/data/examples/en/90_Hello_P5/*.js",
    ],

    {
      shallow: true,
    }
  );
}

async function buildMDX(examples) {
  return examples.map((example) => {
    const { tags } = example;

    const splitPath = example.context.file.split(/(in\/)/);
    const codeBlock = fileToCodeBlock.get(splitPath[1] + splitPath[2]);
    let frontMatterArgs = {
      layout: "@layouts/reference/ExampleLayout.astro",
      code: `${codeBlock}`,
    };
    for (const tag of tags) {
      if (tag.title === "title") {
        frontMatterArgs.title = tag.description;
      }
      if (tag.title === "description") {
        frontMatterArgs.description = tag.description;
      }
      if (tag.title === "arialabel") {
        frontMatterArgs.arialabel = tag.description;
      }
    }
    try {
      const frontmatter = matter.stringify("", frontMatterArgs);
      let markdownContent = `# Example\n`;
      const mdxContent = remark().use(remarkMDX).processSync(markdownContent);
      const savePath = `src/pages/en/examples/${frontMatterArgs.title}`
        .toLowerCase()
        .replaceAll(" ", "-");
      const name = frontMatterArgs.title;
      return {
        savePath,
        name,
        mdx: `${frontmatter}\n${mdxContent.toString()}`,
      };
    } catch (err) {
      console.error(`Error converting ${example.name} to MDX: ${err}`);
      console.log(frontMatterArgs);
      return;
    }
  });
}

async function convertExamplesCommentsToDocBlocks() {
  try {
    const files = await getAllFiles(examplesDirectory);

    for (const file of files) {
      const fileContent = await fs.promises.readFile(file, "utf8");
      let updatedContent = fileContent.replace("/*\n", "/**\n");
      updatedContent = updatedContent.replace("@name", "@title");

      await fs.promises.writeFile(file, updatedContent, "utf8");

      const codeBlock = fileContent.substring(fileContent.indexOf("*/") + 2);
      fileToCodeBlock.set(file, codeBlock);
    }

    console.log("Comments replaced successfully in all files.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

async function getAllFiles(directory) {
  const files = [];

  const readDirectory = async (dir) => {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await readDirectory(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  };

  await readDirectory(directory);

  return files;
}
