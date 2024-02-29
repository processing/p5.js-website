import { readdir, cp } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";
import {
  cloneLibraryRepo,
  fullPathFromDirent,
  readFile,
  writeFile,
} from "./utils";
import type { Dirent } from "fs";

/// The absolute path to the folder this file is in
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/// Absolute path to the root of this project repo
const repoRootPath = path.join(__dirname, "../../");

const localPath = path.join(__dirname, "../../in/p5.js/");
const repoUrl = "https://github.com/processing/p5.js.git";

/// Where to find the docs in the cloned repo
const sourceDirectory = path.join(localPath, "contributor_docs/");

/// Where the docs will be output for the website
const outputDirectory = path.join(__dirname, "../content/contributor-docs/");

/// Directories that are translations
// TODO: tie this to supported languages in astro config
const langDirs = ["ar", "es", "hi", "ko", "pt-br", "sk", "zh"];
const assetsSubFolder = "images";

const convertMdtoMdx = async (
  sourceFile: string,
  destinationFolder: string,
  frontmatterObject?: { [key: string]: string },
) => {
  const { name, ext } = path.parse(sourceFile);

  if (ext !== ".md") {
    console.warn(
      `${sourceFile} is not an .md file, and will not be converted to .mdx`,
    );
    return;
  }

  const contents = await readFile(sourceFile);

  // this means the read file failed for some reason
  if (contents === undefined) return;

  const newFilePath = path.join(destinationFolder, `${name}.mdx`);
  const newContents = `
  ---
  ${frontmatterObject ? YAML.stringify(frontmatterObject) : ""}
  ---
  ${contents}
  `;
  await writeFile(newFilePath, newContents);
};

const moveAssetsFolder = async (dirPath: string) => {
  await cp(dirPath, path.join(repoRootPath, "public/contributor-docs"), {
    recursive: true,
  });
};

/**
 * Moves a list of files or a folder of files to a new location,
 * converting all .md files into .mdx
 *
 * Does not recurse into subfolders!
 *
 * @param files
 */
const moveContentFiles = async (
  files: Dirent | Array<string>,
  destinationFolder: string,
) => {
  // TODO: Make this little transform easier to read
  const filepathsToMove = Array.isArray(files)
    ? files
    : files.isFile()
      ? [fullPathFromDirent(files)]
      : // jesus christ, readdir only returns relative filepaths 🥴
        (await readdir(fullPathFromDirent(files))).map((p) =>
          path.join(files.path, files.name, p),
        );
  for (const fp of filepathsToMove) {
    const { ext, base } = path.parse(fp);
    if (ext === ".md") {
      await convertMdtoMdx(fp, destinationFolder);
    } else {
      await cp(fp, path.join(destinationFolder, base));
    }
  }
};

const run = async () => {
  console.log("Building contributor docs...");

  await cloneLibraryRepo(localPath, repoUrl);

  // get all the files and folders within the docs folder
  const topLevelFiles = await readdir(sourceDirectory, { withFileTypes: true });

  for (const tlf of topLevelFiles) {
    const fullFilePath = fullPathFromDirent(tlf);
    const { ext, base } = path.parse(tlf.name);

    if (tlf.isDirectory()) {
      if (base === assetsSubFolder) {
        // console.debug("moving images folder");
        await moveAssetsFolder(fullFilePath);
      } else if (langDirs.includes(base)) {
        // console.debug(`moving lang folder (${tlf.name})`);
        await moveContentFiles(tlf, path.join(outputDirectory, base));
      } else {
        // console.debug(`moving regular folder into 'en' (${tlf.name})`);
        await moveContentFiles(tlf, path.join(outputDirectory, "en", base));
      }
    } else if (ext === ".md") {
      // console.debug(`moving markdown file into 'en' (${tlf.name})`);
      await convertMdtoMdx(fullFilePath, path.join(outputDirectory, "en"));
    } else if (ext === ".mdx") {
      // console.debug(`copy mdx file into 'en' (${tlf.name})`);
      await cp(fullFilePath, path.join(outputDirectory, "en", base));
    } else {
      // some other file type (not sure if we want to do this?)
      await cp(fullFilePath, path.join(outputDirectory, "en", base));
    }
  }
  console.log("Contributor docs build completed.");
};

run();
