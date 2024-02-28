import fs from "fs/promises";
import path from "path";
import { cloneLibraryRepo } from "./utils";

const localPath = "in/p5.js/";
const repoUrl = "https://github.com/processing/p5.js.git";

/// Where to find the docs in the cloned repo
const sourceDirectory = path.join(
  __dirname,
  localPath,
  "src/contributor_docs/",
);

/// Where the docs will be output for the website
const outputDirectory = path.join(__dirname, "../content/contributor-docs/");

const run = async () => {
  console.log("hello from the contribute builder script");
  await cloneLibraryRepo(localPath, repoUrl);
  await fs.copyFile(sourceDirectory, outputDirectory);
};

run();
