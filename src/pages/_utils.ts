import {
  getCollection,
  type CollectionEntry,
  type AnyEntryMap,
  type ContentEntryMap,
} from "astro:content";
import { defaultLocale, supportedLocales } from "../../const";

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
 * **Note: only handles absolute paths!**
 *
 * @param slug
 * @returns a tuple of the locale and the new slug
 */
export const splitLocaleFromPath = (path: string): [string, string] => {
  for (const loc of supportedLocales) {
    const localeRegex = new RegExp(`^/?${loc}(?:/|$)`, "i");
    const matched = path.match(localeRegex);
    if (matched !== null) return [loc, path.replace(localeRegex, "/")];
  }
  return [defaultLocale, path];
};

/**
 * Removes the default locale prefix from a slug (if its there)
 *
 * @param slug
 * @returns
 */
export const removeLocalePrefix = (prefixedPath: string): string =>
  splitLocaleFromPath(prefixedPath)[1];

/**
 * Turns a given url (of any locale) into a url within the given locale
 * **Note: only handles absolute paths!**
 *
 * @param url
 * @param newLocale
 * @returns
 */
export const reformUrlforNewLocale = (url: string, newLocale: string) => {
  const unPrefixedUrl = removeLocalePrefix(url);
  if (newLocale === defaultLocale) {
    return `${unPrefixedUrl}`;
  }
  return `/${newLocale}${unPrefixedUrl}`;
};

/**
 * Gets the current locale by parsing it out of the current url.
 * **Note: Can only be used client-side!**
 *
 * @returns
 */
export const getCurrentLocale = (): string => {
  const [locale] = splitLocaleFromPath(window.location.pathname);
  return locale;
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

/**
 * Creates a regex that matches any of the supported locale codes
 * at the beginning of a path or slug. Also matches an optional `/`
 * before and an optional `/` after.
 */
export const localeMatchingRegex = () =>
  new RegExp(`^/?(?:${supportedLocales.join("|")})(?:/|$)`);
