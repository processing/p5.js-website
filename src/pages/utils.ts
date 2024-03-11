import { getCollection, type ContentCollectionKey } from "astro:content";
import { defaultLanguage, supportedLocales } from "../../const";

export const getCollectionInDefaultLocale = async (
  collectionName: ContentCollectionKey,
) =>
  await getCollection(
    collectionName,
    ({ slug }) => !startsWithSupportedLocale(slug),
  );

export const getCollectionInNonDefaultLocales = async (
  collectionName: ContentCollectionKey,
) =>
  await getCollection(collectionName, ({ slug }) =>
    startsWithSupportedLocale(slug),
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
