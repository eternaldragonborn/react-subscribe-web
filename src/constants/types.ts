import * as React from "react";
import {
  ArtistData,
  SubscribeData as SubscribeDataType,
} from "../../server/constant";

export type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

export type Reducer<T, U> = [T, React.Dispatch<U>];

type SortableColumn = "subscriber" | "artist" | "updateDate" | "status";

export type SubscribeData = SubscribeDataType;

export type SortState = {
  column: SortableColumn;
  direction: "asc" | "desc";
  data: ArtistData[];
};

type SetSortData = {
  type: "SET_DATA";
  data: ArtistData[];
};

type ChangeSort = {
  type: "CHANGE_SORT";
  column: SortableColumn;
};

export type SortAction = SetSortData | ChangeSort;

export type LoadStatus = "loading" | "failed" | "success" | "forbidden";
