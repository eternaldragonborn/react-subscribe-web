import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { UpdateStatus } from "../../types";
import { getTime } from "../constant";
import { Subscriber } from "./Subscriber";

@Entity({ name: process.env.DEV_MODE ? "artists_test" : "artists" })
export class Artist {
  @BeforeInsert()
  createDates() {
    this.lastUpdateTime = getTime().toJSDate();
  }

  @PrimaryColumn("varchar", { length: 30, nullable: false, unique: true })
  artist!: string;

  @ManyToOne(() => Subscriber, (subscriber) => subscriber.artists, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE",
    cascade: true,
  })
  @JoinColumn({ name: "subscriber" })
  subscriber!: Subscriber;

  @Column("timestamp", { nullable: false })
  lastUpdateTime?: Date;

  @Column("varchar", { length: 20, default: "" })
  mark?: string;

  @Column({
    type: "enum",
    enum: UpdateStatus,
    default: UpdateStatus.newSubscribe,
    nullable: false,
  })
  status?: UpdateStatus;
}
