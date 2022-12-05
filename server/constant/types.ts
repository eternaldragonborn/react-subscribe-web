import {UpdateStatus} from "../../types";

export interface SubscriberData {
  name: string;
  preview_url: string;
  download_url: string;
}

export interface RawArtistData {
  id: string;
  artist: string;
  updateDate: Date;
  mark?: string;
  status: UpdateStatus;
}

export interface ArtistData {
  id: string;
  subscriber: string;
  artist: string;
  updateDate: string;
  mark?: string;
  status: "未更新" | "新訂閱" | "已退訂" | "已更新" | "本月無更新";
}

export interface SubscribeData {
  artists: ArtistData[];
  subscribers: { [id: string]: SubscriberData };
}

export interface Webhooks {
  subscribe: {
    record: string;
    notification: string;
  };
  book: {
    subscribe: string;
    free: string;
  };
}
