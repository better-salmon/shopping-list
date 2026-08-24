import solid from "@solidjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid({ start: true }), tailwindcss()],
  server: {
    port: 3000,
  },
  test: {
    globals: false,
    // Tests run in a real Chromium page instead of a simulated jsdom
    // document. `vitest --ui` (or headless: false) opens it visibly.
    browser: {
      enabled: true,
      provider: playwright(), // or 'webdriverio'
      headless: true,
      // at least one instance is required
      instances: [{ browser: "chromium" }],
    },
  },
  build: {
    target: "esnext",
    // Keep images as asset files instead of inlining them into the JS bundle.
    assetsInlineLimit: 0,
  },
});
