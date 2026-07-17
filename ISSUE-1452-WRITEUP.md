# Issue #1452 — GLSL tutorial renders as a thin vertical column

**Repo:** processing/p5.js-website · **Issue:** [#1452](https://github.com/processing/p5.js-website/issues/1452)
**Page affected:** `/tutorials/intro-to-glsl/` (and all rendered-markdown tutorial pages)
**Label:** Reserved (CodeDay) · **Assigned to:** Jose
**File at the center of it all:** [`styles/markdown.scss`](styles/markdown.scss)

---

## TL;DR

A framework upgrade silently swapped one working CSS line for an invalid one. That removed the
maximum-width cap on tutorial text, which collapsed the layout into an unreadable vertical column
of text. It stayed broken for ~3.5 weeks, then a *different* PR — aimed at a *different* symptom —
happened to replace the broken line with valid CSS and healed it without anyone realizing they'd
closed #1452.

**The bug is already fixed in the current code.** What was missing is a regression test to stop it
from ever coming back silently. That test is my contribution.

---

## Cast of characters (the one line that matters)

The rule in `styles/markdown.scss` that caps how wide tutorial text can grow:

| State | The line | Works? | Effect on the page |
|-------|----------|--------|--------------------|
| Healthy (before) | `@apply max-w-screen-md;` | ✅ | Text capped at a readable column width |
| Broken | `@reference max-w-screen-md;` | ❌ (invalid in Tailwind v4) | No cap → layout collapses → vertical column |
| Fixed (now) | `max-width: variables.$breakpoint-tablet;` | ✅ | Text capped at 770px |

**Why `@reference max-w-screen-md;` silently fails:** In Tailwind v4, `@reference` is only valid
when it points at a *file* (`@reference "app.css";`). Pointed at a *utility name* it is invalid, so
the browser simply discards the whole line — no error, no warning. It looks almost correct, which is
exactly why it slipped through code review.

---

## Timeline

### 1. Before — healthy
`styles/markdown.scss` used `@apply max-w-screen-md;` to cap the width of every block of tutorial
content. Tutorials rendered normally.

### 2. 2026-05-27 — THE BREAK · commit `adb24d3e4` "Upgrade Astro to v6"
A large framework upgrade (6,700+ lines touched: `package-lock.json`, `package.json`, config).
Buried inside it, one word changed in `styles/markdown.scss`:

```diff
-  @apply max-w-screen-md;
+  @reference max-w-screen-md;
```

This was almost certainly an **automated codemod** run as part of the upgrade, not a deliberate
edit. The invalid line was dropped by the browser → tutorial text lost its max-width → the GLSL
tutorial (and others) collapsed into a thin vertical column. **This is issue #1452.**

### 3. 2026-05-27 → 2026-06-21 — the broken window (~3.5 weeks)
Tutorials were visibly broken on the beta branch this entire time. This matches the maintainer
(ksen0) report exactly: *"it was broken a couple weeks ago but looks fine now — why?"*

### 4. 2026-06-21 — THE ACCIDENTAL FIX · commit `3ed344be6` "Fix tutorial content too wide" (PR #1457)
A different contributor (eupthere) was addressing what looked like a **separate** problem — content
being too wide. Their fix replaced the broken line with real CSS:

```diff
-  @reference max-w-screen-md;
+  max-width: variables.$breakpoint-tablet;
```

This restored the width cap, and the vertical-column bug disappeared **as a side effect**. The
author was not targeting #1452, so the two were never connected and #1452 was never formally closed
against this commit.

---

## Why it "broke two weeks ago but is fine today"

Because two unrelated commits, ~3.5 weeks apart, touched the same line:
- `adb24d3e4` (May 27) broke it via an upgrade codemod.
- `3ed344be6` (Jun 21) fixed it while chasing a different symptom.

The heal was incidental, which is why nobody could explain it — there was no PR that *said* it fixed
#1452.

---

## The real risk

Nothing today guarantees this stays fixed. The exact same failure mode could reappear the next time
a codemod or a hurried edit turns valid CSS into a silently-invalid `@reference <utility>;`. There
was **no test** guarding it. That is the gap.

---

## My contribution — the regression test

**File:** [`test/styles/markdown-scss.test.ts`](test/styles/markdown-scss.test.ts) (Vitest, 5 tests)

It compiles `styles/markdown.scss` with `sass` and asserts:
1. Rendered content has a real, positive `max-width` (not missing/zero).
2. That max-width equals `$breakpoint-tablet` (the intended 770px cap).
3. `.full-width` correctly opts out to a wider limit.
4. No stray `@reference` survives into the compiled CSS.
5. A source scan of `styles/` + `src/` fails on **any** `@reference <utility>;` — this guards the
   entire bug *class*, not just this one line.

**Verified:** 5/5 pass on the current (fixed) code; 4/5 fail when pointed at the pre-fix broken file.
So it genuinely catches the regression rather than passing vacuously.

---

## What happens next (PR plan)

1. Re-run the test against current code to confirm 5/5 green.
2. Commit `test/styles/markdown-scss.test.ts` to branch `josecodeday`.
3. Open a PR to upstream (processing/p5.js-website) that:
   - Adds the regression test.
   - Links this writeup so maintainers get the root-cause explanation for ksen0's question.
   - References #1452.
4. Share this writeup with the CodeDay teammate.

**Note:** the PR does **not** re-fix the bug (already fixed by #1457). It adds the missing guardrail
so the bug — and its whole class — can't silently return.
