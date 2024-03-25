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
  return code;
};
