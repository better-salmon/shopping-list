import { fileURLToPath, URL } from "node:url";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import deMorgan from "eslint-plugin-de-morgan";
import "eslint-plugin-only-warn";
import solidV2 from "eslint-plugin-solid/configs/v2";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";
import tseslint from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));
const scriptFiles = ["**/*.{js,mjs,cjs,ts,tsx}"];
const javaScriptFiles = ["**/*.{js,mjs,cjs}"];
const typeScriptFiles = ["**/*.{ts,tsx}"];
const testFiles = ["**/*.{test,spec}.{ts,tsx}"];

export default defineConfig([
  includeIgnoreFile(gitignorePath, { gitignoreResolution: true }),
  globalIgnores([".agents/", "**/*.gen.ts"], "Project ignores"),
  {
    files: scriptFiles,
    extends: [
      js.configs.recommended,
      unicorn.configs.recommended,
      deMorgan.configs.recommended,
    ],
    rules: {
      curly: "warn",
      eqeqeq: "warn",
      "no-shadow": "off",
      "func-names": "warn",
      "func-style": ["error", "declaration"],
      "unicorn/no-null": "off",
    },
  },
  {
    files: javaScriptFiles,
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      "unicorn/no-non-function-verb-prefix": "off",
    },
  },
  {
    files: typeScriptFiles,
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      solidV2,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "unicorn/no-non-function-verb-prefix": "error",
      "@typescript-eslint/dot-notation": [
        "error",
        { allowIndexSignaturePropertyAccess: true },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      "@typescript-eslint/no-invalid-void-type": [
        "warn",
        { allowInGenericTypeArguments: true },
      ],
    },
  },
  {
    files: testFiles,
    extends: [vitest.configs.all],
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/no-object-as-default-parameter": "off",
      "@typescript-eslint/max-params": [
        "error",
        { max: 4, countVoidThis: false },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "vitest/require-mock-type-parameters": "off",
      "vitest/no-hooks": "off",
    },
  },
]);
