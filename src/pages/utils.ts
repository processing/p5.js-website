import {
  getCollection,
  type CollectionEntry,
  type AnyEntryMap,
} from "astro:content";
import { defaultLanguage, supportedLocales } from "../../const";

export const getCollectionInDefaultLocale = async <C extends keyof AnyEntryMap>(
  collectionName: C,
): Promise<CollectionEntry<C>[]> =>
  await getCollection(
    collectionName,
    ({ id }) => !startsWithSupportedLocale(id),
  );

export const getCollectionInNonDefaultLocales = async <
  C extends keyof AnyEntryMap,
>(
  collectionName: C,
): Promise<CollectionEntry<C>[]> =>
  await getCollection(collectionName, ({ id }) =>
    startsWithSupportedLocale(id),
  );

export const startsWithSupportedLocale = (slug: string) => {
  for (const loc of supportedLocales) {
    if (slug.startsWith(`${loc}/`)) return true;
  }
  return false;
};

export const removeLocalePrefixfromSlug = (slug: string): [string, string] => {
  for (const loc of supportedLocales) {
    if (slug.startsWith(`${loc}/`)) return [loc, slug.replace(loc, "")];
  }
  return [defaultLanguage, slug];
};

/** Astro automatically uses the directory structure for slug information */
/** Historically the p5 website has used a different structure for example file vs. webpage routing */
/** This function transforms the Astro slug to the appropriate webpage route to avoid breaking */
/** Any inbound legacy links */
export const exampleContentSlugToLegacyWebsiteSlug = (path: string): string =>
  path
    .replace(/^en\/\d+_(.*?)\/\d+_(.*?)\/description$/, "/$1-$2.html")
    .replace(/_/g, "-");

export default exampleContentSlugToLegacyWebsiteSlug;
