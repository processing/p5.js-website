import simpleGit from "simple-git";
import fs, { cp, readdir } from "fs/promises";
import path from "path";
import type { CopyOptions, Dirent } from "fs";
import { fileURLToPath } from "url";

/* Absolute path to the root of this project repo */
export const repoRootPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);

/**
 * Clone the library repo if it doesn't exist or if it's not recent
 * @param localSavePath The path to save the library repo to
 * @param [repoUrl] The URL of the library repo to clone, default to p5.js library
 * @returns void
 */
export const cloneLibraryRepo = async (
  localSavePath: string,
  repoUrl = "https://github.com/processing/p5.js.git",
) => {
  const git = simpleGit();

  const repoExists = await fileExistsAt(localSavePath);
  const hasRecentRepo = repoExists && (await fileModifiedSince(localSavePath));

  if (!hasRecentRepo) {
    console.log("Preparing to clone repository...");

    // If the directory exists but the repo is not recent, delete it first
    if (repoExists) {
      console.log(`Deleting old repository at ${localSavePath}...`);
      await fs.rm(localSavePath, { recursive: true, force: true });
      console.log("Old repository deleted.");
    }

    console.log("Cloning repository ...");
    try {
      await git.clone(repoUrl, localSavePath, [
        "--depth",
        "1",
        "--filter=blob:none",
      ]);
      console.log("Repository cloned successfully.");
      await fixAbsolutePathInPreprocessor(localSavePath);
    } catch (err) {
      console.error(`Error cloning repo: ${err}`);
      throw err;
    }
  } else {
    console.log(
      "Recent version of library repo already exists, skipping clone...",
    );
  }
};

/**
 * Check if a file was modified within a given time frame
 * @param path Path to the file
 * @param [hoursAgo] Number of hours ago to compare the file's modification time to, default = 24
 * @returns boolean whether the file was modified within the given time frame
 */
export const fileModifiedSince = async (path: string, hoursAgo = 1000) => {
  try {
    const stats = await fs.stat(path);
    const modifiedTime = stats.mtime.getTime();
    const currentTime = Date.now();
    const threshold = currentTime - hoursAgo * 60 * 60 * 1000; // 24 hours in milliseconds

    return modifiedTime >= threshold;
  } catch (err) {
    console.error(`Error checking modification time: ${err}`);
    return false;
  }
};

/**
 *
 * @param path Path to the file
 * @returns boolean whether a file exists at the given path
 */
export const fileExistsAt = async (path: string) => {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
};

/**
 * A wrapper around fs.writeFile that creates the directory if it doesn't exist,
 * logs the path of the file written, and catches errors.
 * @param filePath path to write the file to
 * @param data content for the file
 */
export const writeFile = async (filePath: string, data: string) => {
  try {
    // Ensure the directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    // Write the file
    await fs.writeFile(filePath, data);
    console.log(`File written to ${filePath}`);
  } catch (err) {
    console.error(`Error writing to file: ${err}`);
  }
};

/**
 * Wrapper around fs.readFile that catches errors
 * @param filePath Path to the file
 * @returns string the content of the file
 */
export const readFile = async (
  filePath: string,
  silent: boolean | undefined = false,
) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    return fileContent;
  } catch (err) {
    if (!silent) {
      console.error(`Error reading file: ${err}`);
    }
  }
};

/**
 * Get all the file paths in a directory and its subdirectories
 * @param directory Top-level directory to search for files
 * @returns string[] an array of all the file paths in the directory and its subdirectories
 */
export const getAllFiles = async (directory: string) => {
  const files: string[] = [];

  // Function to recursively read the directory and its subdirectories
  const readDirectory = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

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
};

/* Wrapper around `fs.cp` that catches errors
 * @param filePath Path to the file
 * @param destinationPath Where to copy it
 * @param cpOptions Options passed to `fs.cp`
 *
 * @returns string the content of the file
 */
