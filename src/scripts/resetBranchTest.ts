import { fileURLToPath } from "url";
import path from "path";
import { existsSync, rmSync } from "fs";
import simpleGit from "simple-git";

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const referencePath = path.join(__dirname, '../content/reference/');
  const dataPath = path.join(__dirname, '../../public/reference/data.json')
  rmSync(referencePath, { recursive: true });

  const git = simpleGit();
  await git.checkout('HEAD', [referencePath, dataPath]);

  const p5BuildPath = path.join(__dirname, '../../public/p5.min.js');
  if (existsSync(p5BuildPath)) {
    rmSync(p5BuildPath);
  }
}

main().then(() => process.exit(0))
