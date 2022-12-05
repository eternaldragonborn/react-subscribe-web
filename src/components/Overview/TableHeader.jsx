import {Info} from "@mui/icons-material";
import {
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import {useContext} from "react";
import {AuthContext} from "../../constants";
import {RwdDisplay} from "../Utils";

export function TableHeader(props) {
  const {
    useUser: [user],
  } = useContext(AuthContext);
  const {
    useSortState: [sortState, sortStateDispatch],
  } = props;
  const {column, direction} = sortState;

  return (
    <TableHead /* sx={{ bgColor: "white" }} */>
      <TableRow>
        <TableCell sx={{...RwdDisplay("mobile")}}/>

        <TableCell>
          <TableSortLabel
            active={column === "artist"}
            direction={column === "artist" ? direction : "desc"}
            onClick={() =>
              sortStateDispatch({
                type: "CHANGE_SORT",
                column: "artist",
              })
            }
          >
            繪師
          </TableSortLabel>
        </TableCell>

        <TableCell sx={{...RwdDisplay("computer")}}>備註</TableCell>

        <TableCell sx={{...RwdDisplay("computer")}}>
          <TableSortLabel
            active={column === "updateDate"}
            direction={column === "updateDate" ? direction : "desc"}
            onClick={() =>
              sortStateDispatch({
                type: "CHANGE_SORT",
                column: "updateDate",
              })
            }
          >
            上次更新
          </TableSortLabel>
        </TableCell>

        <TableCell>
          <TableSortLabel
            active={column === "status"}
            direction={column === "status" ? direction : "desc"}
            onClick={() =>
              sortStateDispatch({
                type: "CHANGE_SORT",
                column: "status",
              })
            }
          >
            更新狀態
          </TableSortLabel>
        </TableCell>

        <TableCell sx={{...RwdDisplay("computer")}}>
          <TableSortLabel
            active={column === "subscriber"}
            direction={column === "subscriber" ? direction : "desc"}
            onClick={(e) => {
              if (e.target.localName !== "svg")
                sortStateDispatch({
                  type: "CHANGE_SORT",
                  column: "subscriber",
                });
            }}
          >
            訂閱者
            {user?.status === "manager" && (
              <Tooltip title="點擊訂閱者可對其資料進行管理">
                <Info fontSize="small" color="info" sx={{pl: "0.2rem"}}/>
              </Tooltip>
            )}
          </TableSortLabel>
        </TableCell>

        <TableCell align="center" sx={{...RwdDisplay("computer")}}>
          預覽
        </TableCell>

        <TableCell align="center" sx={{...RwdDisplay("computer")}}>
          下載
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
