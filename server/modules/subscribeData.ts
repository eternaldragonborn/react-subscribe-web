import { DateTime } from "luxon";
import { UpdateStatus } from "../../types";
import { ArtistData, SubscribeData, SubscriberData } from "../constant";
import { Artist, postgreDataSource, Subscriber } from "../entity";
import { redis } from "./db";
import { getUser, getUserName } from "./discordbot";
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

export async function checkUpdate() {}
