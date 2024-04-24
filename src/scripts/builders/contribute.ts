import { readdir, rm } from "fs/promises";
import path from "path";
import {
  cloneLibraryRepo,
  copyDirectory,
  fullPathFromDirent,
  getFilepathsWithinDir,
  readFile,
  repoRootPath,
  rewriteRelativeMdLinks,
  writeFile,
} from "../utils";
import type { Dirent } from "fs";
import { remark } from "remark";
import remarkMDX from "remark-mdx";
import remarkGfm from "remark-gfm";
import strip from "strip-markdown";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import isAbsoluteUrl from "is-absolute-url";
import { nonDefaultSupportedLocales, supportedLocales } from "@/src/i18n/const";

/* Repo to pull the contributor documentation from */
const docsRepoUrl = "https://github.com/processing/p5.js.git";
/* Where to clone the repo to */
const clonedRepoPath = path.join(repoRootPath, "in/p5.js/");
/* Absolute path to docs (within the cloned repo) */
const sourceDirectory = path.join(clonedRepoPath, "contributor_docs/");
/* Where the docs will be output for the website */
const outputDirectory = path.join(
  repoRootPath,
  "src/content/contributor-docs/",
);
/* Name of the folder within `sourceDirectory` folder where static assets are found */
const sourceAssetsSubFolder = "images";
/* Name of the folder within `outputDirectory` folder where static assets will be copied to */
const outputAssetsSubFolder = "images";
/* Base URL to refer to assets from final mdx docs */
const assetsOutputBaseUrl = path.join(
  "src/content/contributor-docs/",
  outputAssetsSubFolder,
);
/* Where the image assets will be output for the website */
const assetsOutputDirectory = path.join(outputDirectory, "images");

/*
 * Directories that are translations, including languages
 * that are not supported by the overall website
 */
const langDirs = [...nonDefaultSupportedLocales, "ar", "sk", "pt-br"];

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

  const contentWithRewrittenLinksAndComments = convertMarkdownCommentsToMDX(
    rewriteRelativeImageLinks(
      rewriteRelativeMdLinks(contents),
      assetsOutputBaseUrl,
    ),
  );
  const newFilePath = path.join(destinationFolder, `${name}.mdx`);

  try {
    // Convert the markdown content to MDX
    const newContent = remark()
      .use(remarkGfm)
      .use(remarkMDX)
      .processSync(contentWithRewrittenLinksAndComments)
      .toString();

    const description = await extractDescription(newContent);
    const { title, markdownText: newContentWithoutTitle } =
      await extractTitle(newContent);

    // All MDX content with frontmatter as a string
    const fullFileContent = matter.stringify(newContentWithoutTitle, {
      title,
      description,
    });

    // Check that generated content can be compiled by MDX
    // (sometimes this catches different problems)
    await compile(fullFileContent);

    await writeFile(newFilePath, fullFileContent);
  } catch (e) {
    console.error(
      `${sourceFile} could not be converted to .mdx (${e}). Skipping.`,
    );
  }

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
  const regexPattern: RegExp = /!\[([^\]]+)\]\((.?\/?[^)]+)\)/g;
  return markdownText.replace(regexPattern, (match, linkText, url) => {
    if (!isAbsoluteUrl(url)) {
      const { base } = path.parse(url);
      return `![${linkText}](${assetsFolderUrl}/${base})`;
    }
    return match;
  });
};

export const convertMarkdownCommentsToMDX = (markdownText: string): string => {
  const regexPattern: RegExp = /<!--([\S\s]*?)-->/g;
  return markdownText.replace(
    regexPattern,
    (_match, commentContent) => `{/*${commentContent}*/}`,
  );
};

/**
 * Extracts the title from the markdown document and
 * returns the text without the title inline
 * This is because rendering the title will be handled with
 * the frontmatter title data
 *
 * @param markdownText
 * @returns
 */
export const extractTitle = async (
  markdownText: string,
): Promise<{ title: string; markdownText: string }> => {
  // gets the first title string in the document
  const regexPattern: RegExp = /^#+ ([\S\s]+?)$/im;
  const firstTitleMatch = regexPattern.exec(markdownText);
  if (!firstTitleMatch) {
    return { title: "Untitled", markdownText };
  }

  return {
    // Strip any markdown formatting that might be included
    title: String(await remark().use(strip).process(firstTitleMatch[1])),
    markdownText: markdownText.replace(regexPattern, ""),
  };
};

/**
 * Extracts a description from the markdown document.
 *
 * @param markdownText
 * @returns
 */
export const extractDescription = async (markdownText: string) => {
  const firstLineComment = markdownText.match(
    /^\{\/\*\s?([\S\s]+?)\s?\*\/\}\s?[\n\r]/i,
  );
  const firstParagraph = markdownText.match(/^[^\s#{][\s\S]*?$/im);

  // get the comment at the top of the document
  // or the first paragraph in the document
  const rawDescription =
    firstLineComment !== null
      ? firstLineComment[1]
      : firstParagraph !== null
        ? firstParagraph[0]
        : "Couldn't find a description";

  // Strip any markdown formatting that might be included
  return String(await remark().use(strip).process(rawDescription));
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

  // Clean out previous files
  console.log("Cleaning out current content collection...");
  await Promise.all(
    supportedLocales.map((lang) =>
      rm(path.join(outputDirectory, lang), {
        recursive: true,
        force: true,
      }),
    ),
  );
  // and the images folder
  await rm(path.join(outputDirectory, outputAssetsSubFolder), {
    recursive: true,
    force: true,
  });

  // get all the files and folders within the docs folder
  const topLevelFiles = await readdir(sourceDirectory, { withFileTypes: true });

  // iterate through all the files at the top level and handle accordingly
  for (const tlf of topLevelFiles) {
    const fullFilePath = fullPathFromDirent(tlf);
    const { ext, base } = path.parse(tlf.name);
    const isDirectory = tlf.isDirectory();

    if (isDirectory && base === sourceAssetsSubFolder) {
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
      console.debug(`Converting Markdown file into MDX in 'en' (${tlf.name})`);
      await convertMdtoMdx(fullFilePath, path.join(outputDirectory, "en"));
    } else {
      console.debug(`Copying file into 'en' (${tlf.name})`);
      await copyDirectory(fullFilePath, path.join(outputDirectory, "en", base));
    }
  }
  console.log("Contributor docs build completed.");
};

buildContributorDocs();
