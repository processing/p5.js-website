import {
  getCollection,
  type CollectionEntry,
  type AnyEntryMap,
  type ContentEntryMap,
} from "astro:content";
import { defaultLocale, supportedLocales } from "@i18n/const";
import { removeLocalePrefix, startsWithSupportedLocale } from "@i18n/utils";
import type { ReferenceDocContentItem } from "../content/types";
import { load } from "cheerio";
import he from "he";
import { JSDOM } from "jsdom";
import type { JumpToLink, JumpToState } from "../globals/state";
import { categories as referenceCategories } from "../content/reference/config";
import memoize from "lodash/memoize";

interface EntryWithId {
  id: string;
}

/**
 * Retreives all the entries in the given collection, filtered to only include
 * those in the default locale (language).
 *
 * @param collectionName
 * @returns
 */
export const getCollectionInDefaultLocale = async <C extends keyof AnyEntryMap>(
  collectionName: C,
): Promise<CollectionEntry<C>[]> =>
  await getCollection(collectionName, (entry: unknown) => {
    const { id } = entry as EntryWithId;
    return id.startsWith(`${defaultLocale}/`);
  });

/**
 * Retreives all the entries in the given collection for a given locale, and
 * includes entries in the default locale for entries that aren't localized
 *
 * @param collectionName
 * @param locale
 * @returns
 */
export const getCollectionInLocaleWithFallbacks = memoize(async <
  C extends keyof AnyEntryMap,
>(
  collectionName: C,
  locale: string,
): Promise<CollectionEntry<C>[]> => {
  const localizedEntries = await getCollectionInLocale(collectionName, locale);
  const defaultLocaleCollection =
    await getCollectionInDefaultLocale(collectionName);
  const filteredDefaultEntries = defaultLocaleCollection.filter(
    (defaultEntry) => {
      const { id: defaultLocaleId } = defaultEntry as EntryWithId;
      return !localizedEntries.some((localeEntry: unknown) => {
        const { id: localeId } = localeEntry as EntryWithId;
        return (
          removeLocalePrefix(localeId) === removeLocalePrefix(defaultLocaleId)
        );
      });
    },
  );

  // Merge the locale entries with the filtered default entries
  return [...localizedEntries, ...filteredDefaultEntries];
}, (...args) => args.join("_"));

/**
 * Retrieves all the entries in the given collection, filtered to only include
 * those in *non-default* locales (languages).
 *
 * @param collectionName
 * @returns
 */
export const getCollectionInNonDefaultLocales = async <
  C extends keyof AnyEntryMap,
>(
  collectionName: C,
): Promise<CollectionEntry<C>[]> =>
  await getCollection(collectionName, (entry: unknown) => {
    const { id } = entry as EntryWithId;
    return startsWithSupportedLocale(id);
  });

/**
 * Retrieves all the entries in the given collection, filtered to only include
 * those in a the given *non-default* locale (language).
 *
 * @param collectionName
 * @param locale
 * @returns
 */
export const getCollectionInLocale = async <C extends keyof AnyEntryMap>(
  collectionName: C,
  locale: string,
): Promise<CollectionEntry<C>[]> =>
  await getCollection(collectionName, (entry: unknown) => {
    const { id } = entry as EntryWithId;
    return id.startsWith(`${locale}/`);
  });

/**
 *  Gets related entries from a collection utilizing our locale fallback logic.
 *  Astro doesn't do this for us when it constructs the entries at the route level,
 *  so we need to backfill this information in the page itself.
 *
 * @param collectionName
 * @param locale
 * @param relatedSlugs
 * @returns
 */
export const getRelatedEntriesinCollection = async <
  C extends keyof ContentEntryMap,
>(
  collectionName: C,
  locale: string,
  relatedSlugs: string[],
): Promise<CollectionEntry<C>[]> => {
  const collection = await getCollectionInLocaleWithFallbacks(
    collectionName,
    locale,
  );
  const foundEntries = relatedSlugs.map((relatedSlug) =>
    collection.find(
      (collectionItem) =>
        removeLocaleAndExtension(collectionItem.slug) ===
        removeLocaleAndExtension(relatedSlug),
    ),
  );
  // silly typescript isn't understanding filter
  return foundEntries.filter((el) => el !== undefined) as CollectionEntry<C>[];
};

/**
 * Astro automatically uses the directory structure for slug information
 * Historically the p5 website has used a different structure for example file vs. webpage routing
 * This function transforms the Astro slug to the appropriate webpage route to avoid breaking
 * Any inbound legacy links
 */
