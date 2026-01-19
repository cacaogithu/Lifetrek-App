import { defineConfig } from "@playwright/test";
import { baseConfig } from "./base.config";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

if (!baseURL) {
  throw new Error("PLAYWRIGHT_BASE_URL is required for staging tests.");
}

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL,
    ignoreHTTPSErrors: true
  }
});
