import { DataSource } from "typeorm";
import { databaseConfig } from "../constant";
import { logger } from "../modules";
import { Artist } from "./Artist";
import { Subscriber } from "./Subscriber";

const postgreDataSource = new DataSource({
  ...databaseConfig.postgre,
  type: "postgres",
  ssl: process.env.DEV_MODE
    ? false
    : {
        rejectUnauthorized: false,
      },
  entities: [Subscriber, Artist],
  synchronize: process.env.DEV_MODE ? true : false,
  logging: false,
  cache: true,
});

postgreDataSource
  .initialize()
  .then((datasource) => {
    logger.info("Postgre initialized");
  })
  .catch((e) => logger.error("Postgre initialize failed, " + e.message));

export * from "./Artist";
export * from "./Subscriber";
export { postgreDataSource };
