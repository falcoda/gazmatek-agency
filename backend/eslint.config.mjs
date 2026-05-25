import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      // Build/infra scripts are plain CommonJS, not application code.
      "scripts/**",
      // Embedded library submodule — managed in its own repo, never lint it.
      "src/covaltech-tsnode-backend/**",
      // pgtyped generated artifacts — never lint or auto-fix these (Rule 0)
      "src/db/query/**/*.types.ts",
    ],
  },
  js.configs.recommended,
  {
    // Plain JS/CJS files (config files, scripts) run on Node.
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "unused-imports/no-unused-imports": "error",
      "object-curly-spacing": ["error", "always"],
      "linebreak-style": ["error", "windows"],
      semi: ["error", "always"],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  prettierRecommended,
  {
    files: ["**/*.ts"],
    rules: {
      // endOfLine "auto" avoids false CRLF/LF diffs: ESLint normalises line
      // endings to LF before handing source to the prettier rule.
      "prettier/prettier": ["error", { endOfLine: "auto", useTabs: false }],
    },
  },
  {
    // Test files legitimately rely on `any` mocks and dynamic require()
    // (e.g. re-requiring modules after jest.resetModules()).
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
