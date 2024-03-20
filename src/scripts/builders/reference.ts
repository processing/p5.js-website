import fs from "fs/promises";
import matter from "gray-matter";
import { remark } from "remark";
import remarkMDX from "remark-mdx";
import { parseLibraryReference } from "../parsers/reference";
import type {
  ReferenceClassDefinition,
  ReferenceClassItem,
  ReferenceClassItemMethod,
  ReferenceClassItemProperty,
} from "../../../types/parsers.interface";
import type {
  ReferenceClassMethodPreviews,
  ReferenceMDXDoc,
  ReferenceModulePathTree,
} from "../../../types/builders.interface";
import { sanitizeName } from "../utils";
import path from "path";

/* Base path for the content directory */
const prefix = "./src/content/reference/en/";

/* Object to store class method previews, for transfer from the method records to the class records */
const memberMethodPreviews: ReferenceClassMethodPreviews = {};

/* Object to store the module path tree, needed for indicating relationships between records */
const modulePathTree = {
  modules: {},
  classes: {},
} as ReferenceModulePathTree;

/* Main function to build the reference docs, runs automatically with Node execution */
export const buildReference = async () => {
  // Gets the JSON output from parsing
  const parsedOutput = await parseLibraryReference();
  if (!parsedOutput) {
    console.error("Unable to build reference docs to error in parsing!");
    return;
  }
  const mdxDocs = [
    ...(await convertDocsToMDX(Object.values(parsedOutput.classitems))),
    ...(await convertDocsToMDX(Object.values(parsedOutput.classes))),
  ];
  // Save the MDX files to the file system
  await saveMDX(mdxDocs);
  console.log("Done building reference docs!");
};

/* Determines the path to save the MDX file based on the module */
const getModulePath = (doc: ReferenceClassDefinition | ReferenceClassItem) => {
  if (!doc || !doc.name) return;

  let docClass: string;
  if ("class" in doc && doc.class) {
    docClass = doc.class;
  } else {
    docClass = doc.module.startsWith("p5.") ? doc.module : "p5";
  }

  return path.join(prefix, docClass);
};

/* Adds the doc to the module path tree */
const addDocToModulePathTree = (
  doc: ReferenceClassDefinition | ReferenceClassItem,
  savePath: string,
) => {
  if (!doc || !doc.name || !savePath) return;

  // Remove prefix from path
  const itemPath = `${savePath.replace("src/content/reference/en/", "")}/${doc.name}`;

  // Use a type guard to check if the 'doc' is a LibraryReferenceClassItem.
  // This check allows us to handle class items differently from class definitions.
  if ("class" in doc && doc.class !== "p5") {
    // Determine the treePath, which decides whether the doc belongs to the 'classes'
    // or 'modules' category based on its 'class' property. If the class is not 'p5',
    // it's categorized under 'classes'; otherwise, it falls under 'modules'.
    const treePath = "classes";
    // The subPath is constructed based on the module and submodule information.
    // If a submodule exists, it's appended to the module name; otherwise, just the module name is used.
    const subPath = doc.class;

    // If the treePath doesn't exist, initialize it.
    if (!modulePathTree[treePath][subPath]) {
      modulePathTree[treePath][subPath] = {};
    }
    // Add the doc to the modulePathTree under the appropriate treePath and subPath,
    // using the doc's name as the key and the constructed modulePath as the value.
    modulePathTree[treePath][subPath][doc.name] = itemPath;
  } else {
    // If the doc is not a class item, it's handled here.
    // We default to adding it under the 'modules' category.
    const modulePath = doc.module;
    const subPath = doc.submodule;

    // Similar to above, initialize the subPath if needed.
    if (!modulePathTree.modules[modulePath]) {
      modulePathTree.modules[modulePath] = {};
    }

    // Fix relative routing
    doc.description = doc.description?.replaceAll("#/p5/", "./");

    // If a submodule exists, add the doc to the modulePathTree under the appropriate treePath,
    // modulePath, and subPath, using the doc's name as the key and the constructed modulePath as the value.
    if (subPath) {
      if (!modulePathTree.modules[modulePath][subPath]) {
        modulePathTree.modules[modulePath][subPath] = {} as Record<
          string,
          string
        >;
      }
      // Add the doc to the modulePathTree. We assert the type because we know that the subPath exists
      // as an object at this point but TypeScript can't infer that.
      (modulePathTree.modules[modulePath][subPath] as Record<string, string>)[
        doc.name
      ] = itemPath;
    } else {
      // Add the module to the modulePathTree.
      modulePathTree.modules[modulePath][doc.name] = itemPath;
    }
  }
};

/* Type guards to check the type of the doc */
function isClassDefinition(
  doc: ReferenceClassDefinition | ReferenceClassItem,
): doc is ReferenceClassDefinition {
  return doc && "is_constructor" in doc;
}

function isMethodClassItem(
  doc: ReferenceClassDefinition | ReferenceClassItem,
): doc is ReferenceClassItemMethod {
  return doc && "itemtype" in doc && doc.itemtype === "method";
}

function isPropertyClassItem(
  doc: ReferenceClassDefinition | ReferenceClassItem,
): doc is ReferenceClassItemProperty {
  return doc && "itemtype" in doc && doc.itemtype === "property";
}

