import { reference } from "astro:content";
import { z } from "astro/zod";

/**
 * Generates an entry ID that preserves the original file path casing.
 * Astro's default glob() loader lowercases IDs via github-slugger, which
 * breaks locale matching for codes like "zh-Hans". Using the raw path
 * (without extension) keeps IDs consistent with the folder structure.
 */
export const generateEntryId = ({ entry }: { entry: string }): string =>
  entry.replace(/\.(mdx|yaml)$/, "");

/*
 * A zod type for an author.
 * has a name and an optional URL to link to
 */
export const author = () =>
  z.object({
    name: z.string(),
    url: z.url().optional(),
  });

/*
 * A zod type for the flag carried by auto-generated translation stubs.
 *
 * Generally, a stub file satisfies its collection schema but it contains no translated body, so the locale fallback in
 * `getCollectionInLocaleWithFallbacks` treats entries marked `needsTranslation: true` as if the file did not exist and serves English.
 * 
 * Translators remove the flag once the page has real content (that's the assumption, we should verify this while approving and merging)
 */
export const needsTranslation = () => z.boolean().optional();

/*
 * A zod type for related pages
 */
export const relatedContent = () =>
  z.object({
    // Reference pages related to this tutorial (use the slug of the reference page)
    references: z.array(reference("reference")).optional(),
    // Examples related to this tutorial (use the slug of the example)
    examples: z.array(reference("examples")).optional(),
  });
