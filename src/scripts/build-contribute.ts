import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";
import {
  cloneLibraryRepo,
  copyDirectory,
  fullPathFromDirent,
  getFilepathsWithinDir,
  readFile,
  repoRootPath,
  rewriteRelativeMdLinks,
  writeFile,
} from "./utils";
import type { Dirent } from "fs";

/* Absolute path to the folder this file is in */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
/* Repo to pull the contributor documentation from */
const docsRepoUrl = "https://github.com/processing/p5.js.git";
/* Where to clone the repo to */
const clonedRepoPath = path.join(__dirname, "../../in/p5.js/");
/* Absolute path to docs (within the cloned repo) */
const sourceDirectory = path.join(clonedRepoPath, "contributor_docs/");
/* Where the docs will be output for the website */
const outputDirectory = path.join(__dirname, "../content/contributor-docs/");
/* Name of the folder within `sourceDirectory` folder where static assets are found */
const assetsSubFolder = "images";
/* Base URL to refer to assets from final mdx docs*/
const assetsOutputBaseUrl = path.join("images/contributor-docs");
/* Where the image assets will be output for the website */
const assetsOutputDirectory = path.join(
  repoRootPath,
  "public",
  assetsOutputBaseUrl,
);

/* Directories that are translations
 * TODO: tie this to supported languages in astro config
 */
const langDirs = ["ar", "es", "hi", "ko", "pt-br", "sk", "zh"];

/**
 * Moves a markdown file to a new location, converting into MDX along the way
 * Skips files without an `.md` extension
 *
 * @param sourceFile        Which markdown file to read from
 * @param destinationFolder Which folder to write the MD file into as an
 *                          MDX with the same name
 * @param frontmatterObject This will be converted into the yaml frontmatter
 *                          of the output MDX file
 * @returns Promise that resolves to undefined
 */
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

  const contentWithRewrittenLinks = rewriteRelativeImageLinks(
    rewriteRelativeMdLinks(contents),
    assetsOutputBaseUrl,
  );

  const newFilePath = path.join(destinationFolder, `${name}.mdx`);

  // Build new file contents with frontmatter and .md file contents
  const newFileContents = `
  ---
  ${frontmatterObject ? YAML.stringify(frontmatterObject) : ""}
  ---
  ${contentWithRewrittenLinks}
  `;

  await writeFile(newFilePath, newFileContents);

  return undefined;
};

/**
 * Moves the contents of given directory into Astro's static asset folder
 *
 * @param dirPath path to the folder of assets
 */
const moveAssetsFolder = async (dirPath: string) => {
  await copyDirectory(dirPath, assetsOutputDirectory, {
    recursive: true,
  });
};

/**
 * Rewrites image links to use Astro's static asset folder url
 *
 * For example: `images/my-dog.png` is converted to `/public/images/my-dog.png`
 *
 * @param markdownText markdown text to modify
 * @returns markdown text with links replaced
 */
export const rewriteRelativeImageLinks = (
  markdownText: string,
  assetsFolderUrl: string,
): string => {
  /**
   * Regex to find relative image links in a string of Markdown
   * Has 2 capture groups:
   * 1. Alt Text for the image
   * 2. Image url
   */
  const regexPattern: RegExp = /!\[([^\]]+)\]\((.?\/?images[^)]+)\)/g;
  return markdownText.replace(regexPattern, (match, linkText, url) => {
    const { base } = path.parse(url);
    return `![${linkText}](${assetsFolderUrl}/${base})`;
  });
};

/**
 * Moves a list of files or a folder of files to a new location,
 * converting all .md files into .mdx
 *
 * *Note: Does not recurse into subfolders!*
 *
 * @param files
 */
const moveContentDirectory = async (
  directory: Dirent,
  destinationFolder: string,
) => {
  const filepathsToMove = await getFilepathsWithinDir(directory);
  // iterate through files and convert or move
  for (const fp of filepathsToMove) {
    const { ext, base } = path.parse(fp);
    if (ext === ".md") {
      await convertMdtoMdx(fp, destinationFolder);
    } else {
      // if it's not an md file, just copy it
      await copyDirectory(fp, path.join(destinationFolder, base));
    }
  }
};

/**
 * Builds the contributor docs by cloning the p5 repo
 * and converting the files into a content collection in this
 * Astro site.
 */
const buildContributorDocs = async () => {
  console.log("Building contributor docs...");

  await cloneLibraryRepo(clonedRepoPath, docsRepoUrl);

  // get all the files and folders within the docs folder
  const topLevelFiles = await readdir(sourceDirectory, { withFileTypes: true });

  // iterate through all the files at the top level and handle accordingly
  for (const tlf of topLevelFiles) {
    const fullFilePath = fullPathFromDirent(tlf);
    const { ext, base } = path.parse(tlf.name);
    const isDirectory = tlf.isDirectory();

    if (isDirectory && base === assetsSubFolder) {
      console.debug("Copying images folder");
      await moveAssetsFolder(fullFilePath);
    } else if (isDirectory && langDirs.includes(base)) {
      console.debug(`Moving language folder (${tlf.name})`);
      await moveContentDirectory(tlf, path.join(outputDirectory, base));
      // The tricky thing here is that the files (and folders that
      // aren't a language folder) at the top level of the p5 contribute
      // docs folder need to be moved into an `en` subfolder in the output
      // file structure to support our localization approach. This and the
      // remaining conditionals handle that case depending on the kind of file
    } else if (isDirectory) {
      console.debug(`Moving regular folder into 'en' (${tlf.name})`);
      await moveContentDirectory(tlf, path.join(outputDirectory, "en", base));
    } else if (!isDirectory && ext === ".md") {
      console.debug(`Converting Markdown file into MDC in 'en' (${tlf.name})`);
      await convertMdtoMdx(fullFilePath, path.join(outputDirectory, "en"));
    } else {
      console.debug(`Copying file into 'en' (${tlf.name})`);
      await copyDirectory(fullFilePath, path.join(outputDirectory, "en", base));
    }
  }
  console.log("Contributor docs build completed.");
};

buildContributorDocs();
