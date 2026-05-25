import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "src/covaltech-react-ui/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "simple-import-sort": simpleImportSort,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...tsPlugin.configs["eslint-recommended"].overrides[0].rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "object-curly-spacing": ["error", "always"],
      semi: ["error", "always"],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
  prettierRecommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto", useTabs: false }],
    },
  },
];
