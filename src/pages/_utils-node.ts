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
  let updatedUrl: string;

  if (/^((https?:\/)?)\//.exec(url) || url.startsWith('mailto:')) {
    // Leave absolute paths alone
    updatedUrl = url;
  } else if (url.startsWith('#')) {
    // Leave links to headings alone
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
    if (updatedUrl.endsWith('.md')) {
      updatedUrl = updatedUrl.replace(/\.md$/, '');
    }
  }

  // Add a trailing / if the link isn't to a file and does not have query params or a hash reference
  if (
    !updatedUrl.endsWith('/') &&
    !/(\.\w+)$/.exec(updatedUrl) &&
    !updatedUrl.includes('?') &&
    !/#([\w-]+)$/.exec(updatedUrl) // Removed the unnecessary escape character
  ) {
    updatedUrl += '/';
  }

  return updatedUrl;
};
