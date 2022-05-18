import _ from "lodash";
import { SortState, SortAction } from "../constants/types";

export function tableSortReducer(
  state: SortState,
  action: SortAction,
): SortState {
  switch (action.type) {
    case "CHANGE_SORT":
      // change direction
      if (state.column === action.column) {
        if (state.direction === "asc" && state.column !== "updateDate")
          return tableSortReducer(state, {
            type: "CHANGE_SORT",
            column: "updateDate",
          });
        else
          return {
            ...state,
            data: state.data.slice().reverse(),
            direction: state.direction === "asc" ? "desc" : "asc",
          };
      }
      // change column
      return {
        column: action.column,
        data: _.orderBy(state.data, [action.column], "desc"),
        direction: "desc",
      };
    case "SET_DATA":
      return {
        ...state,
        data: action.data,
      };
    default:
      throw new Error(`action type not exist`);
  }
}
