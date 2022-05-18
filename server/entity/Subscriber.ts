import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Artist } from "./Artist";

@Entity({ name: "subscribers" })
export class Subscriber {
  @PrimaryColumn("varchar", {
    length: 21,
    name: "subscriber",
    nullable: false,
    unique: true,
  })
  id!: string;

  @Column("text", { name: "preview_url" })
  preview?: string;

  @Column("text", { nullable: false, name: "download_url" })
  download!: string;

  @CreateDateColumn()
  addTime?: Date;

  @OneToMany(() => Artist, (artist) => artist.subscriber)
  artists?: Promise<Artist[]>;
}
