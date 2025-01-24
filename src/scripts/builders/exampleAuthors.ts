import dotenv from "dotenv";
import fs from "fs";
import { Octokit } from "octokit";
import path from "path";

export type AuthorData = {
  name: string;
  url: string;
  login: string;
};

const examplesPath = "src/content/examples/en";
const currentOwner = "calebfoss";
const currentRepo = "p5.js-website";
const currentBranch = "main";

const legacyOwner = "processing";
const legacyRepo = "p5.js-website-legacy";

const perPage = 100;

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_API_TOKEN });

const cachedCommitData = new Map<
  string,
  {
    sha: string;
    filename: string;
    status:
      | "added"
      | "removed"
      | "modified"
      | "renamed"
      | "copied"
      | "changed"
      | "unchanged";
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string;
    previous_filename?: string;
  }[][]
>();

const cachedUserData = new Map<
  number,
  { name: string | null; login: string; url: string }
>();

async function buildAuthorData() {
  const categories = fs.readdirSync(examplesPath);

  const authorEntries = await Promise.all(
    categories.map(async (category) => {
      const authors = await getAuthorDataInCategory(category);
      return [category, authors] as const;
    }),
  );

  return Object.fromEntries(authorEntries);
}

async function getAuthorDataInCategory(category: string) {
  // Ignore More directory
  const exampleNames = fs
    .readdirSync(path.join(examplesPath, category))
    .filter((name) => name !== "More");

  const authorEntries = await Promise.all(
    exampleNames.map(async (exampleName) => {
      const authors = await getAuthorDataForExample(category, exampleName);
      return [exampleName, authors] as const;
    }),
  );

  return Object.fromEntries(authorEntries);
}

async function getAuthorDataForExample(category: string, exampleName: string) {
  const filePath = `${examplesPath}/${category}/${exampleName}/code.js`;

  const commits = await getCommitsForFile(
    currentRepo,
    currentOwner,
    currentBranch,
    filePath,
  );

  const authors = commits
    .toReversed()
    .reduce<
      Exclude<
        | (typeof commits)[number]["author"]
        | ((typeof commits)[number]["commit"]["author"] & { id: number }),
        null
      >[]
    >((incompleteAuthors, commit) => {
      const { author } = commit;

      if (author === null) {
        const subcommitAuthor = commit.commit.author;

        if (subcommitAuthor === null) return incompleteAuthors;

        if (
          incompleteAuthors.some((other) => other.name === subcommitAuthor.name)
        )
          return incompleteAuthors;

        return incompleteAuthors.concat({ ...subcommitAuthor, id: -1 });
      }
      if (incompleteAuthors.some((other) => other.id === author.id))
        return incompleteAuthors;

      return incompleteAuthors.concat(author);
    }, []);

  const authorUserData = await Promise.all(
    authors.map((author) =>
      author.id === -1
        ? { name: author.name ?? "", login: "", url: "" }
        : idToUserData(author.id),
    ),
  );

  console.log(
    `${category}/${exampleName}: ${authorUserData.map((author) => author.name ?? author.login).join(", ")}`,
  );

  return authorUserData;
}

async function getCommitsForFile(
  repo: string,
  owner: string,
  branchSha: string,
  filePath: string,
  until = "2099-12-31",
  page = 1,
) {
  const response = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner,
    repo,
    sha: branchSha,
    path: filePath,
    per_page: perPage,
    page,
    until,
  });

  const commits = (
    response.data.length === perPage
      ? response.data.concat(
          await getCommitsForFile(
            repo,
            owner,
            branchSha,
            filePath,
            until,
            page + 1,
          ),
        )
      : response.data
  ) as (typeof response)["data"];

  if (commits.length === 0) return commits;

  const firstCommit = commits[commits.length - 1];

  const commitsBeforeRenamed = (await getCommitsBeforeRenamed(
    repo,
    owner,
    branchSha,
    filePath,
    firstCommit.sha,
    firstCommit.commit.author?.date,
  )) as (typeof response)["data"];

  return commits.concat(...commitsBeforeRenamed);
}

async function getCommitsBeforeRenamed(
  repo: string,
  owner: string,
  branchSha: string,
  filePath: string,
  commitSha: string,
  until = "2099-12-31",
  page = 1,
) {
  const cachedData = cachedCommitData.get(commitSha);

  const queryForFiles = async () => {
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/commits/{ref}",
      {
        owner,
        repo,
        sha: branchSha,
        ref: commitSha,
        per_page: perPage,
        page,
        until,
      },
    );

    const queriedFiles = response.data.files ?? [];

    if (cachedData === undefined)
      cachedCommitData.set(commitSha, [queriedFiles]);
    else cachedData[page - 1] = queriedFiles;

    return queriedFiles;
  };

  const files =
    cachedData === undefined || cachedData.length < page
      ? await queryForFiles()
      : cachedData[page - 1];

  const targetFile = files.find((file) => file.filename === filePath);

  if (targetFile === undefined) {
    if (files.length === perPage)
      return await getCommitsBeforeRenamed(
        repo,
        owner,
        branchSha,
        filePath,
        commitSha,
        until,
        page + 1,
      );
    else
      throw new Error(`Could not find file ${filePath} in commit ${commitSha}`);
  }

  if (targetFile.status === "added" && repo === currentRepo) {
    const legacyFilePath = filePath.replace(
      "examples/",
      "src/data/examples/en/",
    );
    return getCommitsForFile(legacyRepo, legacyOwner, "main", legacyFilePath);
  }

  if (targetFile.previous_filename === undefined)
    return [] as Awaited<ReturnType<typeof getCommitsForFile>>;

  return await getCommitsForFile(
    repo,
    owner,
    branchSha,
    targetFile.previous_filename,
    until,
  );
}

async function idToUserData(id: number) {
  const cached = cachedUserData.get(id);

  if (cached !== undefined) return cached;

  const response = await octokit.request("GET /user/{account_id}", {
    account_id: id,
  });

  const { name, html_url, login } = response.data;

  const data: AuthorData = { login, name: name ?? "", url: html_url };

  cachedUserData.set(id, data);

  return data;
}

const authors = await buildAuthorData();

fs.writeFileSync("public/assets/exampleAuthors.json", JSON.stringify(authors), {
  encoding: "utf-8",
});
