import * as React from "react";
import type { SortState, State, SubscribeData, Reducer, SortAction, EditAction } from "./types";

export interface UserData {
  id: string;
  status: "user" | "manager" | "subscriber";
}

interface AuthContextType {
  useUser: State<UserData | undefined>;
  useSubscribeData: State<SubscribeData | undefined>;
}

export const AuthContext = React.createContext<AuthContextType>(undefined!);

interface SubscriberPageContextType {
  useSort: Reducer<SortState, SortAction>;
  useSelected: State<string[]>;
  useArtistEdit: State<EditAction>;
  // id: string;
}

export const SubscriberPageContext = React.createContext<SubscriberPageContextType>(undefined!);
