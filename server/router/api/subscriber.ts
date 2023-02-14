import { inlineCode } from "@discordjs/builders";
import { NotFoundError } from "@mikro-orm/core";
import { Message, MessageAttachment, WebhookMessageOptions } from "discord.js";
import { Router } from "express";

import { FieldBook, FieldPackage, FormSubscriber } from "../../../types";
import { defaultAvatar, emojis, upload, webhooks } from "../../constant";
import { BookRecord, Subscriber } from "../../entity";
import {
  bot,
  createEmbed,
  getData,
  getTokenId,
  logger,
  sendWebhook,
  setPayload,
  verifyForm,
  verifyIsManager,
  verifyIsSubscriber,
  verifyToken,
  db,
  asyncExecute,
} from "../../modules";

const subscriber = Router();

subscriber
  .route("/")
  // edit/add url
  .post(verifyForm, async (req, res, next) => {
    const form: FormSubscriber = req.body;

    try {
      await db.postgreEm.upsert(Subscriber, {
        id: form.id,
        preview: form.preview,
        download: form.download,
      });
      next();
    } catch (err) {
      logger.error(`更新網址發生錯誤\n${err}`);
      res.status(405).send("資料庫發生錯誤。");
      return;
    }

    const embed = await createEmbed("網址變更/建檔", "GREEN", form.id);
    if (form.preview) embed.addField("預覽網址", form.preview);
    embed.addField("下載網址", form.download);

    await sendWebhook(webhooks.updateNotify, "訂閱者資料變更", {
      embeds: [embed],
    }).catch((err) => logger.error("資料變更通知失敗\n" + err));
  })

  // delete subscriber
  .delete(verifyIsManager, async (req, res) => {
    const author = await verifyToken(req.headers);
    const { subscriber: subscriberId }: { subscriber: string } = req.body;
    let artists: string;

    try {
      const subscriber = await db.postgreEm.findOneOrFail(Subscriber, {
        id: subscriberId,
      });
      artists = (subscriber.artists ?? []).join("\n");
      await db.postgreEm.removeAndFlush(subscriber);
      logger.trace(`訂閱者(${subscriberId})資料刪除`);

      const data = await getData();
      res.json(data);
    } catch (err) {
      logger.error(`刪除訂閱者(${subscriberId})失敗\n${err}`);
      res.status(405).send("資料庫錯誤。");
      return;
    }

    try {
      // const user = await getUser(subscriberId);
      const embed = await createEmbed("訂閱者資料刪除", "DARK_RED", author?.id);
      embed.addField("訂閱者", subscriberId);
      if (artists.length) embed.addField("包含以下繪師", artists);

      await sendWebhook(webhooks.subscribe, "資料刪除", { embeds: [embed] });
    } catch (err) {
      logger.error("資料刪除通知發生錯誤\n" + err);
    }
  });

// package upload
subscriber.post(
  "/package",
  upload.array("files[]"),
  verifyIsSubscriber,
  async (req, res) => {
    const id = `<@${getTokenId(req.headers)}>`;
    const form: FieldPackage[] = JSON.parse(req.body.packages);
    const em = db.postgreEm.fork();

    try {
      const [subscriber, error] = await asyncExecute(
        em.findOneOrFail(Subscriber, {
          id,
        }),
      );
      if (error) {
        if (error instanceof NotFoundError) {
          res.status(405).send("資料庫中無網址資料，請先建檔");
        } else {
          res.status(405).send("資料庫發生錯誤");
        }

        logger.error("取得網址資料發生錯誤\n" + error);
        return;
      }

      const embed = await createEmbed("圖包上傳", "NAVY", id);
      form.forEach((data, n) => {
        embed.addField(
          `作者${n + 1}`,
          inlineCode(data.author),
          Boolean(data.mark),
        );
        if (data.mark) embed.addField("備註", data.mark, true);
        if (data.file_link) embed.addField("檔案連結", data.file_link);
      });

      if (subscriber.preview) embed.addField("雲端預覽", subscriber.preview);
      embed.addField("雲端下載", subscriber.download);

      const payload = setPayload(embed, req.files);

      await sendWebhook(webhooks.subscribe, "圖包上傳", payload).catch(
        (error) => {
          throw { message: "bot錯誤", error };
        },
      );

      res.sendStatus(200);
    } catch (err: any) {
      logger.error(`${err.message}\n${err.error}`);
      res.status(405).send("上傳失敗，" + err.message);
    }
  },
);

subscriber.post(
  "/book",
  upload.array("files[]", 1),
  verifyIsSubscriber,
  async (req, res) => {
    const form: FieldBook = req.body;
    const files = (req.files as Express.Multer.File[])[0];
    const id = getTokenId(req.headers);
    const em = db.mongoEm.fork();

    try {
      if (!files) throw { message: "無預覽圖" };

      // set embed
      const embed = await createEmbed(form.title, "DARK_GREEN", id);
      embed.setURL("");
      embed.setFooter({ text: "" });
      if (form.author) embed.addField("繪師", inlineCode(form.author));
      if (form.mark) embed.addField("備註", form.mark);

      const image = new MessageAttachment(files.buffer, files.originalname);
      embed.setImage(`attachment://${image.name}`);
      const payload: WebhookMessageOptions = {
        embeds: [embed],
        files: [image],
      };

      // send message/ add reaction
      let msg: Message | undefined;
      try {
        const webhook = await bot.fetchWebhook(webhooks.book.subscriber);
        msg = (await webhook.send({
          ...payload,
          username: "本本上傳",
          avatarURL: defaultAvatar,
        })) as Message;
        await msg.react(emojis.book);
      } catch (error) {
        if (msg) await msg.delete();
        throw { message: "發送本本訊息失敗", error };
      }

      // fileing
      const book = em.create(BookRecord, {
        _id: msg.id,
        url: form.url,
      });
      await em.persistAndFlush(book).catch((error) => {
        msg?.delete();
        throw { message: "資料庫錯誤", error };
      });
    } catch (err: any) {
      logger.error("本本新增失敗，" + err.message + "\n" + (err.error ?? ""));
      res.status(405).send(err.message);
    }
    res.sendStatus(200);
  },
);

subscriber.use(async (_req, res) => {
  getData()
    .then((data) => res.json(data?.subscribers))
    .catch((err) => {
      logger.error("更新資料錯誤\n" + err);
      res.sendStatus(200);
    });
});

export { subscriber };
