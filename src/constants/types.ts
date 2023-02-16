import * as React from "react";
import { ArtistData, SubscribeData as SubscribeDataType } from "../../server/constant";

export type State<T> = [T, React.Dispatch<React.SetStateAction<T>>];

export type Reducer<T, U> = [T, React.Dispatch<U>];

type SortableColumn = "subscriber" | "artist" | "updateDate" | "status";

export type SubscribeData = SubscribeDataType;

export type SortState = {
  column: SortableColumn;
  direction: "asc" | "desc";
  searching?: boolean;
  data: ArtistData[];
  filteredData?: ArtistData[] | null;
};
type SetSortData = {
  type: "SET_DATA";
  data: ArtistData[];
};
type ChangeSort = {
  type: "CHANGE_SORT";
  column: SortableColumn;
};
type StartSearch = {
  type: "START_SEARCH";
  value: string;
};
type EndSearch = {
  type: "END_SEARCH";
  filtered: ArtistData[];
};
type ClearSearch = {
  type: "CLEAR_SEARCH";
};

export type SortAction = SetSortData | ChangeSort | StartSearch | EndSearch | ClearSearch;

export type LoadStatus = "loading" | "failed" | "success" | "forbidden";

export type EditAction = {
  type: "edit" | "add" | "delete" | null;
  artist?: string;
  mark?: string;
};
