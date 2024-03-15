import {
  getCollection,
  type CollectionEntry,
  type AnyEntryMap,
  type ContentEntryMap,
} from "astro:content";
import { defaultLocale, supportedLocales } from "../../const";
import { readFile } from "fs/promises";

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
  await getCollection(collectionName, ({ id }) =>
    id.startsWith(`${defaultLocale}/`),
  );

/**
 * Retreives all the entries in the given collection, filtered to only include
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
  await getCollection(collectionName, ({ id }) =>
    startsWithSupportedLocale(id),
  );

/**
 * Retreives all the entries in the given collection, filtered to only include
 * those in *non-default* locales (languages).
 *
 * @param collectionName
 * @returns
 */
export const getCollectionInLocale = async <C extends keyof AnyEntryMap>(
  collectionName: C,
  locale: string,
): Promise<CollectionEntry<C>[]> =>
  await getCollection(collectionName, ({ id }) => id.startsWith(`${locale}/`));

/**
 * Checks if a collecion entry's slug begins with a locale prefix
 * (for example: 'es/')
 *
 * @param slug
 * @returns
 */
export const startsWithSupportedLocale = (slug: string) => {
  for (const loc of supportedLocales) {
    if (slug.startsWith(`${loc}/`)) return true;
  }
  return false;
};

/**
 * Splits the locale prefix out of a slug, and
 * returns the two as separate strings.
 *
 * @param slug
 * @returns a tuple of the locale and the new slug
 */
export const removeLocalePrefixfromSlug = (slug: string): [string, string] => {
  for (const loc of supportedLocales) {
    if (slug.startsWith(`${loc}/`)) return [loc, slug.replace(loc, "")];
  }
  return [defaultLocale, slug];
};

/**
 * Removes the default locale prefix from a slug (if its there)
 *
 * @param slug
 * @returns
 */
export const removeDefaultLocalePrefix = (slug: string): string =>
  slug.startsWith(`${defaultLocale}/`) ? slug.replace(defaultLocale, "") : slug;

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
    .replace(/\d+_(.*?)\/\d+_(.*?)\/description$/, "$1-$2.html")
    // Third transformation: Replace all remaining underscores in the slug with hyphens.
    .replace(/_/g, "-");

/**
 * Returns the code sample needed for the example given.
 *
 * @param exampleId id for the entry (not the slug)
 * @returns
 */
export const getExampleCode = async (exampleId: string): Promise<string> => {
  const codePath = `src/content/examples/${exampleId.replace("description.mdx", "code.js")}`;
  const code = await readFile(codePath, "utf-8");
  return code;
};

/**
 * If the given slug is the slug of the entry in the contributor doc
 * collection that we want to use as the index page, this returns a
 * '/' slug for routing purposes. Otherwise, just returns the slug given,
 * unchanged.
 *
 * For example: `contributor-docs/es/` will show
 * the content from `contributor-docs/es/readme`
 */
export const convertContributorDocIndexSlugIfNeeded = (slug: string) => {
  const contributorDocIndexPageName = "readme";
  return slug.endsWith(contributorDocIndexPageName)
    ? `/${slug.slice(0, -contributorDocIndexPageName.length)}`
    : slug;
};

/**
 * We cannot use Astro's default slug because it removes characters like '.'
 * We use the id instead and remove the file extension
 */
export const makeReferencePageSlug = (id: string): string =>
  id.replace(/\.mdx$/, "");

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
