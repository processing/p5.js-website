import { fileURLToPath } from "url";
import path from "path";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import simpleGit from "simple-git";

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const referencePath = path.join(__dirname, '../content/reference/en/');
  const dataPath = path.join(__dirname, '../../public/reference/data.json')
  rmSync(referencePath, { recursive: true });

  const envFilePath = path.join(__dirname, '../../.env');
  if (existsSync(envFilePath)) {
    const currentEnv = readFileSync(envFilePath).toString();
    writeFileSync(
      envFilePath,
      currentEnv
        .split('\n')
        .filter((line: string) => !line.startsWith('P5_') && !line.startsWith('PUBLIC_P5_'))
        .join('\n')
    );
  }

  const git = simpleGit();
  await git.checkout('HEAD', [referencePath, dataPath]);

  const p5BuildPath = path.join(__dirname, '../../public/p5.min.js');
  if (existsSync(p5BuildPath)) {
    rmSync(p5BuildPath);
  }
}

main().then(() => process.exit(0))
