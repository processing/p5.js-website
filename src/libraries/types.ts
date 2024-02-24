export type LanguageKey = 'en' | 'es' | 'hi' | 'ko' | 'zh-Hans';

/**
 * An object containing language keys and different translations for each value.
 * The English version is required. Other language translations are optional
 * but encouraged.
 */
export type TranslatedString =
  & { en: string; }
  & Partial<{ [key in LanguageKey]: string }>;

export type Library = {
  /** The name of the library */
  name: string;

  /** One sentence description of the library */
  description: TranslatedString

  /** The name(s) of the authors */
  author: string;

  /** [Optional] Link to author's website */
  authorLink?: string

  /** Link to the source code (e.g. on GitHub or GitLab) */
  source: string;

  /** [Optional] Link to a website for the library */
  website?: string;

  /**
   * [Optional] Package info on npm. Either just the package name, or an object
   * with the package name and path to the JavaScript file from the package to
   * include to use the library. This is used to generate a CDN script tag
   * automatically for easy inclusion of the library, and grab license info.
   */
  npm?: string | {
    package: string;
    path?: string;
  };

  /** Preview thumbnail information */
  img: {
    /** The name of the file in the `img/` directory, at 1500x1000 */
    file: string;

    /** A short description of the contents of the image for screen readers */
    alt: TranslatedString;
  };

  /**
   * [Optional] License information about the library, in the format used by
   * package.json files: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#license
   * This may be omitted if your package is on npm and has license info there.
   */
  license?: string;
};

export type LibraryCategory = {
  name: TranslatedString;
  libraries: Array<Library>;
}
export type Libraries = { categories: Array<LibraryCategory> };
