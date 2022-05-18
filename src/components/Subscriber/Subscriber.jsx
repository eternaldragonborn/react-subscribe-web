import { Add } from "@mui/icons-material";
import {
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
} from "@mui/material";
import { useContext, useEffect, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext, SubscriberPageContext } from "../../constants";
import { tableSortReducer } from "../../reducers";
import { ErrorBoundary, TableLoading } from "../Utils";
import { ModalEditArtist } from "./ModalEditArtist";
import { ModalEditUrl } from "./ModalEditUrl";
import { ModalArtistUpdate } from "./ModalUpdate";
import ArtistsTable from "./TableBody";
import { TableHeader } from "./TableHeader";

export function SubscriberPage() {
  //#region declare
  const id = `<@${useParams().id}>`;
  const {
    useUser: [user],
    useSubscribeData: [subscribeData],
  } = useContext(AuthContext);
  /** @type {import("../../constants/types").State<import("../../constants/types").LoadStatus>} */
  const [loadStatus, setLoadStatus] = useState("loading");
  const [sortState, sortDispatch] = useReducer(tableSortReducer, {
    data: [],
    column: "updateDate",
    direction: "desc",
  });
  const [selected, setSelected] = useState([]);
  const useArtistEdit = useState({ type: null });
  const [, setArtistData] = useArtistEdit;
  //#endregion

  //#region effects
  useEffect(() => {
    // set document title
    document.title = "個人訂閱管理";
  }, []);

  useEffect(() => {
    if (!user || user.status === "user") {
      setLoadStatus("forbidden");
    } else if (!subscribeData) {
      setLoadStatus("failed");
    } else {
      const data = subscribeData.artists?.filter((data) => {
        return data.id === id;
      });

      if (`<@${user.id}>` !== id && user.status !== "manager")
        setLoadStatus("forbidden");
      else {
        sortDispatch({ type: "SET_DATA", data });
        setLoadStatus("success");
      }
    }
  }, [id, subscribeData, user]);
  //#endregion

  return (
    <Container sx={{ height: "80vh" }}>
      <SubscriberPageContext.Provider
        value={{
          useSort: [sortState, sortDispatch],
          useSelected: [selected, setSelected],
          useArtistEdit,
        }}
      >
        <ErrorBoundary /* toolbox */>
          {loadStatus === "success" && (
            <Stack direction="row" spacing={1} sx={{ pb: 1 }}>
              <ModalArtistUpdate id={id} />
              <Button // add artist
                color="success"
                startIcon={<Add />}
                onClick={() => setArtistData({ type: "add" })}
              >
                新增繪師
              </Button>
              <ModalEditUrl id={id} />
              <ModalEditArtist id={id} />
            </Stack>
          )}
        </ErrorBoundary>

        <ErrorBoundary>
          <Paper
            sx={{
              backgroundColor: "rgba(255, 255, 255, .4)",
              borderRadius: "6px",
            }}
          >
            <TableContainer sx={{ height: 1, overflow: "auto" }}>
              <Table size="medium">
                <TableHeader />

                <TableBody>
                  {loadStatus === "success" ? (
                    <ArtistsTable />
                  ) : (
                    <TableLoading status={loadStatus} />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </ErrorBoundary>
      </SubscriberPageContext.Provider>
    </Container>
  );
}
