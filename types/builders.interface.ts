/**
 * @description interface for a single reference doc
 * @interface ReferenceMDXDoc
 * @property {string} mdx - the mdx content
 * @property {string} name - the name of the doc
 * @property {string} savePath - the path to save the mdx file
 */
export interface ReferenceMDXDoc {
  mdx: string;
  name: string;
  savePath: string;
}

/**
 * @description ModulePathTree is used to structure the export of the reference docs
 * @interface ModulePathTree
 */
export interface ReferenceModulePathTree {
  /* Each class stores key-value pairs that map the name of the specific reference doc to a path */
  classes: {
    [className: string]: {
      [docName: string]: string;
    };
  };
  /* Each module stores key-value pairs that map the name of the specific reference doc to a path OR a submodule */
  modules: {
    [moduleName: string]: {
      [submoduleNameOrDocName: string]:
        | string
        | {
            [docName: string]: string;
          };
    };
  };
}

interface ClassMethodPreview {
  description?: string;
  path: string;
}

export interface ReferenceClassMethodPreviews {
  [className: string]: {
    [methodName: string]: ClassMethodPreview;
  };
}
