import path from "path";
import { api } from "./api";

const publicPath = path.resolve(path.resolve("") + "/build");

/**
 * @param {import('express').Express} app
 */
const mountRouter = async (app) => {
  app.use("/api", api);
  app.use("/subscribe-sys", (req, res) => {
    res.sendFile(publicPath + "/index.html");
  });
};

export { mountRouter };
