import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { useContext } from "react";
import { SubscriberPageContext } from "../../constants";

export function TableHeader() {
  const {
    useSort: [sortState, sortDispatch],
    useSelected: [selected, setSelected],
  } = useContext(SubscriberPageContext);
  const { column, direction } = sortState;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" align="center">
          <Checkbox
            indeterminate={
              selected.length > 0 && selected.length < sortState.data.length
            }
            checked={selected.length === sortState.data.length}
            onClick={(e) =>
              e.target.checked
                ? setSelected(sortState.data.map((d) => d.artist))
                : setSelected([])
            }
          />
        </TableCell>

        <TableCell padding="checkbox" />

        <TableCell /* artist */>
          <TableSortLabel
            active={column === "artist"}
            direction={column === "artist" ? direction : "desc"}
            onClick={() =>
              sortDispatch({ type: "CHANGE_SORT", column: "artist" })
            }
          >
            繪師
          </TableSortLabel>
        </TableCell>

        <TableCell>備註</TableCell>

        <TableCell /* updateDate */>
          <TableSortLabel
            active={column === "updateDate"}
            direction={column === "updateDate" ? direction : "desc"}
            onClick={() =>
              sortDispatch({ type: "CHANGE_SORT", column: "updateDate" })
            }
          >
            上次更新
          </TableSortLabel>
        </TableCell>

        <TableCell /* status */>
          <TableSortLabel
            active={column === "status"}
            direction={column === "status" ? direction : "desc"}
            onClick={() =>
              sortDispatch({ type: "CHANGE_SORT", column: "status" })
            }
          >
            更新狀態
          </TableSortLabel>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
