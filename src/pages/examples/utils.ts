/** Astro automatically uses the directory structure for slug information */
/** Historically the p5 website has used a different structure for example file vs. webpage routing */
/** This function transforms the Astro slug to the appropriate webpage route to avoid breaking */
/** Any inbound legacy links */
export const exampleContentSlugToLegacyWebsiteSlug = (path: string): string =>
  path
    .replace(/^en\/\d+_(.*?)\/\d+_(.*?)\/description$/, "/$1-$2.html")
    .replace(/_/g, "-");

export default exampleContentSlugToLegacyWebsiteSlug;
