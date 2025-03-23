import { beforeEach, describe, expect, test } from "vitest";
import { testingExports } from "../../src/scripts/builders/reference";

const {
  addDocToModulePathTree,
  modulePathTree,
  addMemberMethodPreviewsToClassDocs,
  memberMethodPreviews,
} = testingExports;

const defaultDoc = {
  name: "exampleMethod",
  class: "ExampleClass",
  module: "TestModule",
  file: "path/to/file",
  line: 1,
  type: "method",
  itemtype: "method" as "method" | "property",
  submodule: "",
  description: "example description",
  chainable: 1,
};
let doc = { ...defaultDoc };
const path = "expected/path/to";

describe("modulePathTree", () => {
  beforeEach(() => {
    modulePathTree.modules = {};
    modulePathTree.classes = {};
    doc = { ...defaultDoc };
  });

  test("should add a class item correctly", () => {
    const expectedPath = `${path}/exampleClass`;
    doc.name = "exampleClass";
    addDocToModulePathTree(doc, path);
    expect(modulePathTree.classes["ExampleClass"]["exampleClass"]).toBe(
      expectedPath,
    );
  });

  test("should add a global item correctly", () => {
    const expectedPath = `${path}/exampleMethod`;
    doc.class = "p5";
    addDocToModulePathTree(doc, path);
    expect(modulePathTree.modules["TestModule"]["exampleMethod"]).toBe(
      expectedPath,
    );
  });

  test("should add a submodule item correctly", () => {
    const expectedPath = `${path}/exampleMethod`;
    doc.submodule = "TestSubmodule";
    doc.class = "p5";
    addDocToModulePathTree(doc, path);
    expect(
      (
        modulePathTree.modules["TestModule"]["TestSubmodule"] as Record<
          string,
          string
        >
      )["exampleMethod"],
    ).toBe(expectedPath);
  });
});

describe("modulePathTree with method previews", () => {
  beforeEach(() => {
    modulePathTree.modules = {};
    modulePathTree.classes = {};
    doc = { ...defaultDoc };
  });

  test("should add a method preview correctly", () => {
    doc.class = "p5.TestClass";
    doc.name = "exampleClassMethod";
    doc.itemtype = "method";
    doc.description = "test method description";
    const expectedPath = `${path}/exampleClassMethod`;
    addDocToModulePathTree(doc, path);
    addMemberMethodPreviewsToClassDocs(doc);
    expect(
      memberMethodPreviews["p5.TestClass"].methods?.["exampleClassMethod"]
        .description,
    ).toBe("test method description");
    expect(
      memberMethodPreviews["p5.TestClass"].methods?.["exampleClassMethod"].path,
    ).toBe(expectedPath);
  });

  test("should add a property preview correctly", () => {
    doc.class = "p5.TestClass";
    doc.name = "exampleClassProperty";
    doc.itemtype = "property";
    doc.description = "test property description";
    const expectedPath = `${path}/exampleClassProperty`;
    addDocToModulePathTree(doc, path);
    addMemberMethodPreviewsToClassDocs(doc);
    expect(
      memberMethodPreviews["p5.TestClass"].properties?.["exampleClassProperty"]
        .description,
    ).toBe("test property description");
    expect(
      memberMethodPreviews["p5.TestClass"].properties?.["exampleClassProperty"]
        .path,
    ).toBe(expectedPath);
  });
});
