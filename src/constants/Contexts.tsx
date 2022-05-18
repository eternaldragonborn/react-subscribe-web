import * as React from "react";
import type {
  SortState,
  State,
  SubscribeData,
  Reducer,
  SortAction,
} from "./types";

interface UserData {
  id: string;
  status: "user" | "manager" | "subscriber";
}

interface AuthContextType {
  useUser: State<UserData>;
  useSubscribeData: State<SubscribeData>;
}
export const AuthContext = React.createContext<AuthContextType>(undefined!);

interface SubscriberPageContextType {
  useSort: Reducer<SortState, SortAction>;
  useSelected: State<string[]>;
  useArtistEdit: State<{
    type: "edit" | "add" | null;
    artist?: string;
    mark?: string;
  }>;
  // id: string;
}
export const SubscriberPageContext =
  React.createContext<SubscriberPageContextType>(undefined!);
