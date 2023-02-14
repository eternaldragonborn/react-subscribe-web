import "reflect-metadata";
import { MongoDriver, MongoEntityManager } from "@mikro-orm/mongodb";
import { EntityManager as PostgreEntityManager } from "@mikro-orm/postgresql";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import {
  MikroORM,
  EntityManager,
  RequestContext,
  ReflectMetadataProvider,
} from "@mikro-orm/core";
import { createClient, RedisClientType } from "redis";
import { asyncExecute, logger } from "./";
import { Subscriber, Artist, BookRecord } from "../entity";

async function initPostgre() {
  const [result, error] = await asyncExecute(
    MikroORM.init<MongoDriver>({
      metadataProvider: ReflectMetadataProvider,
      discovery: { disableDynamicFileAccess: true },
      clientUrl: process.env["MONGO_URI"],
      user: "EternalDragonborn",
      password: process.env["MONGO_PWD"],
      dbName: "bot-data",
      type: "mongo",
      entities: [BookRecord],
    }),
  );

  if (error) {
    logger.error("init MongoDB failed\n" + error);
    throw error;
  }
  return result;
}

async function initMongo() {
  const [result, error] = await asyncExecute(
    MikroORM.init<PostgreSqlDriver>({
      metadataProvider: ReflectMetadataProvider,
      discovery: { disableDynamicFileAccess: true },
      host: process.env["SQL_HOST"],
      user: process.env["SQL_USER"],
      password: process.env["SQL_PASSWD"],
      dbName: process.env["SQL_DB"],
      type: "postgresql",
      entities: [Subscriber, Artist],
    }),
  );
  if (error) {
    logger.error("failed to init PostgreSQL\n" + error);
    throw error;
  }
  return result;
}

class Database {
  redis: RedisClientType;
  private _mongodb!: MikroORM<MongoDriver>;
  private _postgreSQL!: MikroORM<PostgreSqlDriver>;
  mongoEm!: MongoEntityManager;
  postgreEm!: PostgreEntityManager;

  constructor() {
    this.redis = createClient({
      url: "redis://" + process.env["REDIS_HOST"],
      password: process.env["REDIS_PASSWD"],
    });
  }

  async init() {
    // init redis
    const [, error] = await asyncExecute(this.redis.connect());
    if (error) {
      logger.error("failed to connect to Redis\n" + error);
      throw error;
    }

    // init MongoDB
    this._mongodb = await initPostgre();
    this.mongoEm = this._mongodb.em;

    // init PostgreSQL
    this._postgreSQL = await initMongo();
    this.postgreEm = this._postgreSQL.em;

    logger.info("Database initialized.");
  }

  /**
   * @param em ORM entity manager
   * @param cb 要執行的動作
   */
  createContext<T extends EntityManager<any>, U>(
    em: T,
    cb: (em: T) => Promise<U>,
  ) {
    return RequestContext.createAsync(em, () => cb(em));
  }
}

export const db = new Database();
