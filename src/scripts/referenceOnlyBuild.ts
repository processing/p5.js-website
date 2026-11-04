/**
 * Builds only the English reference pages (/reference/**), for PR previews
 * (processing/p5.js#9303). Every other route 404s in the output.
 *
 * Astro has no config option to exclude routes from a static build, so this
 * wrapper temporarily moves every non-reference entry out of src/pages before
 * running `astro build`, and restores them afterwards — also on failure and
 * on SIGINT/SIGTERM. Only src/pages/reference/** plus the shared _utils
 * modules (imported by layouts and components) stay in place.
 *
 * Run with: npm run build:reference-only
 * Set REFERENCE_SKIP_LOWERCASE=1 to also skip the lowercase alias routes.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");
const pagesDir = path.join(root, "src", "pages");
export const stashDir = path.join(root, ".reference-only-stash");

// Entries in src/pages that the reference build needs
const keep = new Set(["reference", "_utils.ts", "_utils-node.ts"]);

/**
 * A non-empty stash dir means a previous run died before restoring
 * src/pages (e.g. kill -9; normal failures and Ctrl-C restore on their own).
 * Refuse to run rather than mix two runs' stashes, and say how to recover.
 */
export const assertStashDirUsable = (dir: string) => {
  let stashed: string[];
  try {
    stashed = fs.readdirSync(dir);
  } catch {
    return; // no stash dir: nothing to recover
  }
  if (stashed.length === 0) return;
  throw new Error(
    `Refusing to run: ${dir} already exists and is not empty.\n` +
      `A previous run was probably interrupted before it could restore ` +
      `src/pages. Recover with:\n\n` +
      `  mv ${path.relative(root, dir)}/* src/pages/ && rmdir ${path.relative(root, dir)}\n`,
  );
};

// Sync so it can also run inside a signal handler.
const restoreStash = () => {
  let stashed: string[];
  try {
    stashed = fs.readdirSync(stashDir);
  } catch {
    return;
  }
  for (const entry of stashed) {
    fs.renameSync(path.join(stashDir, entry), path.join(pagesDir, entry));
  }
  fs.rmdirSync(stashDir);
  console.log("Restored non-reference pages.");
};

let restored = false;
const restoreOnce = () => {
  if (restored) return;
  restored = true;
  restoreStash();
};

let currentChild: ReturnType<typeof spawn> | undefined;

const runAstroBuild = () =>
  new Promise<number>((resolve) => {
    // `astro build` directly rather than `npm run build`, which would also
    // run `astro check` — previews don't need type checking and it costs time.
    // detached puts npx and the astro process it spawns in their own process
    // group, so the signal handler below can kill both; signalling only the
    // npx wrapper leaves the actual build running.
    const child = spawn("npx", ["astro", "build"], {
      cwd: root,
      stdio: "inherit",
      detached: true,
      env: { ...process.env, REFERENCE_ONLY: "1" },
    });
    currentChild = child;
    child.on("exit", (code, signal) => resolve(signal ? 1 : (code ?? 1)));
    child.on("error", (err) => {
      console.error(`Failed to start astro build: ${err}`);
      resolve(1);
    });
  });

const main = async () => {
  assertStashDirUsable(stashDir);
  fs.mkdirSync(stashDir, { recursive: true });

  // Kill the build's process group, restore src/pages, and exit with the
  // conventional signal exit code. The child is detached, so this group-kill
  // is what stops the build on Ctrl-C too.
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      if (currentChild?.pid) {
        try {
          process.kill(-currentChild.pid, signal);
        } catch {
          // the group already exited
        }
      }
      restoreOnce();
      process.exit(signal === "SIGINT" ? 130 : 143);
    });
  }

  try {
    let moved = 0;
    for (const entry of fs.readdirSync(pagesDir)) {
      if (keep.has(entry)) continue;
      fs.renameSync(path.join(pagesDir, entry), path.join(stashDir, entry));
      moved++;
    }
    console.log(`Moved ${moved} non-reference page entries aside.`);
    process.exitCode = await runAstroBuild();
  } finally {
    restoreOnce();
  }
};

// Only run when executed as a script, so tests can import the helpers.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
