import { inlineCode } from "@discordjs/builders";
import { ColorResolvable, EmbedFieldData } from "discord.js";
import { Router } from "express";
import { FormArtist, FormUpdate, Status, UpdateStatus } from "../../../types";
import { getTime, upload, webhooks } from "../../constant";
import { db } from "../../modules/databases";
import {
  asyncExecute,
  createEmbed,
  getData,
  logger,
  sendWebhook,
  setPayload,
  verifyForm,
  verifyIsManager,
} from "../../modules";
import { Subscriber, Artist } from "../../entity";
import { NotFoundError, UniqueConstraintViolationException, wrap } from "@mikro-orm/core";

const artists = Router();

artists
  .route("/")
  // add artist
  .post(verifyForm, async (req, res, next) => {
    const form: FormArtist = req.body;

    try {
      const subscriber = await db.postgreEm.findOneOrFail(Subscriber, form.id);
      const newArtists = form.artists.map((artist) => {
        return db.postgreEm.create(Artist, {
          name: artist.name,
          mark: artist.mark,
          subscriber: subscriber,
        });
      });

      await db.postgreEm.insertMany(Artist, newArtists).catch((err) => {
        logger.error("新增繪師時發生錯誤\n" + err);
        if (err instanceof UniqueConstraintViolationException) {
          throw Error("資料庫中已有該繪師資料，如需更改訂閱者請告知管理員");
        }
        throw Error("資料庫發生錯誤");
      });
      logger.debug("Artists [" + form.artists.map((artist) => artist.name) + "] added.");
    } catch (err: any) {
      res.status(405).send(err.message);
      return;
    }

    // notification
    const embed = await createEmbed("繪師新增", "GREEN", form.id);
    form.artists.forEach((artist, n) => {
      embed.addField(`繪師${n + 1}`, inlineCode(artist.name), Boolean(artist.mark));
      if (artist.mark) embed.addField("備註", artist.mark, true);
    });

    sendWebhook(
      webhooks.subscribe,
      "訂閱通知",
      { embeds: [embed] },
      form.id, //
    ).catch((err) => logger.error("發送新增繪師通知時發生錯誤\n" + err));

    next();
  })

  // edit artist
  .patch(verifyForm, async (req, res, next) => {
    const form: FormArtist = req.body;

    try {
      db.createContext(db.postgreEm, async (em) => {
        const ref = await em.findOneOrFail(Artist, {
          name: form.artists[0].artist,
        });
        wrap(ref).assign({
          name: form.artists[0].name,
          mark: form.artists[0].mark,
        });
        await em.flush();
      });
      next();
    } catch (err: any) {
      res.status(405).send("資料庫發生錯誤。");
      logger.error(`修改繪師(${form.artists[0]?.artist})資料時發生錯誤\n` + err);
    }
  })

  // update artist
  .notify(upload.array("attachments[]"), verifyForm, async (req, res, next) => {
    const form: FormUpdate = req.body;
    const em = db.postgreEm.fork();
    const status = Status[form.status];

    try {
      await em
        .createQueryBuilder(Artist)
        .update({ lastUpdateTime: getTime().toJSDate(), status: status })
        .where({ name: { $in: form.artist } })
        .execute();
      next();
    } catch (err: any) {
      logger.error("繪師更新時發生錯誤\n" + err);
      res.status(405).send("資料庫發生錯誤。");
      return;
    }

    // notification
    try {
      //#region embed
      const fields: EmbedFieldData[] = [
        {
          name: "繪師",
          value: form.artist.map((d) => inlineCode(d)).join("\n"),
          inline: Boolean(form.mark),
        },
      ];
      if (form.mark) fields.push({ name: "備註", value: form.mark, inline: true });
      if (form.file_link) fields.push({ name: "檔案連結", value: form.file_link });

      let title: string, color: ColorResolvable;
      switch (status) {
        case UpdateStatus.normal:
          const subscriber = await em.findOneOrFail(Subscriber, {
            id: form.id,
          });
          if (subscriber.preview) fields.push({ name: "預覽", value: subscriber.preview });
          fields.push({ name: "下載", value: subscriber.download });
          title = "繪師更新";
          color = "BLUE";
          break;
        case UpdateStatus.noUpdate:
          title = "繪師停更";
          color = "DARK_GREY";
          break;
        case UpdateStatus.unSubscribed:
          title = "繪師取消訂閱";
          color = "DARK_RED";
          break;
      }
      const embed = await createEmbed(title!, color!, form.id);
      embed.addFields(fields);
      //#endregion
      const payload = setPayload(embed, req.files);
      //#endregion

      await sendWebhook(webhooks.subscribe, "更新通知", payload, form.id);
    } catch (err) {
      logger.error("進行更新通知時發生錯誤\n" + err);
    }
  })

  // change subscriber
  .merge(upload.none(), verifyIsManager, async (req, res, next) => {
    const form: FormUpdate = req.body;
    const em = db.postgreEm.fork();
    logger.debug(JSON.stringify(form, null, 2));

    try {
      // attempt to get new subscriber data
      let [newSubscriber, error] = await asyncExecute(
        em.findOneOrFail(Subscriber, {
          id: form.subscriber,
        }),
      );
      if (error) {
        if (error instanceof NotFoundError) {
          res.status(405).send("該訂閱者未建檔");
        }
        logger.error("更改訂閱者(取得新訂閱者資料)時發生錯誤\n" + error);
        res.status(405).send("資料庫錯誤");
        return;
      }

      // update artists data
      [, error] = await asyncExecute(
        em
          .createQueryBuilder(Artist)
          .update({
            subscriber: newSubscriber,
            lastUpdateTime: getTime().toJSDate(),
            status: UpdateStatus.newSubscribe,
          })
          .where({ name: { $in: form.artist } })
          .execute(),
      );
      if (error) {
        logger.error("更改訂閱者(更新資料)時發生錯誤\n" + error);
        res.status(405).send("資料庫錯誤");
      }

      next();
    } catch (err: any) {
      logger.error("更改繪師訂閱者時發生錯誤\n" + err);
      res.status(405).send("資料庫發生錯誤。");
      return;
    }

    // notification
    const embed = await createEmbed("繪師訂閱者變更", "YELLOW");
    embed.addField("繪師", `\`${form.artist}\``);
    embed.addField("原訂閱者", form.id);
    embed.addField("新訂閱者", form.subscriber!);
    await sendWebhook(webhooks.subscribe, "訂閱通知", { embeds: [embed] });
  })

  // delete artist
  .delete(upload.none(), verifyForm, async (req, res, next) => {
    const form: FormUpdate = req.body;
    const em = db.postgreEm.fork();

    try {
      await em
        .createQueryBuilder(Artist)
        .delete()
        .where({ name: { $in: form.artist } })
        .execute();
    } catch (err: any) {
      logger.error(`刪除繪師資料[${form.artist}]時發生錯誤\n${err}`);
      res.status(405).send("資料庫發生錯誤。");
      return;
    }

    try {
      const embed = await createEmbed("繪師資料刪除", "RED", form.id);
      embed.addField("繪師", form.artist.map((d) => inlineCode(d)).join("\n"));
      await sendWebhook(webhooks.subscribe, "資料刪除", { embeds: [embed] });
    } catch (err) {
      logger.error("進行刪除通知時發生錯誤\n" + err);
    }

    next();
  });

artists.use(async (_req, res) => {
  await getData()
    .then((data) => res.json(data?.artists))
    .catch((err) => {
      logger.error(`更新資料錯誤。\n${err}`);
      res.sendStatus(200);
    });
});

export { artists };
