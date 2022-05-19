import {
  Backdrop,
  CircularProgress,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  Authenticate,
  ErrorBoundary,
  Header,
  Overview,
  SubscriberPage,
} from "./components";
import { apiRequest, AuthContext } from "./constants";
import "./styles/style.css";
import { theme } from "./styles/theme";

function Router() {
  return (
    <>
      <BrowserRouter>
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>

        <ErrorBoundary>
          <Routes>
            <Route path="/subscribe-sys">
              <Route index element={<Overview />} />
              <Route path="subscriber/:id" element={<SubscriberPage />} />
              <Route path="authenticate" element={<Authenticate />} />
              {/* TODO: 建議/問題回報 */}
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <Outlet />
    </>
  );
}

function Content() {
  const [user, setUser] = useState(null);
  const [subscribeData, setSubscribeData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const token = localStorage.getItem("subscribe-web-token");

  useEffect(() => {
    if (token && !user) {
      apiRequest
        .get("/auth/getuser")
        .then((res) => {
          setUser(res.data);
          apiRequest.get("/data/overview").then((res) => {
            setSubscribeData(res.data);
            setLoaded(true);
          });
        })
        .catch(() => {
          localStorage.removeItem("subscribe-web-token");
          setLoaded(true);
        });
      // .finally(() => setLoaded(true));
    } else setLoaded(true);
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        useUser: [user, setUser],
        useSubscribeData: [subscribeData, setSubscribeData],
      }}
    >
      <ErrorBoundary>
        {loaded ? (
          <Router />
        ) : (
          <Backdrop open>
            <CircularProgress size={"6rem"} />
            <Typography variant="h2" fontWeight={"bold"} color="white">
              載入頁面中...
            </Typography>
          </Backdrop>
        )}
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

const root = document.getElementById("root");
createRoot(root).render(
  <>
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <Content />
      </ConfirmProvider>
    </ThemeProvider>
  </>,
);
