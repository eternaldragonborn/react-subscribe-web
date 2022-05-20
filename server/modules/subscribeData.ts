import {
  MessageActionRow,
  MessageButton,
  WebhookMessageOptions,
} from "discord.js";
import { DateTime } from "luxon";
import { LessThanOrEqual, Not } from "typeorm";
import { UpdateStatus } from "../../types";
import {
  ArtistData,
  getTime,
  siteURL,
  SubscribeData,
  SubscriberData,
  webhooks,
} from "../constant";
import { Artist, postgreDataSource, Subscriber } from "../entity";
import { redis } from "./db";
import { getUser, getUserName, sendWebhook } from "./discordbot";
import { logger } from "./logger";

function convertArtistData(data: Artist): ArtistData {
  const result = {
    artist: data.artist,
    mark: data.mark,
    id: data.subscriber.id,
  } as ArtistData;

  //#region update status/date
  const diffDay = -DateTime.fromJSDate(data.lastUpdateTime!!).diffNow("days")
    .days;
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

export async function getdata() {
  const data = { subscribers: {} } as SubscribeData;
  const userNames: { [id: string]: string } = {};
  try {
    const subscribers = await postgreDataSource.manager.find(Subscriber);
    for (let subscriber of subscribers) {
      const result = await convertSubscriberData(subscriber);
      userNames[subscriber.id] = result.name;
      data.subscribers[subscriber.id] = result;
    }

    const artists = await postgreDataSource.manager.find(Artist, {
      order: { lastUpdateTime: "DESC" },
    });
    data.artists = artists.map((artist) => {
      return {
        ...convertArtistData(artist),
        subscriber: userNames[artist.subscriber.id],
      };
    });

    await redis.set("data", JSON.stringify(data));
    logger.info("subscribe data initialized.");
    return data;
  } catch (err: any) {
    logger.error("Get subscribe data failed, " + err.message);
  }
}

export async function loaddata() {
  if (!(await redis.exists("data"))) await getdata();
  return JSON.parse((await redis.get("data")) ?? "{}") as SubscribeData;
}

export async function checkUpdate() {
  const limitDate = getTime().minus({ days: 30 }).toJSDate();
  const contents: string[] = [];
  let content = "30天未更新：\n>>> ";

  try {
    // get data
    const artistList = await postgreDataSource.manager
      .find(Artist, {
        where: {
          lastUpdateTime: LessThanOrEqual(limitDate),
          status: Not(3),
        },
        order: {
          subscriber: { id: "ASC" },
        },
      })
      .catch((error) => {
        throw { message: "取得未更新列表發生錯誤", error };
      });

    // artist message format
    const filteredData: { [subscriber: string]: string[] } = {};
    for (let artist of artistList) {
      const subscriberId = artist.subscriber.id;
      if (!filteredData[subscriberId]) filteredData[subscriberId] = [];

      const lastUpdate =
        (artist.status === UpdateStatus.newSubscribe ? "新增後未更新，" : "") +
        DateTime.fromJSDate(artist.lastUpdateTime!).toFormat("MM/dd");
      filteredData[subscriberId].push(`\`${artist.artist}\`(${lastUpdate})`);
    }

    // subscriber message format
    for (let data in filteredData) {
      const message = `${data}：${filteredData[data].join("、")}\n`;
      // length check
      if (content.length + message.length > 2000) {
        contents.push(content);
        content = ">>> ";
      }
      content += message;
    }
    contents.push(content);

    // link button
    const component = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("更新請使用網站")
        .setStyle("LINK")
        .setURL(siteURL),
    );

    // send message
    await sendWebhook(
      webhooks.updateNotify,
      "讓我們看看是哪些小王八蛋還沒更新",
      contents.map(
        (content) =>
          ({ content, components: [component] } as WebhookMessageOptions),
      ),
    ).catch((error) => {
      throw { message: "送出未更新通知錯誤", error };
    });
  } catch (err: any) {
    logger.error(err.message + "\n" + err.error);
  }
}
