/* Defines the structure for the larger p5 project information */
export interface Project {
  name: string;
  description: string;
  url: string;
  version: string;
}

/* Detailed information about a file within within project */
export interface FileDetail {
  name: string;
  modules: Record<string, boolean>;
  classes: Record<string, boolean>;
  fors: Record<string, number>;
  namespaces: Record<string, unknown>;
}

/* Describes a module within the project */
export interface Module {
  name: string; // The name of the module.
  submodules: Record<string, Module>; // Nested modules within this module.
  classes: Record<string, boolean>; // A record of classes in the module.
  namespaces: Record<string, unknown>; // Namespaces declared within the module.
  module: string; // The parent module name.
  file: string; // The file where the module is defined.
  line: number; // The line number where the module definition starts.
  description: string; // A description of the module.
  tag?: string; // An optional tag for additional categorization.
  requires?: string[]; // Optional array of module dependencies.
}

/* A mapping of module names to their corresponding Module definition */
export interface Modules {
  [moduleName: string]: Module;
}

/* Describes a parameter for methods or constructors */
export interface ReferenceParam {
  name: string; // The parameter name.
  description: string; // A description of the parameter.
  type: string; // The data type of the parameter.
  optional?: boolean; // Indicates if the parameter is optional.
}

/* Represents the definition of a class within the project, including its properties, methods, and inheritance information. */
export interface ReferenceClassDefinition extends Chainable {
  name: string; // The name of the class.
  shortname: string; // A shorter or abbreviated name for the class.
  classitems: ReferenceParam[]; // Parameters or properties of the class.
  plugins: string[]; // Plugins associated with the class.
  extensions: string[]; // Extensions of the class.
  plugin_for: string[]; // Classes that this class is a plugin for.
  extension_for: string[]; // Classes that this class extends.
  module: string; // The module that includes this class.
  submodule: string; // The submodule containing this class.
  namespace: string; // The namespace of the class.
  file?: string; // Optional file where the class is defined.
  line?: number; // Optional line number where the class definition starts.
  description: string; // A description of the class.
  is_constructor?: boolean; // Indicates if this class is a constructor.
  params?: ReferenceParam[]; // Constructor parameters, if applicable.
  example?: string[]; // Example usage of the class.
}

/* A collection of ReferenceClassDefinition, indexed by class name */
export interface ReferenceClass {
  [className: string]: ReferenceClassDefinition;
}

/* Base properties shared by both method and property items within a class */
interface BaseClassItem {
  file: string; // The file where the item is defined.
  line: number; // The line number where the item definition starts.
  class: string; // The class name to which the item belongs.
  description?: string; // Optional description of the item.
  itemtype: "method" | "property"; // Specifies whether the item is a method or a property.
  name: string; // The name of the item.
  module: string; // The module containing this item.
  submodule: string; // The submodule containing this item.
  alt?: string; // Alt text for the example
  example?: string[]; // Examples of the item's usage.
}

/* Describes whether a method or constructor is chainable */
interface Chainable {
  chainable: number;
}

/* Represents the return value of a method or constructor */
interface Return {
  description: string;
  type: string;
}

/* Represents a method within a class */
export interface ReferenceClassItemMethod extends BaseClassItem, Chainable {
  params?: ReferenceParam[];
  return?: Return;
  example?: string[];
  overloads?: MethodOverload[]; // Optional array of method overloads.
}

/* Describes the parameters and return value of a method overload */
interface MethodOverload {
  line: number;
  params?: ReferenceParam[];
  return?: Return;
  chainable?: number;
}

/* Represents a property within a class */
export interface ReferenceClassItemProperty extends BaseClassItem {
  type: string;
}

/* A union type representing either a method or a property within a class */
export type ReferenceClassItem =
  | ReferenceClassItemMethod
  | ReferenceClassItemProperty;

/* Global constants defined within the project */
export interface ParsedConsts {
  [key: string]: string[];
}

/* The parsed output of the YUIDoc JSON file */
export interface ParsedLibraryReference {
  project: Project;
  files: Record<string, FileDetail>;
  modules: Modules;
  classes: ReferenceClass;
  classitems: ReferenceClassItem[];
  consts: ParsedConsts;
}
