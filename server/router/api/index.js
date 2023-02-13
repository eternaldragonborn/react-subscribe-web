import { Router } from "express";
import { auth } from "./auth";
import { data } from "./getData";
import { artists } from "./artists";
import { subscriber } from "./subscriber";

const api = Router();

api.use("/auth", auth);
api.use("/data", data);
api.use("/artist", artists);
api.use("/subscriber", subscriber);

api.get("/status", (_req, res) => {
  res.sendStatus(200);
});

export { api };
