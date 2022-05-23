import mongoose from "mongoose";

interface IBookRecord {
  _id: string;
  url: string;
  users: string[];
}

export const bookSchema = new mongoose.Schema<IBookRecord>({
  _id: { type: String, required: true },
  url: { type: String, required: true },
  users: { type: [String], default: [] },
});

export const Book = mongoose.model<IBookRecord>(
  "book-record",
  bookSchema,
  "book-record",
);
