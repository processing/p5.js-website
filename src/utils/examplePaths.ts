import path, { dirname, join } from "node:path";

type PathFunctions = Pick<typeof path, "dirname" | "join">;

export function getExampleCodePath(
  descriptionPath: string,
  pathFunctions: PathFunctions = { dirname, join }
): string {
  return pathFunctions.join(
    pathFunctions.dirname(descriptionPath),
    "code.js"
  );
}
