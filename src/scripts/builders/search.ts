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
import type { LanguageName } from "keyword-extractor/types/lib/keyword_extractor";

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

// These languages have stopwords available for keyword extraction
// Future improvements could consider adding stopwords for other languages
// to improve minification
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

/**
 * This script generates search indices for the content types
 * that support search. The search indices are saved as JSON files
 * by locale in the public directory.
 */
async function buildSearchIndices(): Promise<void> {
  const fullSearchIndex: LocaleSearchIndex = {};

  // Generate search index for each locale that supports search
  for (const locale of localesWithSearchSupport) {
    // Generate search index for each content type
    const contentTypeSearchIndex =
      await generateContentTypesSearchIndex(locale);
    // Add the collection of content type search indices
    // to the full search index
    if (contentTypeSearchIndex) {
      fullSearchIndex[locale] = contentTypeSearchIndex;
    }
  }

  // Save the full search index to the public directory
  await saveSearchIndex(fullSearchIndex);
}

/**
 * Save the full search index to the public directory as locale-specific JSON files
 * @param fullSearchIndex All search indices for all locales and all content types
 */
const saveSearchIndex = async (
  fullSearchIndex: LocaleSearchIndex,
): Promise<void> => {
  // Loop through each locale and save the search index as a JSON file
  for (const locale in fullSearchIndex) {
    const output = fullSearchIndex[locale as SearchSupportedLocales];
    // Add fallback search index for non-English locales
    // This allows for English search results to be displayed
    // when the user's locale is not supported for a specific item
    // example: I am a user of the "ar" and I search for "colorMode".
    // There isn't a 'colorMode' translation yet but I can navigate to and
    // view the English version of the page. This is better than not
    // having any search results at all.
    if (locale !== "en") {
      for (const contentType in fullSearchIndex["en"]) {
        if (!output) continue;
        output[`${contentType}-fallback` as ContentType] =
          fullSearchIndex?.["en" as SearchSupportedLocales]?.[
            contentType as ContentType
          ];
      }
    }
    // Write the file to the public directory
    // Note: the file is minified to reduce file size
    // and improve load times. To prevent minification
    // in order to debug the search index in development,
    // you can add a `null, 2` as the second
    // & third arguments to `JSON.stringify` below.
    await fs.writeFile(
      path.join(outputBaseDir, `${locale}.json`),
      JSON.stringify(output),
    );
  }
};

/**
 * Extract keywords from content for search indexing
 * using the keyword-extractor package
 * @param content The content to extract keywords from
 * @param locale The locale of the content
 * @returns The keywords extracted from the content
 */
const getKeywordsFromContent = (content: string, locale: string) => {
  if (languagesWithKeywordExtractionStopwords.includes(locale)) {
    return keywordExtractor
      .extract(content, {
        language: locale as LanguageName,
        remove_digits: true,
        return_changed_case: false,
        remove_duplicates: true,
      })
      .join(" ");
  }
  return content;
};

/**
 * Generate search index for all content types
 * on a specific locale
 * @param locale The locale to generate the search index for
 * @returns The search index for the locale
 */
const generateContentTypesSearchIndex = async (
  locale: SearchSupportedLocales,
) => {
  const localeSearchIndex: ContentTypeSearchIndex = {};

  // Loop through each content type and generate the search index
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

/**
 * Generate search index for a specific content type
 * on a specific locale
 * @param contentType The content type to generate the search index for
 * @param locale The locale to generate the search index for
 * @returns The search index for the content type
 */
const generateSearchIndex = async (
  contentType: ContentType,
  locale: SearchSupportedLocales,
) => {
  // Get the directory for the content type
  const contentDir = path.join(contentBaseDir, contentType);
  // Get the locale-specific directory for the content type
  let localeDir = path.join(contentDir, locale);

  try {
    await fs.access(localeDir);
  } catch {
    // The default locale might be at the root of the content directory
    if (locale === "en") {
      localeDir = contentDir;
    } else {
      console.warn(`localeDir ${localeDir} does not exist. Skipping...`);
      return;
    }
  }

  const searchIndex: SearchIndex = {};
  // Get the paths of all content files
  const files = await getContentFilePaths(localeDir);
  // Loop through each content file and generate the search index
  for (const file of files) {
    let fileContent = await fs.readFile(file, "utf8");
    // Add fences so that graymatter can parse yaml into object.
    // This is an alternative to using
    // a dedicated yaml parser.
    if (file.match(/\.(yaml|yml)$/i)) {
      fileContent = `---\n${fileContent}\n---`;
    }
    const parsed = matter(fileContent);
    const { data, content } = parsed;
    // Get the relative URL of the content
    // this is used to link to the content in the search results
    const contentRelativeUrl = file
      .replace(`${localeDir}/`, "")
      .replace(".mdx", "")
      .replace(".yaml", "");
    let relativeUrl = `/${contentType}/${contentRelativeUrl}`;
    let description, title;
    // Each content type has a slightly different structure
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
        relativeUrl = file
          .replace("src/content/examples/", "")
          .replace(".mdx", "")
          .toLowerCase()
          // TODO: Separate Astro utils from the exampleContentSlugToLegacyWebsiteSlug
          .replace(/^[\w-]+?\//, "")
          .replace(/\d+_(.*?)\/\d+_(.*?)\/description$/, "$1-$2")
          .replace(/_/g, "-");
        relativeUrl = `examples/${relativeUrl}`;
        title = data.title;
        description = getKeywordsFromContent(content, locale);
        break;
      case "reference":
        title = data.title;
        break;
      case "libraries":
        title = data.name;
        description = data.description;
        relativeUrl = `libraries/`;
        break;
      case "people":
        title = data.name;
        relativeUrl = `people/`;
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
