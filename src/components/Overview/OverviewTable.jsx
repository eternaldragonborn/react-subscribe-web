import { Paper, Table, TableBody, TableContainer } from "@mui/material";
import { useContext, useEffect, useReducer, useState } from "react";
import { AuthContext } from "../../constants";
import { tableSortReducer } from "../../reducers";
import { ErrorBoundary, TableLoading } from "../Utils";
import { Row } from "./TableBody";
import { TableHeader } from "./TableHeader";
import TableNotLogin from "./TableNotLogin";
import UrlModal from "./UrlModal";

export function OverviewTable() {
  const {
    useUser: [user],
    useSubscribeData: [subscribeData],
  } = useContext(AuthContext);
  const [modalData, setModalData] = useState({});
  const [loadState, setLoadState] = useState("loading");
  const [sortState, sortStateDispatch] = useReducer(tableSortReducer, {
    column: "updateDate",
    data: [],
    direction: "desc",
  });

  useEffect(() => {
    if (subscribeData) {
      sortStateDispatch({ type: "SET_DATA", data: subscribeData.artists });
      setLoadState("success");
    }
  }, [subscribeData]);

  return (
    <>
      <UrlModal useModalData={[modalData, setModalData]} />
      <ErrorBoundary>
        <Paper
          sx={{
            backgroundColor: "rgba(255, 255, 255, .4)",
            borderRadius: "6px",
          }}
        >
          <TableContainer sx={{ height: "80vh", overflow: "auto" }}>
            <Table stickyHeader size="medium" sx={{ height: "100%" }}>
              <TableHeader useSortState={[sortState, sortStateDispatch]} />

              <TableBody>
                {!user && <TableNotLogin />}
                {user &&
                  (loadState === "success" ? (
                    sortState.data.map((d) => {
                      return (
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
                      );
                    })
                  ) : (
                    <TableLoading status={loadState} />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </ErrorBoundary>
    </>
  );
}
