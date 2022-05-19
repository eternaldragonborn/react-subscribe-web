import { Router } from "express";
import { FormSubscriber } from "../../../types";
import { webhooks } from "../../constant";
import { Artist, postgreDataSource, Subscriber } from "../../entity";
import {
  createEmbed,
  getdata,
  getUser,
  getUserName,
  logger,
  sendWebhook,
  verifyForm,
  verifyIsmanager,
  verifyToken,
} from "../../modules";

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
  .delete(verifyIsmanager, async (req, res, next) => {
    const author = await verifyToken(req.headers);
    const { subscriber: subscriberId }: { subscriber: string } = req.body;
    let artists: Artist[];

    try {
      artists = await postgreDataSource.manager.find(Artist, {
        where: { subscriber: { id: subscriberId } },
      });
      await postgreDataSource.manager.delete(Subscriber, { id: subscriberId });
      logger.trace(`訂閱者(${subscriberId})資料刪除`);

      const data = await getdata();
      res.json(data);
    } catch (err) {
      logger.error(`刪除訂閱者(${subscriberId})失敗\n${err}`);
      res.status(405).send("資料庫錯誤。");
      return;
    }

    try {
      const user = await getUser(subscriberId);
      const embed = await createEmbed("訂閱者資料刪除", "DARK_RED", author?.id);
      embed.addField("訂閱者", getUserName(user));
      if (artists.length)
        embed.addField(
          "包含以下繪師",
          artists.map((artist) => `\`${artist.artist}\``).join("\n"),
        );

      await sendWebhook(webhooks.subscribe, "資料刪除", { embeds: [embed] });
    } catch (err) {
      logger.error("資料刪除通知發生錯誤\n" + err);
    }
  });

subscriber.use(async (req, res) => {
  getdata()
    .then((data) => res.json(data?.subscribers))
    .catch((err) => {
      logger.error("更新資料錯誤\n" + err);
      res.sendStatus(200);
    });
});

export { subscriber };
