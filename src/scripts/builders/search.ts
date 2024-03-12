import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  ContentType,
  SearchSupportedLocales,
} from "../../../types/content.interface";
import { getContentFilePaths } from "../utils";
import keywordExtractor from "keyword-extractor";
import { contentTypes, localesWithSearchSupport } from "../../globals/globals";

interface SearchIndex {
  [title: string]: {
    relativeUrl: string;
    description?: string;
  };
}

type LocaleSearchIndex = {
  [locale in SearchSupportedLocales]?: ContentTypeSearchIndex;
};

type ContentTypeSearchIndex = {
  [contentType in ContentType]?: SearchIndex;
};

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

async function buildSearchIndices(): Promise<void> {
  const fullSearchIndex: LocaleSearchIndex = {};

  for (const locale of localesWithSearchSupport) {
    const contentTypeSearchIndex =
      await generateContentTypesSearchIndex(locale);
    if (contentTypeSearchIndex) {
      fullSearchIndex[locale] = contentTypeSearchIndex;
    }
  }

  await saveSearchIndex(fullSearchIndex);
}

const saveSearchIndex = async (
  fullSearchIndex: LocaleSearchIndex,
): Promise<void> => {
  for (const locale in fullSearchIndex) {
    const output = fullSearchIndex[locale];
    if (locale !== "en") {
      for (const contentType in fullSearchIndex["en"]) {
        output[`${contentType}-fallback`] = fullSearchIndex["en"][contentType];
      }
    }
    await fs.writeFile(
      path.join(outputBaseDir, `${locale}.json`),
      JSON.stringify(output),
    );
  }
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
  return content;
};

const generateContentTypesSearchIndex = async (
  locale: SearchSupportedLocales,
) => {
  const localeSearchIndex: ContentTypeSearchIndex = {};

  for (const contentType of contentTypes) {
    const contentTypeSearchIndex = await generateSearchIndex(
      contentType,
      locale,
    );
    if (contentTypeSearchIndex) {
      localeSearchIndex[contentType] = contentTypeSearchIndex;
    }
  }

  return localeSearchIndex;
};

const generateSearchIndex = async (
  contentType: ContentType,
  locale: SearchSupportedLocales,
) => {
  const contentDir = path.join(contentBaseDir, contentType);
  let localeDir = path.join(contentDir, locale);

  try {
    await fs.access(localeDir);
  } catch {
    if (locale === "en") {
      localeDir = contentDir;
    } else {
      console.warn(`localeDir ${localeDir} does not exist. Skipping...`);
      return;
    }
  }

  const searchIndex: SearchIndex = {};
  const files = await getContentFilePaths(localeDir);
  for (const file of files) {
    let fileContent = await fs.readFile(file, "utf8");
    // Add fences so that the frontmatter is always parsed
    // even if read from a .yaml file. This is done so that
    // graymatter can parse and is an alternative to using
    // a dedicated yaml parser.
    if (file.match(/\.(yaml|yml)$/i)) {
      fileContent = `---\n${fileContent}\n---`;
    }
    const parsed = matter(fileContent);
    const { data, content } = parsed;
    const contentRelativeUrl = file
      .replace(`${localeDir}/`, "")
      .replace(".mdx", "")
      .replace(".yaml", "");
    const relativeUrl = `/${contentType}/${contentRelativeUrl}`;
    let description, title;
    switch (contentType) {
      case "tutorials":
        title = data.title;
        description = data.description;
        break;
      case "contributor-docs":
        title = file.split("/")[4].replace(".mdx", "");
        description = getKeywordsFromContent(content, locale);
        break;
      case "examples":
        title = data.title;
        description = getKeywordsFromContent(content, locale);
        break;
      case "reference":
        title = data.title;
        break;
      case "libraries":
        title = data.name;
        description = data.description;
        break;
      case "people":
        title = data.name;
        break;
      case "sketches":
        title = data.title;
        description = data.author?.name ?? "";
        break;
      case "past-events":
        title = data.title;
        description = getKeywordsFromContent(
          content + data.description,
          locale,
        );
        break;
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }

    searchIndex[title] = {
      relativeUrl,
      description,
    };
  }
  return searchIndex;
};

const contentBaseDir: string = "./src/content";
const outputBaseDir: string = "./public/search-indices";

buildSearchIndices().catch(console.error);
