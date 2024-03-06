import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { ContentType } from "../../../types/content.interface";
import { getMdxFiles } from "../utils";
import keywordExtractor from "keyword-extractor";

interface SearchIndex {
  [title: string]: {
    relativeUrl: string;
    description?: string;
  };
}

interface LocaleSearchIndex {
  [locale: string]: SearchIndex;
}

interface ContentTypeSearchIndex {
  [contentType: string]: LocaleSearchIndex;
}

const languagesWithKeywordExtractionStopwords = [
  "ar",
  "cs",
  "da",
  "de",
  "en",
  "es",
  "fa",
  "fr",
  "gl",
  "it",
  "ko",
  "nl",
  "pl",
  "pt",
  "ro",
  "ru",
  "sv",
  "tr",
  "vi",
];

async function buildSearchIndices(
  baseDir: string,
  outputBaseDir: string,
): Promise<void> {
  const fullSearchIndex: ContentTypeSearchIndex = {};
  const contentDirs: ContentType[] = [
    "contributor-docs",
    "examples",
    // "libraries",
    // "past-events",
    // "people",
    "reference",
    // "sketches",
    // "tutorials",
  ];

  for (const contentType of contentDirs) {
    const contentTypeSearchIndex = await generateSearchIndex(contentType);
    if (contentTypeSearchIndex) {
      fullSearchIndex[contentType] = contentTypeSearchIndex;
    }
  }

  // Save the search index to the output directory
  await fs.writeFile(
    path.join(outputBaseDir, "searchIndex.json"),
    JSON.stringify(fullSearchIndex, null, 2),
  );

  // const locales: string[] = await fs.readdir(baseDir);
  // for (const locale of locales) {
  //   const localeDir: string = path.join(baseDir, locale);
  //   const stats = await fs.stat(localeDir);
  //   if (!stats.isDirectory()) {
  //     continue; // Skip files, process directories
  //   }
  //   // const mdxFiles: string[] = await glob(`${localeDir}/**/*.mdx`);
  //   // const titles: TitleEntry[] = await Promise.all(
  //   //   mdxFiles.map(async (filePath) => {
  //   //     const content: string = await fs.readFile(filePath, 'utf8');
  //   //     const { data } = matter(content) as { data: Frontmatter };
  //   //     return { title: data.title, filePath };
  //   //   })
  //   // );
  //   await fs.writeFile(
  //     path.join(outputDir, `${locale}.json`),
  //     JSON.stringify(titles, null, 2),
  //   );
  // }
}

const getLocaleDirectories = async (baseDir: string): Promise<string[]> => {
  const dirs = await fs.readdir(baseDir, { withFileTypes: true });
  let locales = dirs
    .filter((dir) => dir.isDirectory() && dir.name.length == 2)
    .map((dir) => dir.name);

  if (!locales.length) {
    console.warn("No locales found in examples directory, defaulting to en");
    locales = ["en"];
  }

  return locales;
};

const getKeywordsFromContent = (content: string, locale: string) => {
  if (languagesWithKeywordExtractionStopwords.includes(locale)) {
    return keywordExtractor
      .extract(content, {
        language: locale,
        remove_digits: true,
        return_changed_case: false,
        remove_duplicates: true,
      })
      .join(" ");
  }
  return "";
};

/**
 * Generate the search index for the examples content type
 * Loops over each locale and generates a search index for each locale
 */
const generateExamplesSearchIndex = async () => {
  const examplesDir = path.join(contentBaseDir, "examples");
  const locales = await getLocaleDirectories(examplesDir);
  const allLocalesSearchIndex: LocaleSearchIndex = {};
  for (const locale of locales) {
    const searchIndex: SearchIndex = {};
    const localeDir = path.join(contentBaseDir, "examples", locale);
    const files = await getMdxFiles(localeDir);
    for (const file of files) {
      const fileContent = await fs.readFile(file, "utf8");
      const { data, content } = matter(fileContent);
      const relativeUrl = file
        .split("/")[5]
        .slice(3)
        .replaceAll("_", "-")
        .toLocaleLowerCase();
      searchIndex[data.title] = {
        relativeUrl: `/examples/${relativeUrl}`,
        description: getKeywordsFromContent(content, locale),
      };
    }
    allLocalesSearchIndex[locale] = searchIndex;
  }
  return allLocalesSearchIndex;
};

const generateReferenceSearchIndex = async () => {
  const refDir = path.join(contentBaseDir, "reference");
  const locales = await getLocaleDirectories(refDir);
  const allLocalesSearchIndex: LocaleSearchIndex = {};
  for (const locale of locales) {
    const searchIndex: SearchIndex = {};
    const localeDir = path.join(contentBaseDir, "reference", locale);
    const files = await getMdxFiles(localeDir);
    for (const file of files) {
      const fileContent = await fs.readFile(file, "utf8");
      const { data } = matter(fileContent);
      const relativeUrl = file.replace(`${localeDir}/`, "").replace(".mdx", "");
      searchIndex[data.title] = {
        relativeUrl: `/reference/${relativeUrl}`,
        // description: content,
      };
    }
    allLocalesSearchIndex[locale] = searchIndex;
  }
  return allLocalesSearchIndex;
};

const generateContributeSearchIndex = async () => {
  const refDir = path.join(contentBaseDir, "contributor-docs");
  const locales = await getLocaleDirectories(refDir);
  const allLocalesSearchIndex: LocaleSearchIndex = {};
  for (const locale of locales) {
    const searchIndex: SearchIndex = {};
    const localeDir = path.join(contentBaseDir, "contributor-docs", locale);
    const files = await getMdxFiles(localeDir);
    for (const file of files) {
      const fileContent = await fs.readFile(file, "utf8");
      const { content } = matter(fileContent);
      const relativeUrl = file.replace(`${localeDir}/`, "").replace(".mdx", "");
      const title = file.split("/")[4].replace(".mdx", "");
      searchIndex[title] = {
        relativeUrl: `/contribute/${relativeUrl}`,
        description: getKeywordsFromContent(content, locale),
      };
    }
    allLocalesSearchIndex[locale] = searchIndex;
  }
  return allLocalesSearchIndex;
};

const generateSearchIndex = async (contentType: ContentType) => {
  switch (contentType) {
    case "reference":
      return generateReferenceSearchIndex();
    case "examples":
      return generateExamplesSearchIndex();
    case "contributor-docs":
      return generateContributeSearchIndex();
    default:
      throw new Error(`Invalid content type: ${contentType}`);
  }
};

const contentBaseDir: string = "./src/content";
const outputBaseDir: string = "./public/searchIndices";

buildSearchIndices(contentBaseDir, outputBaseDir).catch(console.error);
