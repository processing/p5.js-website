import { readFile, access } from "fs/promises";
import { constants } from "fs";
import { removeLocalePrefix } from "@i18n/utils";

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
export const getExampleCode = async (exampleId: string): Promise<string> => {
  let codePath = `src/content/examples/${exampleId.replace(
    "description.mdx",
    "code.js",
  )}`;
  if (!(await checkFileExists(codePath))) {
    // Fall back to the English version
    codePath = `src/content/examples/en/${removeLocalePrefix(exampleId).replace(
      "description.mdx",
      "code.js",
    )}`;
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
    return url;
  } 
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
    // Ensure we handle anchors/query strings by splitting suffix, removing .md from base, rejoining parts
    const firstSpecialIdx = (() => {
      const qi = updatedUrl.indexOf('?');
      const hi = updatedUrl.indexOf('#');
      if (qi === -1 && hi === -1) return -1;
      if (qi === -1) return hi;
      if (hi === -1) return qi;
      return Math.min(qi, hi);
    })();

    const basePart = firstSpecialIdx === -1 ? updatedUrl : updatedUrl.slice(0, firstSpecialIdx);
    const suffixPart = firstSpecialIdx === -1 ? "" : updatedUrl.slice(firstSpecialIdx); // includes ? or #

    let normalizedBase = basePart;
    if (normalizedBase.endsWith('.md')) {
      normalizedBase = normalizedBase.replace(/\.md$/, '');
    }

    // Add trailing slash to the base if it is a directory
    if (!normalizedBase.endsWith('/') && !/(\.\w+)$/.exec(normalizedBase)) {
      normalizedBase += '/';
    }

    updatedUrl = normalizedBase + suffixPart;
  
    return updatedUrl;
 };
