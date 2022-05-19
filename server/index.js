import parser from "body-parser";
import Express from "express";
import morgan from "morgan";
import multer from "multer";
import "reflect-metadata";
import { bot, getdata, logger, redis } from "./modules";
import { mountRouter } from "./router";

const app = Express();
if (true) {
  logger.debug("backend running in dev mode");
  app.use(morgan("dev"));
}

app.set("trust proxy", 1);
app.use(parser.json()); // enable urlencoding
app.use(parser.urlencoded({ extended: false }));
app.use(multer().any()); // enable form/file
app.use(Express.static("./build"));

const port = process.env.PORT ?? 80;
app.listen(port, async () => {
  await redis.connect();
  await bot.login(process.env.DISCORD_TOKEN);
  await getdata();

  await mountRouter(app);
  logger.info("back-end listening on " + port);
});
