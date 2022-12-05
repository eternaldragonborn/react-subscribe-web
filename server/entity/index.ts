import mongoose from "mongoose";
import {DataSource} from "typeorm";
import {databaseConfig} from "../constant";
import {logger} from "../modules";
import {Artist, Subscriber} from "./postgreSQL";

//TODO: 改用mirko-ORM
//#region postgreSQL
const postgreDataSource = new DataSource({
  ...databaseConfig.postgre,
  type: "postgres",
  ssl: false,
  entities: [Subscriber, Artist],
  synchronize: !!process.env.DEV_MODE,
  logging: false,
  cache: true,
});

postgreDataSource
  .initialize()
  .then((datasource) => {
    logger.info("PostgreSQL initialized");
  })
  .catch((e) => logger.error("PostgreSQL initialize failed, " + e.message));
//#endregion

//#region mongoDB
mongoose
  .connect(process.env.MONGO_URI!, databaseConfig.mongo)
  .then((client) => {
    logger.info("mongodb connected");
  })
  .catch((err) => {
    logger.error("connect to mongodb failed, " + err.message);
  });
//#endregion

export * from "./mongoDB";
export * from "./postgreSQL";
export {postgreDataSource};