/* Converts a single doc to MDX */
const convertToMDX = async (
  doc: ReferenceClassDefinition | ReferenceClassItem,
) => {
  if (!doc || !doc.name || !doc.file) return;

  let frontMatterArgs = {
    title: sanitizeName(doc.name),
    module: doc.module,
    submodule: doc.submodule ?? "",
    file: doc.file.replace(/.*p5\.js\/(.*)/, "$1"),
    description: doc.description ?? "",
    line: doc.line,
  } as Record<string, unknown>;

  // Add specific frontmatter based on the type of doc
  if (isMethodClassItem(doc)) {
    frontMatterArgs = {
      ...frontMatterArgs,
      ...getClassItemFrontmatter(doc),
      ...getMethodFrontmatter(doc),
    };
    addMemberMethodPreviewsToClassDocs(doc);
  } else if (isPropertyClassItem(doc)) {
    frontMatterArgs = {
      ...frontMatterArgs,
      ...getClassItemFrontmatter(doc),
      ...getPropertyFrontmatter(doc),
    };
  } else if (isClassDefinition(doc)) {
    frontMatterArgs = {
      ...frontMatterArgs,
      ...getClassFrontmatter(doc),
    };
  }

  // Filter out undefined values as these will cause errors when stringifying the frontmatter
  frontMatterArgs = Object.entries(frontMatterArgs).reduce(
    (acc: Record<string, unknown>, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  );

  try {
    // Convert the frontmatter to a string
    const frontmatter = matter.stringify("", frontMatterArgs);
    // Stores the body of the MDX file
    const markdownContent = `# ${sanitizeName(doc.name)}\n`;
    // Convert the markdown content to MDX
    const mdxContent = remark().use(remarkMDX).processSync(markdownContent);
    // Return the full MDX file as a string
    return `${frontmatter}\n${mdxContent.toString()}`;
  } catch (err) {
    console.error(`Error converting ${doc.name} to MDX: ${err}`);
    return;
  }
};

const getMethodFrontmatter = (doc: ReferenceClassItemMethod) => {
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

const getClassItemFrontmatter = (doc: ReferenceClassItem) => {
  const { itemtype, alt, example } = doc;
  return {
    isConstructor: false,
    itemtype,
    alt,
    example,
    class: doc.class,
  };
};

const getPropertyFrontmatter = (doc: ReferenceClassItemProperty) => {
  const { type, itemtype, alt } = doc;
  return {
    type,
    itemtype,
    alt,
  };
};

const getClassFrontmatter = (doc: ReferenceClassDefinition) => {
  const { description, module, submodule, params, example } = doc;
  return {
    description,
    isConstructor: true,
    module,
    submodule,
    params,
    example,
    methods: { ...memberMethodPreviews[doc.name] },
    chainable: doc.chainable === 1,
  };
};

/* Adds description and path for member methods to the class docs */
const addMemberMethodPreviewsToClassDocs = (doc: ReferenceClassItemMethod) => {
  // Skip p5 methods which are "global" and not part of a class from the perspective of the reference
  if (doc.class === "p5") return;

  // If the class doesn't exist in the memberMethodPreviews object, initialize it
  if (!memberMethodPreviews[doc.class]) {
    memberMethodPreviews[doc.class] = {};
  }

  // If the method doesn't exist in the class, log a warning and skip it
  if (!modulePathTree.classes[doc.class]) {
    console.warn(`No class path found for ${doc.class} in modulePathTree`);
    return;
  }

  // Construct the path to the class method
  const classMethodPath = `${modulePathTree.classes[doc.class][doc.name]}`;

  // Add the method to the memberMethodPreviews object, this is used to add previews to the class docs
  memberMethodPreviews[doc.class][doc.name] = {
    description: doc.description,
    path: classMethodPath,
  };
};

/* Converts all docs to MDX */
const convertDocsToMDX = async (
  docs: ReferenceClassDefinition[] | ReferenceClassItem[],
): Promise<ReferenceMDXDoc[] | []> => {
  try {
    return (
      await Promise.all(
        docs.map(async (doc) => {
          const savePath = getModulePath(doc);
          // If the savePath is undefined, the doc is skipped
          // This will often happen with inline comments that don't define necessary properties
          if (!savePath) {
            return;
          }
          addDocToModulePathTree(doc, savePath);
          const mdx = await convertToMDX(doc);

          return mdx ? { mdx, savePath, name: doc.name } : null;
        }),
      )
    ).filter(Boolean) as ReferenceMDXDoc[];
  } catch (err) {
    console.error(`Error converting docs to MDX: ${err}`);
    return [];
  }
};

/* Saves the MDX files to the file system */
const saveMDX = async (mdxDocs: ReferenceMDXDoc[]) => {
  if (!mdxDocs || mdxDocs.length === 0) return;
  console.log("Saving MDX...");
  for (const { mdx, savePath, name } of mdxDocs) {
    try {
      let fileName = sanitizeName(name);
      // TODO: Place elsewhere
      if (fileName[0] === "&") {
        // Need special cases for >, >=, <, <=, and ===
        if (fileName === "&gt;") {
          fileName = "gt";
        } else if (fileName === "&gt;=") {
          fileName = "gte";
        } else if (fileName === "&lt;") {
          fileName = "lt";
        } else if (fileName === "&lt;=") {
          fileName = "lte";
        } else if (fileName === "&equals;") {
          fileName = "equals";
        }
      }
      await fs.mkdir(savePath, { recursive: true });
      await fs.writeFile(`${savePath}/${fileName}.mdx`, mdx.toString());
    } catch (err) {
      console.error(`Error saving MDX: ${err}`);
    }
  }
};

buildReference();

export const testingExports = {
  modulePathTree,
  memberMethodPreviews,
  addDocToModulePathTree,
  addMemberMethodPreviewsToClassDocs,
};
