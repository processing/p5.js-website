import { cloneLibraryRepo, readFile } from "../utils";
import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import type { ParsedLibraryReference } from "../../../types/parsers.interface";

// Derive the directory name (__dirname equivalent) in ES Module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Local directory to clone the p5.js library
const localPath = path.join(__dirname, "in", "p5.js");
const localSoundPath = path.join(__dirname, "in", "p5.sound.js");
const yuidocOutputPath = path.join(__dirname, "out")

/**
 * Main function to clone the p5.js library and save the YUIDoc output to a file
 */
export const parseLibraryReference =
  async (): Promise<ParsedLibraryReference | null> => {
    // Clone p5.js
    await cloneLibraryRepo(localPath);
    await saveYuidocOutput('p5.js', 'data-p5');
    const p5Data = await getYuidocOutput('data-p5');
    if (!p5Data) throw new Error('Error generating p5 reference data!');

    // Clone p5.sound.js
    await cloneLibraryRepo(
      localSoundPath,
      'https://github.com/processing/p5.sound.js.git',
      'moduleref', // 'main',
      { shouldFixAbsolutePathInPreprocessor: false }
    );
    await saveYuidocOutput('p5.sound.js', 'data-sound');
    const soundData = await getYuidocOutput('data-sound');
    if (!soundData) throw new Error('Error generating p5.sound reference data!');

    const combined = await combineYuidocData(
      [
        p5Data,
        soundData,
      ],
      'data'
    );

    await serveYuidocOutput('data');
    return combined;
  };

/**
 * Gets the parsed YUIDoc output from the saved file and parses it as JSON
 * returns the parsed YUIDoc output
 */
const serveYuidocOutput = async (outDirName: string): Promise<void> => {
  const outputFilePath = path.join(yuidocOutputPath, outDirName, "data.json");
  const destinationPath = path.join(__dirname, '../../../public/reference/data.json');
  await fs.copyFile(outputFilePath, destinationPath);
};

/**
 * Gets the parsed YUIDoc output from the saved file and parses it as JSON
 * returns the parsed YUIDoc output
 */
const getYuidocOutput = async (outDirName: string): Promise<ParsedLibraryReference | null> => {
  const outputFilePath = path.join(yuidocOutputPath, outDirName, 'data.json');
  const output = await readFile(outputFilePath);
  if (output) {
    try {
      return JSON.parse(output);
    } catch (err) {
      console.error(`Error parsing YUIDoc output as JSON: ${err}`);
    }
  }
  return null;
};

/**
 * Parses the p5.js library using YUIDoc and captures the output
 */
export const saveYuidocOutput = async (inDirName: string, outDirName: string) => {
  console.log("Running YUIDoc command and capturing output...");
  const outputFilePath = path.join(yuidocOutputPath, outDirName);
  try {
    await fs.mkdir(yuidocOutputPath, { recursive: true });
    const inPath = path.join(__dirname, "in", inDirName);
    console.log(inPath)
    await new Promise((resolve, reject) => {
      exec(`yuidoc -p --outdir ${outputFilePath} .`, { cwd: inPath }, (error, stdout) => {
        if (error) {
          console.error(`Error running YUIDoc command: ${error}`);
          reject(error);
        } else {
          console.log("YUIDoc command completed successfully.");
          resolve(stdout); // Assuming stdout contains the JSON output
        }
      });
    });
  } catch (err) {
    console.error(`Error capturing YUIDoc output: ${err}`);
    throw err;
  }
};

export async function combineYuidocData(
  inputData: ParsedLibraryReference[],
  outDirName: string
): Promise<ParsedLibraryReference> {
  const result: ParsedLibraryReference = inputData.reduce(
    (acc, next) => {
      return {
        project: acc.project,
        files: {
          ...acc.files,
          ...next.files,
        },
        modules: {
          ...acc.modules,
          ...next.modules,
        },
        classes: {
          ...acc.classes,
          ...next.classes,
        },
        classitems: [
          ...acc.classitems,
          ...next.classitems,
        ],
        consts: {
          ...acc.consts,
          ...next.consts,
        }
      }
    }
  );
  await fs.mkdir(path.join(yuidocOutputPath, outDirName), { recursive: true });
  await fs.writeFile(
    path.join(yuidocOutputPath, outDirName, 'data.json'),
    JSON.stringify(result, null, 2)
  );
  return result;
}
