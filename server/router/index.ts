import path from "path";
import { api } from "./api";
import type { Express } from "express";
import { logger } from "../modules";

const publicPath = path.resolve(process.cwd() + "/build/index.html");

const mountRouter = (app: Express) => {
  app.use("/api", api);
  if (!process.env["REACT_MODE"])
    app.use("/subscribe-sys", (_req, res) => {
      logger.debug("router triggered");
      res.sendFile(publicPath);
    });
};

export { mountRouter };
