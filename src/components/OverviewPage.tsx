import { Close, Search } from "@mui/icons-material";
import {
  alpha,
  CircularProgress,
  Container,
  InputBase,
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
} from "@mui/material";
import _ from "lodash";
import {
  lazy,
  Suspense,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { ArtistData } from "../../server/constant";
import { AuthContext } from "../constants";
import { tableSortReducer } from "../reducers";
import { TableHeader } from "./Overview";
import { ErrorBoundary, TableLoading } from "./Utils";

const Toolbar = lazy(() => import("./Overview/Toolbar"));
const ModalDeleteUser = lazy(() => import("./Overview/ModalDeleteUser"));
const TableNotLogin = lazy(() => import("./Overview/TableNotLogin"));
const UrlModal = lazy(() => import("./Overview/UrlModal"));
const OverviewTableBody = lazy(() => import("./Overview/TableBody"));

export default function Overview() {
  const {
    useUser: [user],
    useSubscribeData: [subscribeData],
  } = useContext(AuthContext);
  const [modalData, setModalData] = useState({});
  const [loadState, setLoadState] = useState("loading");
  const [sortState, sortStateDispatch] = useReducer(tableSortReducer, {
    searching: false,
    column: "updateDate",
    data: [],
    direction: "desc",
  });
  const [searchWord, setSearchWord] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(timeoutRef.current);

    if (!searchWord) {
      sortStateDispatch({ type: "CLEAR_SEARCH" });
      return;
    }

    sortStateDispatch({ type: "START_SEARCH", value: searchWord });

    const regex = new RegExp(`${searchWord}`, "i");
    const isMatch = (data: ArtistData) => {
      const test = [
        regex.test(data.artist),
        regex.test(data.mark ?? ""),
        regex.test(data.subscriber),
      ];

      return test.includes(true);
    };
    const filtered = _.filter(sortState.data, isMatch);

    timeoutRef.current = setTimeout(() => {
      sortStateDispatch({
        type: "END_SEARCH",
        filtered,
      });
    }, 300);
  }, [searchWord]);

  useEffect(() => {
    document.title = "訂閱總覽";

    return () => clearTimeout(timeoutRef.current);
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

      <Stack // search box
        direction="row"
        sx={{
          bgcolor: (theme) => alpha(theme.palette.common.white, 0.5),
          "&:hover": (theme) => alpha(theme.palette.common.white, 0.7),
          minWidth: "300px",
          width: "10vh",
          borderRadius: 2,
          mb: 1,
          p: 0.75,
          alignItems: "center",
        }}
      >
        <label htmlFor="search-box" style={{ alignItems: "center" }}>
          <Search sx={{ px: 0.5 }} />
        </label>
        <InputBase
          id="search-box"
          sx={{ flexGrow: 1 }}
          placeholder="搜尋..."
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />

        {sortState.searching ? (
          <CircularProgress size="20px" />
        ) : (
          <Close
            sx={{ color: (theme) => theme.palette.grey[700] }}
            onClick={() => setSearchWord("")}
          />
        )}
      </Stack>

      <ErrorBoundary>
        <Paper
          sx={{
            backgroundColor: (theme) => alpha(theme.palette.common.white, 0.4),
            borderRadius: "6px",
          }}
        >
          <TableContainer sx={{ height: "80vh", overflow: "auto" }}>
            <Table stickyHeader size="medium" sx={{ height: "100%" }}>
              <TableHeader useSortState={[sortState, sortStateDispatch]} />

              <TableBody>
                <Suspense fallback={<TableLoading status="loading" />}>
                  {user ? (
                    <OverviewTableBody
                      {...{ sortState, searchWord, loadState, setModalData }}
                    />
                  ) : (
                    <TableNotLogin />
                  )}
                </Suspense>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </ErrorBoundary>
    </Container>
  );
}
