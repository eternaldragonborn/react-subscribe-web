import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "book-record" })
export class BookRecord {
  @PrimaryKey({ type: "string" })
    _id!: string;

  @Property({ type: "string" })
    url!: string;

  @Property({ type: Array<string>, default: [] })
    users?: string[];

  constructor(record: { id: string; url: string; users?: string[] }) {
    this._id = record.id;
    this.url = record.url;
    this.users = record.users ?? [];
  }
}
