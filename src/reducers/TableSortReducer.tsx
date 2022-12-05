import _ from "lodash";
import {SortState, SortAction} from "../constants";

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
            ...state,
            type: "CHANGE_SORT",
            column: "updateDate",
          });
        else
          return {
            ...state,
            data: state.data.slice().reverse(),
            direction: state.direction === "asc" ? "desc" : "asc",
            filteredData: state.filteredData
              ? state.filteredData.slice().reverse()
              : null,
          };
      }
      // change column
      return {
        ...state,
        column: action.column,
        data: _.orderBy(state.data, [action.column], "desc"),
        direction: "desc",
        filteredData: state.filteredData
          ? _.orderBy(state.filteredData, [state.column], state.direction)
          : null,
      };
    case "SET_DATA":
      return {
        ...state,
        data: action.data,
      };
    case "START_SEARCH":
      return {...state, searching: true};
    case "END_SEARCH":
      let filteredData = _.orderBy(
        action.filtered,
        [state.column],
        state.direction,
      );

      return {...state, filteredData, searching: false};
    case "CLEAR_SEARCH":
      return {...state, searching: false, filteredData: null};
    default:
      throw new Error(`action type not exist`);
  }
}
