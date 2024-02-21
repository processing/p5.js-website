import fs from "fs/promises";
import simpleGit from "simple-git";

export const cloneLibraryRepo = async (
  repoUrl: string,
  localSavePath: string
) => {
  const git = simpleGit();

  console.log("Cloning repository ...");
  try {
    await git.clone(repoUrl, localSavePath, [
      "--depth",
      "1",
      "--filter=blob:none",
    ]);
    console.log("Repository cloned successfully.");
  } catch (err) {
    console.error(`Error cloning repo: ${err}`);
  }
};

export const fileExistsAt = (path: string): Promise<boolean> =>
  fs
    .access(path)
    .then(() => true)
    .catch(() => false);
