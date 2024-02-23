import { parseLibrary } from "../parsers/reference";

export const buildReference = async () => {
  let parsedOutput;
  try {
    const output = await parseLibrary();
    // parsedOutput = JSON.parse(output);
  } catch (err) {
    console.error(`Error parsing library: ${err}`);
  }
};

buildReference();
