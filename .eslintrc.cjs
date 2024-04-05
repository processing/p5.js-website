module.exports = {
  ignorePatterns: [
    "src/content/contributor-docs/*/**.js",
    "src/scripts/parsers/in/**/*",
    "src/scripts/parsers/out/**/*",
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "preact", "prettier"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      extends: ["plugin:@typescript-eslint/recommended"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "react/no-danger": "off",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "jest/no-deprecated-functions": 0,
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
