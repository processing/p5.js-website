import { readFile } from "fs/promises";

// THIS FILE OF UTILS IS FOR CODE THAT NEEDS NODEJS RUNTIME DEPS
// IT CANNOT BE IMPORTED INTO A COMPONENT THAT RENDERS ON THE CLIENT
// TODO: PICK A BETTER NAME FOR THIS FILE

/**
 * Returns the code sample needed for the example given.
 *
 * @param exampleId id for the entry (not the slug)
 * @returns
 */
export const getExampleCode = async (exampleId: string): Promise<string> => {
  const codePath = `src/content/examples/${exampleId.replace("description.mdx", "code.js")}`;
  const code = await readFile(codePath, "utf-8");
  return code;
};
