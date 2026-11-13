# p5.js Website

## About This Repository

Hi there! Welcome to the p5.js-website repository! Here are a few things to know:

This is the repository for the [p5js.org](https://p5js.org/) and the [beta.p5js.org](https://beta.p5js.org/) websites, including:

- Reference pages and documentation
- Examples and embedded sketches used on the site
- Website-specific UI, layout, and accessibility improvements

If you have a general question or bug programming with p5.js please post it in the [p5.js forum](https://discourse.processing.org/c/p5js) or ask in our [Discord server](https://discord.p5js.org) (check the #contribute-to-p5 channel).

Please make sure you are posting to the correct repository. See [this section](https://github.com/processing/p5.js/blob/main/README.md#issues) for a list of all p5.js repositories.

Please be sure to review our [community statement](https://p5js.org/about/#community-statement) and [code of conduct](https://github.com/processing/p5.js/blob/main/CODE_OF_CONDUCT.md). These things are very important to us. Check out the [contributor docs](https://p5js.org/contribute/) for more in-depth details about contributing code, bug fixes, and documentation.

**This repo vs. the core p5.js repo, quick check before you file:**

- **Open it here** if it's about unclear wording, a missing explanation, an outdated example, or how the reference is structured.
- **Open it in the [core p5.js repository](https://github.com/processing/p5.js)** if it looks like a bug or behavior change in the p5.js library itself.
- **Not sure which?** Open it here with as much context as you can, a maintainer can help route it.

> ### Before you start working on something
>
> - **Wait for the "Help wanted" label.** A new issue may start out labeled "Awaiting Maintainer Approval," meaning it's still being reviewed and isn't ready for work yet. Once it's reviewed, it gets relabeled "Help wanted", that's your signal it's actually open for contribution.
> - **Comment before you start**, so other contributors know it's being handled. Once a maintainer sets you as "Assignee," you're clear to begin.
> - **A PR for an unapproved issue, or one someone else is already assigned to, may be closed.** This mirrors the same "approved issue first" rule the core p5.js repo uses; see the [contributor guidelines](https://p5js.org/contribute/contributor_guidelines/) for the full version.

## Table of Contents

- [How to Contribute](#how-to-contribute)
  - [Content Changes](#content-changes)
  - [Code Changes](#code-changes)
  - [Adding Libraries](#adding-libraries)
  - [Get Assigned Before Working on an Issue](#get-assigned-before-working-on-an-issue)
  - [Opening a Pull Request](#opening-a-pull-request)
- [Add Yourself to p5.js Contributors](#add-yourself-to-p5js-contributors)

## How to Contribute

Known bugs and intended new features are tracked using [GitHub issues](https://github.com/processing/p5.js-website/issues). The short version of the flow:

```
Find or file an issue → get it approved and labeled "Help wanted" → comment to claim it,
get set as Assignee → do the work on its own branch → open a PR referencing the issue → review → merge
```

If you'd like to work on an existing issue, comment on it first so other contributors know it's being handled and can offer help. If you've discovered a bug or have an idea for a new feature, start by filing an issue rather than jumping straight to a PR; a PR with no corresponding issue will probably not be accepted. Once you've gotten feedback on the issue and a go-ahead to address it, follow the steps below.

When you're ready to open a pull request, [submit it](https://github.com/processing/p5.js/blob/main/contributor_docs/contributor_guidelines.md#pull-requests) against the p5.js-website main branch. In the PR description, write "resolves #XXXX" for the issue you're fixing, or "addresses #XXXX" if the PR doesn't fully resolve it and the issue should stay open afterward.

If you've been assigned an issue and a steward or maintainer comments to check in, please reply within a week with any questions or an update. You don't need to have finished the work in a week, just confirm you're still on it, if a week goes by with no response, the issue may be reassigned.

### Content Changes

If you're here to edit or translate content, make your changes inside [the `src/content/` folder](/src/content).

The English reference files in `src/content/reference/en/` are auto-generated from JSDoc comments in the p5.js library source code, so don't edit them directly here; any change will be overwritten the next time the reference is generated. To fix or improve English reference content, make your changes in the p5.js library repository instead, see the [Contributing to the p5.js Reference guide](https://beta.p5js.org/contribute/contributing_to_the_p5js_reference/).

**Exception:** translation files such as `src/content/reference/es/` are stored directly in this repository and can be edited here.

### Code Changes

For making code changes, check out the [technical overview](./docs/technical_overview.md) to get started.

### Adding Libraries

Follow the steps in the [Contributing Libraries](./docs/contributing_libraries.md) doc if you'd like to add your library to the collection.

### Get Assigned Before Working on an Issue

Please read the [contributor guidelines](https://p5js.org/contribute/contributor_guidelines/) before contributing, the rule below is the website-repo-specific version of the same policy.

When an issue is first created, it may be labeled "Awaiting Maintainer Approval," meaning it's still being reviewed by maintainers and isn't yet ready for work. Please don't start work on these. Once reviewed and approved, it's relabeled "Help wanted", only issues with this label should be requested for assignment. Once a contributor is set as "Assignee," they can start.

> ⚠️ **If you file a PR for an issue that hasn't been approved for contribution, or while someone else is already working on it, your PR may be closed.**

When working on multiple issues, create a separate branch for each one, so each PR only contains the files related to that specific issue. A PR opened from a branch that mixes work from multiple issues is difficult to review and merge cleanly.

### Opening a Pull Request

When you're ready to open a PR, keep the following in mind:

- Link the issue your PR fixes using "Fixes #" followed by the issue number, in your PR description.
- Only include files related to the issue you're working on.
- Don't include `package-lock.json` unless your PR is specifically about updating dependencies.
- Test your changes locally before opening a PR.
- Test against the correct branch: `main`, `2.0`, or both, depending on the issue.

## Add Yourself to p5.js Contributors

We recognize all types of contributions. This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification.

If you've contributed to this website (or any other part of the p5.js project), add yourself to the [p5.js repository readme](https://github.com/processing/p5.js/blob/main/README.md#contributors), instructions for doing this are linked from [this issue](https://github.com/processing/p5.js/issues/2309), and also live at the bottom of the contributors section in that readme.

[**⬆ back to top**](#p5js-website)