export const copyDirectory = async (
  directoryPath: string,
  destinationPath: string,
  cpOpts?: CopyOptions,
) => {
  try {
    await cp(directoryPath, destinationPath, cpOpts);
  } catch (err) {
    console.error(`Error copying file: ${err}`);
  }
};

/**
 * The preprocessor.js file in the library repo has an absolute path to the parameterData.json file.
 * This function modifies the absolute path to a relative path.
 * @param localSavePath The path that the library repo is saved to
 * @returns boolean whether the fix was successful
 */
export const fixAbsolutePathInPreprocessor = async (localSavePath: string) => {
  try {
    const preprocessorPath = path.join(
      localSavePath,
      "docs",
      "preprocessor.js",
    );
    let preprocessorContent = await fs.readFile(preprocessorPath, "utf8");

    preprocessorContent = preprocessorContent.replace(
      "path.join(process.cwd(), 'docs', 'parameterData.json')",
      `path.join(__dirname, 'parameterData.json')`,
    );

    await fs.writeFile(preprocessorPath, preprocessorContent, "utf8");
    console.log("Preprocessor file modified successfully.");
    return true;
  } catch (err) {
    console.error(`Error modifying absolute path in preprocessor: ${err}`);
    return false;
  }
};

/* Some names contain characters that need to be sanitized for pathing, MDX, etc. */
export const sanitizeName = (name: string) =>
  name.replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Returns the full path for a
 * [Dirent object](https://nodejs.org/api/fs.html#class-fsdirent)
 *
 * @param dirent
 * @returns full path to the entry
 */
export const fullPathFromDirent = (dirent: Dirent): string =>
  path.join(dirent.path, dirent.name);

/**
 * Returns the absolute path of the files within a directory
 * *Note: Does not recurse into subfolders!*
 *
 * If the given directory is actually a file, just returns
 * that filepath in an array
 *
 * @param dir [Dirent object](https://nodejs.org/api/fs.html#class-fsdirent)
 * @returns full path to the entry
 */
export const getFilepathsWithinDir = async (
  dir: Dirent,
): Promise<Array<string>> => {
  const dirAbsolutePath = fullPathFromDirent(dir);
  return dir.isFile()
    ? // if the DirEnt is actually a single file, just return that as a list of one
      [dirAbsolutePath]
    : // readdir returns relative filepaths 🥴
      (await readdir(dirAbsolutePath)).map((p) =>
        path.join(dir.path, dir.name, p),
      );
};

/**
 * Get all the .yaml and .mdx files in a directory and its subdirectories
 * @param baseDir Base directory to start searching for content files
 * @returns string[] an array of all the .yaml and .mdx paths in the directory and its subdirectories
 */
export const getContentFilePaths = async (baseDir: string) => {
  const files = await fs.readdir(baseDir, { withFileTypes: true });
  let contentFilePaths: string[] = [];
  for (const file of files) {
    if (file.isDirectory()) {
      // Recurse into subdirectories
      contentFilePaths = contentFilePaths.concat(
        await getContentFilePaths(path.join(baseDir, file.name)),
      );
    } else if (file.name.endsWith(".mdx") || file.name.endsWith(".yaml")) {
      // Collect MDX files
      contentFilePaths.push(path.join(baseDir, file.name));
    }
  }
  return contentFilePaths;
};

/**
 * Rewrites linked pages in a markdown document to remove the `.md`
 * extension and use the Astro URL convention of ending in a `/`
 *
 * For example: `./access.md` is converted to `./access/`
 *
 * @param markdownText markdown text to modify
 * @returns markdown text with links replaced
 */
export const rewriteRelativeMdLinks = (markdownText: string): string => {
  /**
   * Regex to find relative links to a markdown document in a string of Markdown
   * Has 2 capture groups:
   * 1. Text for the link
   * 2. Link url (but not the .md extension at the end)
   */
  const regexPattern: RegExp = /\[([^\]]+)\]\((.?\/?[^)]+)\.md\)/g;
  return markdownText.replace(regexPattern, (_match, linkText, url) => {
    return `[${linkText}](${url}/)`;
  });
};
