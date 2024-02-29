import fs from "fs/promises";
import matter from "gray-matter";
import { remark } from "remark";
import remarkMDX from "remark-mdx";
import { parseLibrary } from "../parsers/reference";
import type {
  LibraryReferenceClassDefinition,
  LibraryReferenceClassItem,
  LibraryReferenceMethodClassItem,
  LibraryReferenceProperyClassItem,
} from "../../../types/parsers.interface";
import type {
  ReferenceClassMethodPreviews,
  ReferenceMDXDoc,
  ReferenceModulePathTree,
} from "../../../types/builders.interface";

const prefix = "./src/content/reference/en/";
const memberMethodPreviews: ReferenceClassMethodPreviews = {};
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

  let docClass: string;
  if ("class" in doc && doc.class) {
    docClass = doc.class;
  } else {
    docClass = doc.module.startsWith("p5.") ? doc.module : "p5";
  }

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
    const treePath = "modules";
    const subPath = doc.module;

    if (!modulePathTree[treePath][subPath])
      modulePathTree[treePath][subPath] = {};
    modulePathTree[treePath][subPath][doc.name] = modulePath;
  }
};

function isClassDefinition(
  doc: LibraryReferenceClassDefinition | LibraryReferenceClassItem,
): doc is LibraryReferenceClassDefinition {
  return doc && "is_constructor" in doc;
}

function isMethodClassItem(
  doc: LibraryReferenceClassDefinition | LibraryReferenceClassItem,
): doc is LibraryReferenceMethodClassItem {
  return doc && "itemtype" in doc && doc.itemtype === "method";
}

function isPropertyClassItem(
  doc: LibraryReferenceClassDefinition | LibraryReferenceClassItem,
): doc is LibraryReferenceProperyClassItem {
  return doc && "itemtype" in doc && doc.itemtype === "method";
}

const convertToMDX = async (
  doc: LibraryReferenceClassDefinition | LibraryReferenceClassItem,
) => {
  if (!doc || !doc.name || !doc.file) return;

  const sanitizeName = (name: string) =>
    name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let frontMatterArgs = {
    title: sanitizeName(doc.name),
    module: doc.module,
    submodule: doc.submodule ?? "",
    file: doc.file.replace(/.*p5\.js\/(.*)/, "$1"),
    description: doc.description ?? "",
    line: doc.line,
    ...memberMethodPreviews[doc.name],
  };

  if (isMethodClassItem(doc)) {
    frontMatterArgs = {
      ...frontMatterArgs,
      ...getMethodFrontmatter(doc),
      ...getClassItemFrontmatter(doc),
    };
    addClassMethodPreviewsToClassDocs(doc);
  } else if (isPropertyClassItem(doc)) {
    frontMatterArgs = {
      ...frontMatterArgs,
      ...getPropertyFrontmatter(doc),
      ...getClassItemFrontmatter(doc),
    };
  } else if (isClassDefinition(doc)) {
    frontMatterArgs = {
      ...frontMatterArgs,
      ...getClassFrontmatter(doc),
    };
  }

  // Filter out undefined values
  frontMatterArgs = Object.entries(frontMatterArgs).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    },
    {} as Record<string, unknown>,
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

const getMethodFrontmatter = (doc: LibraryReferenceMethodClassItem) => {
  const { params, return: returns, example, overloads, itemtype } = doc;
  return {
    params,
    return: returns,
    example,
    overloads,
    itemtype,
    chainable: doc.chainable === 1,
  };
};

const getClassItemFrontmatter = (doc: LibraryReferenceClassItem) => {
  const { itemtype, alt } = doc;
  return {
    itemtype,
    alt,
    class: doc.class,
  };
};

const getPropertyFrontmatter = (doc: LibraryReferenceProperyClassItem) => {
  const { type, itemtype, alt } = doc;
  return {
    type,
    itemtype,
    alt,
  };
};

const getClassFrontmatter = (doc: LibraryReferenceClassDefinition) => {
  const { description, module, submodule, params, example } = doc;
  return {
    description,
    isConstructor: true,
    module,
    submodule,
    params,
    example,
    ...memberMethodPreviews[doc.name],
    chainable: doc.chainable === 1,
  };
};

const addClassMethodPreviewsToClassDocs = (
  doc: LibraryReferenceMethodClassItem,
) => {
  if (!memberMethodPreviews[doc.class]) {
    memberMethodPreviews[doc.class] = {};
  }
  const classMethodPath = `../${modulePathTree.classes[doc.class][doc.name]}`;
  memberMethodPreviews[doc.class][doc.name] = {
    description: doc.description,
    path: classMethodPath,
  };
};

const convertDocsToMDX = async (
  docs: LibraryReferenceClassDefinition[] | LibraryReferenceClassItem[],
): Promise<ReferenceMDXDoc[] | []> => {
  try {
    return (
      await Promise.all(
        docs.map(async (doc) => {
          const mdx = await convertToMDX(doc);

          const savePath = getModulePath(doc);
          if (!savePath) {
            console.warn(
              `No save path can be generated for ${doc.file} at line${doc.line}!`,
            );
            return;
          }

          addDocToModulePathTree(doc, savePath);
          return mdx ? { mdx, savePath, name: doc.name } : null;
        }),
      )
    ).filter(Boolean) as ReferenceMDXDoc[];
  } catch (err) {
    console.error(`Error converting docs to MDX: ${err}`);
    return [];
  }
};

const saveMDX = async (mdxDocs: ReferenceMDXDoc[]) => {
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
