import fs from "fs/promises";
import matter from "gray-matter";
import { remark } from "remark";
import remarkMDX from "remark-mdx";
import { parseLibrary } from "../parsers/reference";
import type {
  LibraryReferenceClassDefinition,
  LibraryReferenceClassItem,
} from "../../../types/parsers.interface";
import type { ReferenceModulePathTree } from "../../../types/builders.interface";

const prefix = "./src/content/reference/en/";
const classMethodPreviews = {};
const modulePathTree = { modules: {}, classes: {} } as ReferenceModulePathTree;

export const buildReference = async () => {
  const parsedOutput = await parseLibrary();
  if (!parsedOutput) {
    console.error("Unable to build reference docs to error in parsing!");
    return;
  }
  const mdxDocs = [
    ...(await convertDocsToMDX(Object.values(parsedOutput.classitems))),
    ...(await convertDocsToMDX(Object.values(parsedOutput.classes))),
  ];
  await saveMDX(mdxDocs);
  console.log("Done building reference docs!");
};

const getModulePath = (
  doc: LibraryReferenceClassDefinition | LibraryReferenceClassItem,
) => {
  if (!doc || !doc.name) return;
  const docClass =
    doc.class || (doc.module.startsWith("p5.") ? doc.module : "p5");
  return `${prefix}/${docClass}/`;
};

const addDocToModulePathTree = (
  doc: LibraryReferenceClassDefinition | LibraryReferenceClassItem,
  path: string,
) => {
  if (!doc || !doc.name || !path) return;

  const modulePath = `${path.replace("./src/pages/en/reference/", "")}${doc.name}`;

  // Type guard to check if 'doc' is LibraryReferenceClassItem
  if ("class" in doc) {
    const treePath = doc.class && doc.class !== "p5" ? "classes" : "modules";
    const subPath = doc.submodule
      ? `${doc.module}.${doc.submodule}`
      : doc.module;

    if (!modulePathTree[treePath][subPath])
      modulePathTree[treePath][subPath] = {};
    modulePathTree[treePath][subPath][doc.name] = modulePath;
  } else {
    // Handle the case for LibraryReferenceClassDefinition or add an else if branch for other types, if necessary
    // For example, assuming LibraryReferenceClassDefinition always goes into "modules"
    const treePath = "modules";
    const subPath = doc.module; // Assuming 'module' exists on LibraryReferenceClassDefinition

    if (!modulePathTree[treePath][subPath])
      modulePathTree[treePath][subPath] = {};
    modulePathTree[treePath][subPath][doc.name] = modulePath;
  }
};

const convertToMDX = async (doc) => {
  if (!doc || !doc.name || !doc.file) return;

  const sanitizeName = (name) =>
    name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let frontMatterArgs = {
    title: sanitizeName(doc.name),
    module: doc.module,
    submodule: doc.submodule ?? "",
    file: doc.file.replace(/.*p5\.js\/(.*)/, "$1"),
    description: doc.description ?? "",
    isConstructor: !!doc.is_constructor,
    line: doc.line,
    params: doc.params,
    itemtype: doc.itemtype,
    examples: doc.examples,
    alt: doc.alt,
    class: doc.class,
    example: doc.example,
    return: doc.return,
    chainable: doc.chainable === 1,
    ...classMethodPreviews[doc.name],
  };

  // Filter out undefined values
  frontMatterArgs = Object.entries(frontMatterArgs).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    },
    {},
  );

  try {
    const frontmatter = matter.stringify("", frontMatterArgs);
    const markdownContent = `# ${sanitizeName(doc.name)}\n`;
    const mdxContent = remark().use(remarkMDX).processSync(markdownContent);
    return `${frontmatter}\n${mdxContent.toString()}`;
  } catch (err) {
    console.error(`Error converting ${doc.name} to MDX: ${err}`);
    return;
  }
};

const convertDocsToMDX = async (
  docs: LibraryReferenceClassDefinition[] | LibraryReferenceClassItem[],
) => {
  try {
    return (
      await Promise.all(
        docs.map(async (doc) => {
          const mdx = await convertToMDX(doc);

          const savePath = getModulePath(doc);
          if (!savePath) {
            console.error(`Error getting save path for ${doc.name}`);
            return;
          }

          addDocToModulePathTree(doc, savePath);
          return mdx ? { mdx, savePath, name: doc.name } : null;
        }),
      )
    ).filter(Boolean);
  } catch (err) {
    console.error(`Error converting docs to MDX: ${err}`);
    return [];
  }
};

const saveMDX = async (mdxDocs) => {
  console.log("Saving MDX...");
  for (const { mdx, savePath, name } of mdxDocs) {
    try {
      await fs.mkdir(savePath, { recursive: true });
      await fs.writeFile(`${savePath}/${name}.mdx`, mdx.toString());
    } catch (err) {
      console.error(`Error saving MDX: ${err}`);
    }
  }
};

buildReference();
