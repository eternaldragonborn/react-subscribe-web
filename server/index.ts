import "reflect-metadata";
import parser from "body-parser";
import Express from "express";
import { DateTime } from "luxon";
import morgan from "morgan";
import { getTime } from "./constant";
import { bot, checkUpdate, getData, logger, db } from "./modules";
import { mountRouter } from "./router";
import { RequestContext } from "@mikro-orm/core";

export const app = Express();

if (process.env["DEV_MODE"]) {
  logger.debug("backend running in dev mode");
  app.use(morgan("dev"));
}

(async function init() {
  await db.init();
  await bot.login(process.env.DISCORD_TOKEN);
  await getData();

  app.set("trust proxy", 1);
  app.use(parser.json()); // enable urlencoding
  app.use(parser.urlencoded({ extended: false }));
  app.use(Express.static("./build"));
  app.use((_req, _res, next) => {
    RequestContext.create([db.mongoEm, db.postgreEm], next);
  });
  const port = process.env.PORT || 8080;

  // app.use()
  mountRouter(app);

  app.listen(port, () => {
    logger.info("back-end listening on " + port);
  });

  //#region update check
  const now = getTime();
  const lastUpdateCheck = DateTime.fromISO(
    (await db.redis.get("UpdateCheck")) ?? "",
  );

  if (
    lastUpdateCheck.invalidReason ||
    now.diff(lastUpdateCheck, "days").days > 5
  ) {
    await checkUpdate();
    await db.redis.set("UpdateCheck", now.toISODate());
  }
  //#endregion
})();
