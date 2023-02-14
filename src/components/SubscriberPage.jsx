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
import {
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { AuthContext, SubscriberPageContext } from "../constants";
import { tableSortReducer } from "../reducers";
import { ModalEditUrl, TableHeader } from "./Subscriber";
import { ErrorBoundary, TableLoading } from "./Utils";

const ArtistTable = lazy(() => import("./Subscriber/TableBody"));
const Modals = lazy(() => import("./Subscriber/Modals"));

export default function SubscriberPage() {
  //#region declare
  const id = `<@${useParams().id}>`;
  const {
    useUser: [user],
    useSubscribeData: [subscribeData],
  } = useContext(AuthContext);
  /** @type {import("../constants/types").State<import("../constants/types").LoadStatus>} */
  const [loadStatus, setLoadStatus] = useState("loading");
  const [sortState, sortDispatch] = useReducer(tableSortReducer, {
    data: [],
    column: "updateDate",
    direction: "desc",
  });
  const [selected, setSelected] = useState([]);
  const useArtistEdit = useState({ type: null });
  const [, setArtistData] = useArtistEdit;
  const urls = useCallback(
    () => subscribeData?.subscribers[id],
    [id, subscribeData],
  );
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
          {loadStatus === "success" && user?.status !== "user" && (
            <Stack direction="row" spacing={1} sx={{ pb: 1 }}>
              {urls() && (
                <Suspense>
                  <Modals id={id} />

                  <Button // add artist
                    color="success"
                    startIcon={<Add />}
                    onClick={() => setArtistData({ type: "add" })}
                  >
                    新增繪師
                  </Button>
                </Suspense>
              )}

              <ModalEditUrl id={id} />
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
                    <Suspense fallback={<TableLoading status={loadStatus} />}>
                      <ArtistTable />
                    </Suspense>
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
