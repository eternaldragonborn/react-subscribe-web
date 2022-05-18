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
  synchronize: true,
  logging: false,
  cache: true,
});

postgreDataSource
  .initialize()
  .then((datasource) => {
    logger.info("Postgre initialized");
    // datasource
    //   .getRepository(Artist)
    //   .find()
    //   .then((artists) =>
    //     artists.forEach((artist) =>
    //       console.log(`${artist.artist} : ${artist.subscriber?.id}`),
    //     ),
    //   );
  })
  .catch((e) => logger.error("Postgre initialize failed, " + e.message));

export * from "./Artist";
export * from "./Subscriber";
export { postgreDataSource };
