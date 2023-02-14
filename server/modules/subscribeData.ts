import { blockQuote, inlineCode } from "@discordjs/builders";
import { MessageActionRow, MessageButton, WebhookMessageOptions } from "discord.js";
import { DateTime } from "luxon";
import { UpdateStatus } from "../../types";
import { ArtistData, getTime, siteURL, SubscribeData, SubscriberData, webhooks } from "../constant";
import { db } from "./databases";
import { getUser, getUserName, sendWebhook } from "./discordbot";
import { logger } from "./logger";
import { Subscriber, Artist } from "../entity/postgreSQL";

function convertArtistData(data: Artist): ArtistData {
  // let subscriber = wrap(data.subscriber).init();

  const result = {
    artist: data.name,
    mark: data.mark,
    // id: data.subscriber.id,
  } as ArtistData;

  //#region update status/date
  const diffDay = -DateTime.fromJSDate(data.lastUpdateTime!).diffNow("days").days;
  if (diffDay >= 30 && data.status !== UpdateStatus.unSubscribed) {
    result.status = "未更新";
  } else if (data.status === UpdateStatus.newSubscribe) {
    result.status = "新訂閱";
  } else if (data.status === UpdateStatus.unSubscribed) {
    result.status = "已退訂";
  } else if (data.status === UpdateStatus.normal) {
    result.status = "已更新";
  } else if (data.status === UpdateStatus.noUpdate) {
    result.status = "本月無更新";
  }
  result.updateDate = data.lastUpdateTime!.toISOString().split("T")[0];
  //#endregion

  return result;
}

async function convertSubscriberData(data: Subscriber) {
  const result = {
    preview_url: data.preview,
    download_url: data.download,
  } as SubscriberData;

  // get username
  const subscriber = await getUser(data.id);
  const name = getUserName(subscriber);

  return { ...result, name };
}

export async function getData() {
  const data = { subscribers: {} } as SubscribeData;
  const userNames: { [id: string]: string } = {};
  const em = db.postgreEm.fork();

  try {
    const subscribers = await em.find(Subscriber, {});

    for (const subscriber of subscribers) {
      const convertedData = await convertSubscriberData(subscriber);
      userNames[subscriber.id] = convertedData.name;
      data.subscribers[subscriber.id] = convertedData;
    }

    const artists = await em.find(Artist, {}, { orderBy: { lastUpdateTime: "DESC" } });
    data.artists = [];
    for (const artist of artists) {
      const subscriberId = await artist.subscriber!.load("id");

      data.artists.push({
        ...convertArtistData(artist),
        id: subscriberId,
        subscriber: userNames[subscriberId] ?? "unknown",
      });
    }

    await db.redis.set("data", JSON.stringify(data));
    logger.info("subscriber data (re)loaded");
    return data;
  } catch (err: any) {
    logger.error("Get subscribe data failed, " + err.message);
  }
}

export async function loadData() {
  if (!(await db.redis.exists("data"))) await getData();
  return JSON.parse((await db.redis.get("data")) ?? "{}") as SubscribeData;
}

export async function checkUpdate() {
  const limitDate = getTime().minus({ days: 30 }).toJSDate();
  const contents: string[] = [];
  let content = "";

  try {
    // get data
    const artistList = await db.createContext(db.postgreEm, async (em) => {
      return await em
        .find(
          Artist,
          {
            lastUpdateTime: { $lte: limitDate },
            status: { $not: 3 },
          },
          {
            orderBy: {
              subscriber: { id: "ASC" },
            },
          },
        )
        .catch((error) => {
          throw { message: "取得未更新列表發生錯誤", error };
        });
    });

    // artist message format
    const filteredData: { [subscriber: string]: string[] } = {};
    for (const artist of artistList) {
      const subscriberId = await artist.subscriber!.load("id");
      if (!filteredData[subscriberId]) filteredData[subscriberId] = [];

      const lastUpdate =
        (artist.status === UpdateStatus.newSubscribe ? "新增後未更新，" : "") +
        DateTime.fromJSDate(artist.lastUpdateTime!).toFormat("MM/dd");
      filteredData[subscriberId].push(`${inlineCode(artist.name)}(${lastUpdate})`);
    }

    // subscriber message format
    for (const data in filteredData) {
      const message = `${data}：${filteredData[data].join("、")}\n`;
      // length check
      if (content.length + message.length > 1990) {
        contents.push(blockQuote(content));
        content = "";
      }
      content += message;
    }
    contents.push(blockQuote(content));
    contents[0] = "30天未更新：\n" + contents[0];

    // link button
    const component = new MessageActionRow().addComponents(
      new MessageButton().setLabel("更新請使用網站").setStyle("LINK").setURL(siteURL),
    );

    // send message
    await sendWebhook(
      webhooks.updateNotify,
      "讓我們看看是哪些小王八蛋還沒更新",
      contents.map((content) => ({ content, components: [component] } as WebhookMessageOptions)),
    ).catch((error) => {
      throw { message: "送出未更新通知錯誤", error };
    });
  } catch (err: any) {
    logger.error(err.message + "\n" + err.error);
  }
}
