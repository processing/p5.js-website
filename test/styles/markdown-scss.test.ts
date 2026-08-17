import { describe, expect, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as sass from "sass";

/**
 * Regression tests for processing/p5.js-website#1452
 *
 * The shader/GLSL tutorial (and every `.rendered-markdown` page) rendered as a
 * thin, unreadable vertical column on the 2.0 / beta branch.
 *
 * Root cause: the Astro v6 upgrade (commit adb24d3e4, 2026-05-25) rewrote the
 * width constraint in `styles/markdown.scss` from a valid utility
 *
 *     @apply max-w-screen-md;
 *
 * to an invalid one
 *
 *     @reference max-w-screen-md;
 *
 * `@reference` is a Tailwind v4 at-rule whose ONLY valid form is
 * `@reference "some.css";` (it pulls theme context into a scoped stylesheet so
 * that `@apply` works). Written as `@reference <utility>;` it is not a way to
 * apply a utility — Sass passes it straight through as an unknown at-rule and
 * the browser silently drops it. The result: `.rendered-markdown` content had
 * NO `max-width`, so the layout collapsed. Commit 3ed344be6 (PR #1457,
 * 2026-06-21) fixed it with an explicit `max-width: $breakpoint-tablet;`.
 *
 * These tests fail against the broken source and pass against the fix, and they
 * guard the whole class of regression (any `@reference <utility>;` in any SCSS
 * file), not just this one line.
 */

const MARKDOWN_SCSS = "styles/markdown.scss";

/** Collect every declaration block whose selector list matches `selectorPart`. */
const declarationsFor = (css: string, selectorPart: string): string[] => {
  const blocks: string[] = [];
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = ruleRe.exec(css)) !== null) {
    const [, selector, body] = match;
    if (selector.includes(selectorPart)) blocks.push(body);
  }
  return blocks;
};

/** Recursively list every `.scss` file under the given roots. */
const scssFilesUnder = (roots: string[]): string[] => {
  const out: string[] = [];
  for (const root of roots) {
    for (const entry of readdirSync(root, {
      recursive: true,
      withFileTypes: true,
    })) {
      if (entry.isFile() && entry.name.endsWith(".scss")) {
        out.push(join(entry.parentPath ?? entry.path, entry.name));
      }
    }
  }
  return out;
};

describe("markdown.scss width constraints (#1452 regression)", () => {
  const { css } = sass.compile(MARKDOWN_SCSS);

  test("top-level rendered-markdown content has a real max-width", () => {
    // `.rendered-markdown > *` is what constrains prose/code width. If this loses
    // its max-width the tutorial collapses into the reported vertical column.
    const blocks = declarationsFor(css, ".rendered-markdown > *");
    expect(blocks.length).toBeGreaterThan(0);

    const maxWidths = blocks
      .map((b) => b.match(/max-width:\s*([^;]+);/)?.[1]?.trim())
      .filter(Boolean) as string[];

    expect(maxWidths.length).toBeGreaterThan(0);
    // Must be a concrete positive length, not `0`, `none`, or a dropped value.
    for (const value of maxWidths) {
      const px = Number.parseFloat(value);
      expect(px).toBeGreaterThan(320);
    }
  });

  test("max-width matches the $breakpoint-tablet variable", () => {
    const variables = readFileSync("styles/variables.scss", "utf-8");
    const tablet = variables.match(/\$breakpoint-tablet:\s*(\d+)px/)?.[1];
    expect(tablet, "expected $breakpoint-tablet in variables.scss").toBeTruthy();

    const [body] = declarationsFor(css, ".rendered-markdown > *");
    expect(body).toContain(`max-width: ${tablet}px`);
  });

  test("full-width override still opts out to a wider max-width", () => {
    const [body] = declarationsFor(css, ".rendered-markdown > .full-width");
    const value = body?.match(/max-width:\s*([^;]+);/)?.[1]?.trim();
    expect(Number.parseFloat(value ?? "0")).toBeGreaterThan(770);
  });

  test("compiled CSS contains no stray @reference at-rules", () => {
    // A valid `@reference "file";` lives in scoped Astro <style> blocks, never
    // in this compiled global stylesheet. Any @reference here means a utility
    // was mis-applied and silently dropped (the original bug).
    expect(css).not.toMatch(/@reference/);
  });
});

describe("no invalid @reference utility usage in SCSS (#1452 root cause)", () => {
  test("@reference is only ever used with a quoted stylesheet path", () => {
    const offenders: string[] = [];
    for (const file of scssFilesUnder(["styles", "src"])) {
      const contents = readFileSync(file, "utf-8");
      const lines = contents.split("\n");
      lines.forEach((line, i) => {
        const ref = line.match(/@reference\s+([^;]+);/);
        if (!ref) return;
        const arg = ref[1].trim();
        // Valid: @reference "…"; or @reference '…';  Invalid: @reference max-w-screen-md;
        const isQuotedPath = /^["'].*["']$/.test(arg);
        if (!isQuotedPath) {
          offenders.push(`${file}:${i + 1}  @reference ${arg};`);
        }
      });
    }
    expect(
      offenders,
      `Found @reference used as a utility (invalid — Tailwind drops it, breaking layout):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
