import { QuestionMark } from "@mui/icons-material";
import { CircularProgress, TableCell, TableRow } from "@mui/material";
import { lazy, useContext } from "react";

import { AuthContext, SortState } from "../../constants";
import { theme } from "../../styles/theme";
import { IconHeader, TableLoading } from "../Utils";

const Row = lazy(() =>
  window.screen.width >= theme.breakpoints.values["md"]
    ? import("./Row")
    : import("./RowRWD"),
);

export default function OverviewTableBody({
  sortState,
  searchWord,
  loadState,
  setModalData,
}: {
  sortState: SortState;
  searchWord: string;
  loadState: string;
  setModalData: any;
}) {
  const {
    useSubscribeData: [subscribeData],
  } = useContext(AuthContext);

  if (loadState === "success") {
    if (searchWord) {
      if (sortState.searching) {
        return (
          <TableRow>
            <TableCell colSpan={8} align="center">
              <CircularProgress />
            </TableCell>
          </TableRow>
        );
      }

      return sortState.filteredData?.length ? ( // has search result
        <>
          {sortState.filteredData.map((d) => (
            <Row
              key={d.artist}
              artist={d}
              url={
                subscribeData.subscribers
                  ? subscribeData.subscribers[d.id]
                  : null
              }
              setModalData={setModalData}
            />
          ))}
        </>
      ) : (
        // no search result
        <TableRow>
          <TableCell colSpan={8} align="center">
            <IconHeader icon={QuestionMark} header="無符合的搜尋條件" />
          </TableCell>
        </TableRow>
      );
    } else
      return (
        <>
          {sortState.data.map((d) => (
            <Row
              key={d.artist}
              artist={d}
              url={
                subscribeData.subscribers
                  ? subscribeData.subscribers[d.id]
                  : null
              }
              setModalData={setModalData}
            />
          ))}
        </>
      );
  } else return <TableLoading status={loadState} />;
}
