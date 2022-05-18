import { Router } from "express";
import { FormSubscriber } from "../../../types";
import { postgreDataSource, Subscriber } from "../../entity";
import { getdata, logger, verifyForm, verifyIsmanager } from "../../modules";

const subscriber = Router();

subscriber
  .route("/")
  // edit/add url
  .post(verifyForm, async (req, res, next) => {
    const form: FormSubscriber = req.body;

    try {
      await postgreDataSource.manager.upsert(
        Subscriber,
        { id: form.id, preview: form.preview, download: form.download },
        ["id"],
      );
      next();
    } catch (err) {
      logger.error(`更新網址發生錯誤\n${err}`);
      res.status(405).send("資料庫發生錯誤。");
      return;
    }
  })

  // delete subscriber
  // TODO
  .delete(verifyIsmanager, async (req, res, next) => {});

subscriber.use(async (req, res) => {
  getdata()
    .then((data) => res.json(data?.subscribers))
    .catch((err) => {
      logger.error("更新資料錯誤\n" + err);
      res.sendStatus(200);
    });
});

export { subscriber };