export const exampleContentSlugToLegacyWebsiteSlug = (slug: string): string =>
  slug
    // First transformation: Remove any locale prefix.
    .replace(/^[\w-]+?\//, "") // Remove locale prefix
    // Second transformation: Convert slugs built from local dev path to the legacy format.
    // For example, "123_topicA/456_topicB/description" becomes "topicA-topicB.html".
    .replace(/\d+_(.*?)\/\d+_(.*?)\/description$/, "$1-$2")
    // Third transformation: Replace all remaining underscores in the slug with hyphens.
    .replace(/_/g, "-");

export const getExampleCategory = (slug: string): string =>
  slug.split("/")[1].split("_").splice(1).join(" ");

export const normalizeReferenceRoute = (route: string): string =>
  removeLocaleAndExtension(route).replace(/constants\/|types\//, "");

export const removeLocaleAndExtension = (id: string): string =>
  removeContentFileExt(removeLeadingSlash(removeLocalePrefix(id)));

export const removeLeadingSlash = (path: string): string =>
  path.replace(/^\//, "");
/**
 * We cannot use Astro's default slug because it removes characters like '.'
 * We use the id instead and remove the file extension
 */
export const removeContentFileExt = (id: string): string =>
  id.replace(/\.(mdx?|ya?ml)$/, "");

/* We have to modify the Astro.js slug to match existing routing */
/* This is done dynamically here instead of relying on example authors */
/* to update their slugs in the MDX Content Entry */
export const transformExampleSlugs = <C extends keyof ContentEntryMap>(
  exampleCollection: CollectionEntry<C>[],
): CollectionEntry<C>[] => {
  const transformedEntries = exampleCollection.map((entry) => ({
    ...entry,
    slug: exampleContentSlugToLegacyWebsiteSlug(entry.slug),
  }));

  return transformedEntries;
};

/**
 * Returns the correct URL to link to for a library entry
 * @param library
 * @returns
 */
export const getLibraryLink = (library: CollectionEntry<"libraries">) =>
  library.data.websiteUrl ?? library.data.sourceUrl;

/**
 * Some reference examples have multiple examples in one string separated by <div></div>
 * This function separates the examples into individual strings
 * @param examples Reference example strings from MDX
 * @returns The examples separated into individual strings
 */
 // separateReferenceExamples
export const parseReferenceExamplesAndMetadata = (examples: string[]): { src: string, classes: Record<string, any> }[] =>
  examples
    ?.flatMap((example: string) => example.split("</div>"))
    .map((src: string) => {
      const matches = [...src.matchAll(/<div class=['"]([^"']*)['"]>/g)]
      const classes: Record<string, boolean> = {}
      for (const match of matches) {
        const tokens = match[1].split(/\s+/g)
        for (const token of tokens) {
          classes[token] = true
        }
      }
      return { classes, src }
    })
    .map(({ src, classes }) => ({ classes, src: src.replace(/<\/?div[^>]*>|<\/?code>/g, "") }))
    .filter(({ src }) => src);

/**
 * Returns the title concatenated with parentheses if the reference entry is a constructor or method
 * This could be handled in the reference parsing and authoring process instead
 * @param referenceEntry Reference entry
 * @returns The title concatenated with parentheses if the reference entry is a constructor or method
 */
export const getRefEntryTitleConcatWithParen = (
  referenceEntry: ReferenceDocContentItem,
) =>
  `${referenceEntry.data.title}${referenceEntry.data.itemtype === "method" ? "()" : ""}`;

/* Function to escape HTML content within <code> tags
 * @param htmlString String with HTML content
 * @returns String with HTML content where the content inside <code> tags is escaped
 */
export const escapeCodeTagsContent = (htmlString: string): string => {
  // Load the HTML string into Cheerio
  const $ = load(htmlString);
  // Loop through all <code> tags
  $("code").each(function () {
    // Get the current text and HTML inside the <code> tag
    const currentHtml = $(this).html() ?? "";
    // Use he to escape HTML entities
    const escapedHtml = he.escape(currentHtml);
    // Update the <code> tag content with the escaped HTML
    $(this).html(escapedHtml);
  });
  // Return the modified HTML as a string
  return $.html();
};

export const getPaginationMax = (numPerPage: number, numItems: number) =>
  Math.ceil(numItems / numPerPage);

export type PageTopic =
  | "community"
  | "reference"
  | "contribute"
  | "about"
  | "examples"
  | "tutorials";

export const getTopicInfo = (topic?: PageTopic) => {
  switch (topic) {
    case "community":
      return { name: "Community", url: "/community" };
    case "reference":
      return { name: "Reference", url: "/reference" };
    case "contribute":
      return { name: "Contribute", url: "/contribute" };
    case "about":
      return { name: "About", url: "/about" };
    case "examples":
      return { name: "Examples", url: "/examples" };
    case "tutorials":
      return { name: "Tutorials", url: "/tutorials" };
    default:
      return { name: "p5.js", url: "/" };
  }
};

/**
 * Capitalize the first letter of a string
 * (really only makes sense for English strings)
 *
 * @param str
 * @returns
 */
export const capitalize = (str: string): string =>
  str ? str[0].toUpperCase() + str.slice(1) : "";

// Function to decode HTML content and strip HTML tags
export const decodeHtml = (html: string) => {
  // Create a new JSDOM instance with the provided HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Extract text content from the parsed HTML
  const textContent = document.body.textContent || "";

  return textContent.trim(); // remove blank space at the beginning
};

/**
 * Generate jumpToLinks for an entire category of collection entries
 * Highlight the currently viewed entry
 * @param collectionType The type of collection
 * @param currentEntrySlug The id of the currently viewed entry
 * @param jumpToHeading The heading for the jumpToLinks
 * @param t Pass in the result from getUiTranslator()
 * @param currentLocale The current locale to translate the header with
 * @returns JumpToState object
 */
export const generateJumpToState = async (
  collectionType: keyof ContentEntryMap,
  currentEntrySlug: string,
  jumpToHeading: string,
  t: (...args: string[]) => string | Record<string, any>,
  currentLocale: (typeof supportedLocales)[number],
): Promise<JumpToState> => {
  // Get all entries in the collection in the default locale
  // We can use the default locale because the links are automatically
  // prefixed and there is fallback to the default locale
  const localeEntries = await getCollectionInLocaleWithFallbacks(
    collectionType,
    currentLocale,
  );

  // Get categories for the collection
  let categories: Set<string> | undefined;

  // Get the categories based on the collection type
  switch (collectionType) {
    case "reference":
      categories = new Set(referenceCategories);
      break;
    case "tutorials":
      // @ts-expect-error - We know that the category exists because of the collection type
      categories = new Set(localeEntries.map((entry) => entry.data.category));
      break;
    case "examples":
      categories = new Set(
        localeEntries.map((entry) => getExampleCategory(entry.slug)),
      );
      break;
    default:
      break;
  }

  const jumpToLinks = [] as JumpToLink[];

  // Function to get the label for a category, these are different for each collection type
  const getCategoryLabel = (category: string) => {
    switch (collectionType) {
      case "reference":
        return t("referenceCategories", "modules", category) as string;
      case "tutorials":
        return t("tutorialCategories", category) as string;
      case "examples":
        return t("exampleCategories", category) as string;
      default:
        return "";
    }
  };

  // Loop through each category and add entries to the jumpToLinks
  for (const category of categories ?? []) {
    const categoryLinks = [] as JumpToLink[];
    categoryLinks.push({
      label: getCategoryLabel(category),
      url: `/${collectionType}#${category}`,
      current: false,
    });

    // Examples are a special case where subentries are only shown if they are in the current category
    if (
      collectionType !== "examples" ||
      category === getExampleCategory(currentEntrySlug)
    ) {
      // Get all entries in the current category
      const currentCategoryEntries = localeEntries.filter(
        (entry) =>
          category ===
          (collectionType === "examples"
            ? getExampleCategory(entry.slug)
            : // @ts-expect-error - We know that the category exists because of the collection type
              entry.data.category ?? ""),
      );

      // Add the entries in the category to the jumpToLinks
      categoryLinks.push(
        ...currentCategoryEntries.map(
          (entry) =>
            ({
              label: entry.data.title,
              url: getUrl(entry, collectionType),
              size: "small",
              current:
                removeLocalePrefix(entry.slug) ===
                removeLocalePrefix(currentEntrySlug),
            }) as JumpToLink,
        ),
      );
    }
    const hasCurrent = categoryLinks.some((link) => link.current);
    // If the current entry is in this category, move this category to the top
    if (hasCurrent) {
      jumpToLinks.unshift(...categoryLinks);
    } else {
      jumpToLinks.push(...categoryLinks);
    }
  }

  // Return the JumpToState object
  return {
    heading: t(jumpToHeading) as string,
    links: jumpToLinks,
  };
};

const getUrl = (
  entry: CollectionEntry<keyof ContentEntryMap>,
  collectionType: keyof ContentEntryMap,
) => {
  switch (collectionType) {
    case "reference":
      return `/reference/${entry.slug}`;
    case "tutorials":
      return `/tutorials/${removeLocalePrefix(entry.slug)}`;
    case "examples":
      return `/examples${exampleContentSlugToLegacyWebsiteSlug(removeLocalePrefix(entry.slug))}`;
    default:
      return "";
  }
};
