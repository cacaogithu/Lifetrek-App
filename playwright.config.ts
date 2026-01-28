import path from "path";
import { config as dotenvConfig } from "dotenv";
import local from "./playwright/config/local.config";
import staging from "./playwright/config/staging.config";
import production from "./playwright/config/production.config";

dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

const envConfigMap = { local, staging, production };
const environment = process.env.TEST_ENV || "local";

if (!(environment in envConfigMap)) {
  console.error(`No Playwright config found for TEST_ENV=${environment}`);
  console.error(`Available environments: ${Object.keys(envConfigMap).join(", ")}`);
  process.exit(1);
}

export default envConfigMap[environment as keyof typeof envConfigMap];
