import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: ["**/*.gen.ts", "dist", ".agents/**"],
  categories: {
    correctness: "allow",
  },
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
