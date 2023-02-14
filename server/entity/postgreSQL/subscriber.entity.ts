import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Artist } from "./artist.entity";

@Entity({ tableName: "subscribers" })
export class Subscriber {
  @PrimaryKey({ fieldName: "subscriber" })
    id!: string;

  @Property({ fieldName: "preview_url" })
    preview?: string;

  @Property({ fieldName: "download_url" })
    download!: string;

  @OneToMany(() => Artist, (artist) => artist.subscriber, {
    eager: true,
    cascade: [Cascade.REMOVE],
  })
    artists: Collection<Artist> = new Collection<Artist>(this);

  constructor(id: string, download: string, preview?: string) {
    this.id = id;
    this.download = download;
    this.preview = preview;
  }
}
