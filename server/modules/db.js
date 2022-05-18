import { createClient } from "redis";
import { databaseConfig } from "../constant";

export const redis = createClient({
  ...databaseConfig.redis,
});
