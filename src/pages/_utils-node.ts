import { readFile, access } from "fs/promises";
import { constants } from "fs";

// THIS FILE OF UTILS IS FOR CODE THAT NEEDS NODEJS RUNTIME DEPS
// IT CANNOT BE IMPORTED INTO A COMPONENT THAT RENDERS ON THE CLIENT
// TODO: PICK A BETTER NAME FOR THIS FILE

/**
 * @returns whether or not a file exists at a given path.
 */
export async function checkFileExists(file: string): Promise<boolean> {
  return access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

/**
 * Returns the code sample needed for the example given.
 *
 * @param exampleId id for the entry (not the slug)
 * @returns
 */
export const getExampleCode = async (example: any): Promise<string> => {
  let codePath = example.filePath.replace("description.mdx", "code.js");
  if (!(await checkFileExists(codePath))) {
    // Fall back to the English version
    codePath = example.filePath.replace(
      /src\/content\/examples\/.+?\/(.+?)\/description\.mdx/,
      "src/content/examples/en/$1/code.js"
    );
  }
  const code = await readFile(codePath, "utf-8");
  // Ensures that all examples use the correct path for assets which must be prefixed
  // with the forward slash. This is necessary because the examples are rendered in an iframe
  // Authoring practices should be updated to use the correct path, but this is a backup.
  const assetMigratedCode = code.replaceAll(/\(["']assets/g, "('/assets");
  return assetMigratedCode;
};

export const removeNestedReferencePaths = (route: string): string =>
  route.replace(/constants\/|types\//, "")

export const rewriteRelativeLink = (url: string): string => {
  let updatedUrl: string = url;

  if (/^(https?:|mailto:|\/\/)/.exec(url)) {
    // Skip rewriting for external URLs (http(s), mailto)
    return url;
  } else if (url.startsWith('#')||url.startsWith('/')) {
    // Skip rewriting for heading links and root-relative internal paths
    updatedUrl = url;
  } else {
    // Convert relative paths to '../' (because pages that started as files in the same directory
    // get turned into directories themselves, we need to go up a directory in the link)
    if (url.startsWith('./')) {
      updatedUrl = `.${url}`;
    } else if (!url.startsWith('../')) {
      updatedUrl = `../${url}`;
    } else {
      updatedUrl = url;
    }

    // Relative links to md files should be turned into pages
    // Use includes() instead of endsWith() to handle cases like "file.md#section"
    // Use lookahead (?=#|$) to avoid breaking .mdx, etc.
    if (updatedUrl.includes('.md')) {
      updatedUrl = updatedUrl.replace(/\.md(?=#|$)/, '/');
    }
  }

  // Add a trailing / if the link isn't to a file and does not have query params or a hash reference
  if (
    !updatedUrl.endsWith('/') &&
    !/(\.\w+)$/.exec(updatedUrl) &&
    !updatedUrl.includes('?') &&
    !/#([\w-]+)$/.exec(updatedUrl)
  ) {
    updatedUrl += '/';
  }

  return updatedUrl;
};

/**
 * Transforms an Astro content slug for an example into the legacy website slug.
 *
 * Astro automatically uses the directory structure for slug information.
 * Historically the p5 website has used a different structure for example file
 * vs. webpage routing. This function bridges the two.
 *
 * Note: This function lives in _utils-node.ts (rather than _utils.ts) so that
 * it can be imported by Node-only scripts such as the search-index builder
 * without pulling in Astro-specific virtual modules.
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
