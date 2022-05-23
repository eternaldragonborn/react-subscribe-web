import { Message, MessageAttachment, WebhookMessageOptions } from "discord.js";
import { Router } from "express";
import { FieldBook, FieldPackage, FormSubscriber } from "../../../types";
import { defaultAvatar, emojis, upload, webhooks } from "../../constant";
import { Artist, Book, postgreDataSource, Subscriber } from "../../entity";
import {
  bot,
  createEmbed,
  getdata,
  getTokenId,
  getUser,
  getUserName,
  logger,
  redis,
  sendWebhook,
  setPayload,
  verifyForm,
  verifyIsmanager,
  verifyIsSubscriber,
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

    const embed = await createEmbed("網址變更/建檔", "GREEN", form.id);
    if (form.preview) embed.addField("預覽網址", form.preview);
    embed.addField("下載網址", form.download);

    await sendWebhook(webhooks.updateNotify, "訂閱者資料變更", {
      embeds: [embed],
    }).catch((err) => logger.error("資料變更通知失敗\n" + err));
  })

  // delete subscriber
  .delete(verifyIsmanager, async (req, res) => {
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

// package upload
subscriber.post(
  "/package",
  upload.array("files[]"),
  verifyIsSubscriber,
  async (req, res) => {
    const id = `<@${getTokenId(req.headers)}>`;
    const form: FieldPackage[] = JSON.parse(req.body.packages);

    try {
      const subscriber = await postgreDataSource.manager
        .findOneOrFail(Subscriber, {
          where: { id },
          select: { preview: true, download: true },
        })
        .catch((err) => {
          throw { message: "資料庫錯誤", error: err };
        });

      const embed = await createEmbed("圖包上傳", "NAVY", id);
      form.forEach((data) => {
        embed.addField("作者", data.author, Boolean(data.mark));
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

    try {
      if (!files) throw { message: "無預覽圖" };

      // set embed
      const embed = await createEmbed(form.title, "DARK_GREEN", id);
      embed.setURL("");
      embed.setFooter({ text: "" });
      if (form.author) embed.addField("繪師", form.author);
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
      await redis.sAdd("msg_ids", msg.id).catch((error) => {
        throw { message: "資料庫錯誤", error };
      });
      const book = new Book({ _id: msg.id, url: form.url });
      book
        .save()
        .then(() => {
          res.sendStatus(200);
          logger.trace(`本本(${msg!.id})新增成功`);
        })
        .catch((error) => {
          throw { message: "資料庫錯誤", error };
        });
    } catch (err: any) {
      logger.error("本本新增失敗，" + err.message + "\n" + (err.error ?? ""));
      res.status(405).send(err.message);
    }
  },
);

subscriber.use(async (req, res) => {
  getdata()
    .then((data) => res.json(data?.subscribers))
    .catch((err) => {
      logger.error("更新資料錯誤\n" + err);
      res.sendStatus(200);
    });
});

export { subscriber };
