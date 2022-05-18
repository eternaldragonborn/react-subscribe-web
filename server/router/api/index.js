import { Router } from "express";
import { auth } from "./auth.js";
import { data } from "./getData.js";
import { artists } from "./artists.js";
import { subscriber } from "./subscriber.js";

const api = Router();

api.use("/auth", auth);
api.use("/data", data);
api.use("/artist", artists);
api.use("/subscriber", subscriber);

api.get("/status", (req, res) => {
  res.sendStatus(200);
});

export { api };
