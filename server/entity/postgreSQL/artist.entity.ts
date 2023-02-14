import {
  Entity,
  Enum,
  IdentifiedReference,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { UpdateStatus } from "../../../types";
import { Subscriber } from "./subscriber.entity";
import { getTime } from "../../constant";

@Entity({ tableName: "artists" })
export class Artist {
  @PrimaryKey({ fieldName: "artist" })
    artist!: string;

  @ManyToOne({
    entity: () => Subscriber,
    inversedBy: (subscriber) => subscriber.artists,
    ref: true,
    fieldName: "subscriber",
  })
    subscriber?: IdentifiedReference<Subscriber>;

  @Property({
    fieldName: "lastUpdateTime",
    onUpdate: () => getTime(),
  })
    lastUpdateTime?: Date = getTime().toJSDate();

  @Property()
    mark?: string;

  @Property({ default: UpdateStatus.newSubscribe })
  @Enum(() => UpdateStatus)
    status?: UpdateStatus = UpdateStatus.newSubscribe;

  constructor(artist: string, status: UpdateStatus, mark?: string) {
    this.artist = artist;
    this.status = status;
    this.mark = mark;
  }
}
