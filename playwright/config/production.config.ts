import { defineConfig } from "@playwright/test";
import { baseConfig } from "./base.config";

const baseURL = process.env.PLAYWRIGHT_BASE_URL;
const isProduction = process.env.TEST_ENV === "production";

if (isProduction && !baseURL) {
  throw new Error("PLAYWRIGHT_BASE_URL is required for production tests.");
}

export default defineConfig({
  ...baseConfig,
  retries: 3,
  use: {
    ...baseConfig.use,
    baseURL,
    video: "on"
  }
});
