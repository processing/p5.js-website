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
