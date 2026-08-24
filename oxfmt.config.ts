import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: [
    ".zed/**",
    ".agents/**",
    "skills-lock.json",
    "pnpm-workspace.yaml",
  ],
  sortTailwindcss: {
    functions: ["cn", "cva", "clsx"],
  },
  printWidth: 80,
  sortPackageJson: { sortScripts: true },
  sortImports: {
    newlinesBetween: false,
  },
  jsdoc: {
    lineWrappingStyle: "balance",
    keepUnparsableExampleIndent: true,
  },
});
