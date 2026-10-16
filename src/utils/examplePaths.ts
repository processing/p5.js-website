import path, { dirname, join, relative, sep } from "node:path";

type PathFunctions = Pick<typeof path, "dirname" | "join">;
type IdPathFunctions = Pick<typeof path, "dirname" | "relative" | "sep">;

export function getExampleCodePath(
  descriptionPath: string,
  pathFunctions: PathFunctions = { dirname, join }
): string {
  return pathFunctions.join(
    pathFunctions.dirname(descriptionPath),
    "code.js"
  );
}

/**
 * Creates a stable example ID such as "07_Repetition/03_Kaleidoscope".
 * The ID always uses "/" separators, regardless of operating system.
 */
export function getExampleId(
  descriptionPath: string,
  examplesDirectory: string,
  pathFunctions: IdPathFunctions = { dirname, relative, sep }
): string {
  return pathFunctions
    .relative(examplesDirectory, pathFunctions.dirname(descriptionPath))
    .split(pathFunctions.sep)
    .join("/");
}
