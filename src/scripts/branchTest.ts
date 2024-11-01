import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2];
const match = /^(.+)#(.+)$/.exec(url);
if (!match) {
  console.error(
    `Please pass a git URL followed by a # and then a branch name, tag, or commit as the parameter to this script, e.g. https://github.com/processing/p5.js.git#main`,
  );
  process.exit(1);
}

const repoUrl = match[1];
const branch = match[2];

const env = `P5_LIBRARY_PATH='/p5.min.js' P5_REPO_URL='${repoUrl}' P5_BRANCH='${branch}'`;

// First delete the existing cloned p5 to make sure we clone fresh
const parsedP5Path = path.join(__dirname, "./parsers/in/p5.js/");
if (existsSync(parsedP5Path)) {
  rmSync(parsedP5Path, { recursive: true });
}

// Build the reference using the specified environment
execSync(`${env} npm run build:reference`, { stdio: "inherit" });

// Run a dev server
execSync(`${env} npm run dev`, { stdio: "inherit" });
