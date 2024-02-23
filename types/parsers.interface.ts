export interface Project {
  name: string;
  description: string;
  url: string;
  version: string;
}

export interface FileDetail {
  name: string;
  modules: Record<string, boolean>;
  classes: Record<string, boolean>;
  fors: Record<string, number>;
  namespaces: Record<string, unknown>;
}

export interface Module {
  name: string;
  submodules: Record<string, Module>;
  classes: Record<string, boolean>;
  fors: Record<string, boolean>;
  namespaces: Record<string, unknown>;
  module: string;
  file: string;
  line: number;
  description: string;
  tag?: string;
  itemtype?: string;
  requires?: string[];
}

export interface Modules {
  [moduleName: string]: Module;
}

interface Param {
  name: string;
  description: string;
  type: string;
  optional?: boolean;
}

interface ClassDefinition {
  name: string;
  shortname: string;
  classitems: Param[];
  plugins: string[];
  extensions: string[];
  plugin_for: string[];
  extension_for: string[];
  module: string;
  submodule: string;
  namespace: string;
  file?: string;
  line?: number;
  description: string;
  is_constructor?: boolean;
  params?: Param[];
  example?: string[];
}

export interface Classes {
  [className: string]: ClassDefinition;
}

interface BaseClassItem {
  file: string;
  line: number;
  class: string;
  description?: string;
  itemtype: "method" | "property";
  name: string;
  module: string;
  submodule: string;
}

interface Chainable {
  chainable: number;
}

interface Param {
  name: string;
  description: string;
  type: string;
  optional?: boolean;
}

interface Return {
  description: string;
  type: string;
}

interface MethodClassItem extends BaseClassItem, Chainable {
  params?: Param[];
  return?: Return;
  example?: string[];
  overloads?: MethodOverload[];
}

interface MethodOverload {
  line: number;
  params?: Param[];
  return?: Return;
  chainable?: number;
}

export interface PropertyClassItem extends BaseClassItem {
  type: string;
}

export type ClassItem = MethodClassItem | PropertyClassItem;

export interface ParsedConsts {
  [key: string]: string[];
}

export interface ParsedLibraryReference {
  project: Project;
  files: Record<string, FileDetail>;
  modules: Modules;
  classes: Classes;
  classitems: ClassItem[];
  consts: ParsedConsts;
}
