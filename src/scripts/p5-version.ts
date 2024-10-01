import path from "path";
import { cloneLibraryRepo, p5RepoUrl, repoRootPath, writeFile } from "./utils";
import { readFile } from "fs/promises";

/* Where to clone the repo to */
const clonedRepoPath = path.join(repoRootPath, "in", "p5.js");

const outputFile = path.join(repoRootPath, "src", "globals", "p5-version.ts");

const outputString = (version: string) =>
  `export const p5Version = "${version}" as const;\n`;

const run = async () => {
  console.log("Reading latest p5 version to update config...");

  await cloneLibraryRepo(clonedRepoPath, p5RepoUrl, "main");

  // read version from package.json
  const packageConfigContents = await readFile(
    path.join(clonedRepoPath, "package.json"),
    "utf8",
  );
  const newP5Version = JSON.parse(packageConfigContents)["version"] as string;

  // write to ts file
  await writeFile(outputFile, outputString(newP5Version));

  console.log("Done!");
};

run();
