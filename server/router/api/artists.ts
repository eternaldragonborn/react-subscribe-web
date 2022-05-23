import {
  ColorResolvable,
  EmbedFieldData,
  MessageAttachment,
  WebhookMessageOptions,
} from "discord.js";
import { Router } from "express";
import multer from "multer";
import {
  FormArtist,
  FormUpdate,
  FormUploadPackage,
  Status,
  UpdateStatus,
} from "../../../types";
import { getTime, webhooks } from "../../constant";
import { Artist, postgreDataSource, Subscriber } from "../../entity";
import {
  createEmbed,
  getdata,
  logger,
  sendWebhook,
  setPayload,
  verifyForm,
} from "../../modules";

const artists = Router();

artists
  .route("/")
  // add artist
  .post(verifyForm, async (req, res, next) => {
    const form: FormArtist = req.body;
    const manager = postgreDataSource.manager;

    try {
      const subscriber = await manager
        .findOneByOrFail(Subscriber, {
          id: form.id,
        })
        .catch(() => {
          throw Error("無網址資料，請先進行網址建檔");
        });

      const newArtists = form.artists.map((artist) => {
        const newArtist = manager.create(Artist, {
          artist: artist.name,
          mark: artist.mark,
        });
        newArtist.subscriber = subscriber;
        return newArtist;
      });

      await manager.insert(Artist, newArtists).catch((err) => {
        logger.error("新增繪師時發生錯誤\n" + err);
        throw Error("新增錯誤，可能因資料庫中已有該繪師");
      });
      logger.debug(
        "Artists [" + form.artists.map((artist) => artist.name) + "] added.",
      );
    } catch (err: any) {
      res.status(405).send(err.message);
      return;
    }

    // notification
    const embed = await createEmbed("繪師新增", "GREEN", form.id);
    form.artists.forEach((artist) => {
      embed.addField("繪師", `\`${artist.name}\``, Boolean(artist.mark));
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
    const manager = postgreDataSource.manager;

    try {
      await manager.update(
        Artist,
        { artist: form.artists[0].artist },
        { artist: form.artists[0].name, mark: form.artists[0].mark },
      );
      next();
    } catch (err: any) {
      res.status(405).send("資料庫發生錯誤。");
      logger.error(
        `修改繪師(${form.artists[0]?.artist})資料時發生錯誤\n` + err,
      );
    }
  })

  // update artist
  .notify(
    verifyForm,
    multer().array("attachments[]"),
    async (req, res, next) => {
      const form: FormUpdate = req.body;
      const manager = postgreDataSource.manager;
      let status = Status[form.status];

      try {
        await manager
          .createQueryBuilder()
          .update(Artist)
          .where("artist IN (:...artistNames)", { artistNames: form.artist })
          .set({
            lastUpdateTime: getTime().toJSDate(),
            status: status,
          })
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
            value: form.artist.map((d) => `\`${d}\``).join("\n"),
            inline: Boolean(form.mark),
          },
        ];
        if (form.mark)
          fields.push({ name: "備註", value: form.mark, inline: true });
        if (form.file_link)
          fields.push({ name: "檔案連結", value: form.file_link });

        let title: string, color: ColorResolvable;
        switch (status) {
          case UpdateStatus.normal:
            const subscriber = await manager.findOneOrFail(Subscriber, {
              select: { preview: true, download: true },
              where: { id: form.id },
            });
            if (subscriber.preview)
              fields.push({ name: "預覽", value: subscriber.preview });
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
    },
  )

  // delete artist
  .delete(verifyForm, async (req, res, next) => {
    const form: FormUpdate = req.body;
    const manager = postgreDataSource.manager;

    try {
      await manager
        .createQueryBuilder()
        .delete()
        .from(Artist)
        .where("artist IN (:...artistNames)", { artistNames: form.artist })
        .execute();
      next();
    } catch (err: any) {
      logger.error(`刪除繪師資料[${form.artist}]時發生錯誤\n${err}`);
      res.status(405).send("資料庫發生錯誤。");
      return;
    }

    try {
      const embed = await createEmbed("繪師資料刪除", "RED", form.id);
      embed.addField("繪師", form.artist.map((d) => `\`${d}\``).join("\n"));
      await sendWebhook(webhooks.subscribe, "資料刪除", { embeds: [embed] });
    } catch (err) {
      logger.error("進行刪除通知時發生錯誤\n" + err);
    }
  });

artists.use(async (req, res) => {
  await getdata()
    .then((data) => res.json(data?.artists))
    .catch((err) => {
      logger.error(`更新資料錯誤。\n${err}`);
      res.sendStatus(200);
    });
});

export { artists };
