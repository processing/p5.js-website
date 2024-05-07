import path from "path";
import { cloneLibraryRepo, repoRootPath, writeFile } from "../utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

/* Repo to pull the contributor documentation from */
const sourceRepoUrl = "https://github.com/processing/p5.js.git";
/* Where to clone the repo to */
const clonedRepoPath = path.join(repoRootPath, "in", "p5.js");
/* Absolute path to people collection */
const outputDirectory = path.join(
  repoRootPath,
  "src",
  "content",
  "people",
  "en",
);

const run = async () => {
  console.log("Copying people from p5.js website into people collection...");

  await cloneLibraryRepo(clonedRepoPath, sourceRepoUrl);

  const contents = await readFile(
    path.join(clonedRepoPath, ".all-contributorsrc"),
    "utf8",
  );

  const peopleObject = JSON.parse(contents).contributors as {
    name: string;
    profile: string;
  }[];

  await Promise.all(
    peopleObject.map(async (p) => {
      const slug = p.name.toLowerCase().replaceAll(/[ ._]/g, "-");

      return await writeFile(
        path.join(outputDirectory, `${slug}.yaml`),
        yaml.dump({
          name: p.name,
          url: p.profile,
          category: "contributor",
        }),
      );
    }),
  );
  console.log("Done!");
};

run();
