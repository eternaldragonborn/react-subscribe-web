import {
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
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { AuthContext } from "../constants";
import { tableSortReducer } from "../reducers";
import { TableHeader } from "./Overview";
import { ErrorBoundary, TableLoading } from "./Utils";

const Toolbar = lazy(() => import("./Overview/Toolbar"));
const ModalDeleteUser = lazy(() => import("./Overview/ModalDeleteUser"));
const TableNotLogin = lazy(() => import("./Overview/TableNotLogin"));
const UrlModal = lazy(() => import("./Overview/UrlModal"));
const Row = lazy(() => import("./Overview/TableRow"));

export default function Overview() {
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
    document.title = "訂閱總覽";
  }, []);

  useEffect(() => {
    if (subscribeData) {
      sortStateDispatch({ type: "SET_DATA", data: subscribeData.artists });
      setLoadState("success");
    }
  }, [subscribeData]);

  return (
    <Container>
      <Stack direction="row" pb={1} spacing={1}>
        <Suspense>
          {user?.status === "manager" && subscribeData && <ModalDeleteUser />}
          {subscribeData && user?.status !== "user" && <Toolbar />}
        </Suspense>
        <UrlModal useModalData={[modalData, setModalData]} />
      </Stack>

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
                <Suspense fallback={<TableLoading status="loading" />}>
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
                </Suspense>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </ErrorBoundary>
    </Container>
  );
}
