import {ThemeProvider} from "@mui/material";
import {ConfirmProvider} from "material-ui-confirm";
import {lazy, StrictMode, Suspense, useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {BackdropLoading, ErrorBoundary, Header} from "./components";
import {apiRequest, AuthContext, SubscribeData, UserData} from "./constants";
import "./styles/style.css";
import {theme} from "./styles/theme";

const Overview = lazy(() => import("./components/OverviewPage"));
const SubscriberPage = lazy(() => import("./components/SubscriberPage"));
const Authenticate = lazy(() => import("./components/Auth"));

function Router() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<BackdropLoading/>}>
          <Routes>
            <Route path="/subscribe-sys" element={<Header/>}>
              <Route path="" element={<Overview/>}/>
              <Route path="subscriber/:id" element={<SubscriberPage/>}/>
              <Route path="authenticate" element={<Authenticate/>}/>
              {/* TODO: no match */}
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function Content() {
  const [user, setUser] = useState<UserData>(undefined!);
  const [subscribeData, setSubscribeData] = useState<SubscribeData>(undefined!);
  const token = localStorage.getItem("subscribe-web-token");

  useEffect(() => {
    if (token && !user) {
      apiRequest
        .get("/auth/getuser")
        .then((res) => {
          setUser(res.data);
          apiRequest.get("/data/overview").then((res) => {
            setSubscribeData(res.data);
          });
        })
        .catch(() => {
          localStorage.removeItem("subscribe-web-token");
        });
    }
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{
        useUser: [user, setUser],
        useSubscribeData: [subscribeData, setSubscribeData],
      }}
    >
      <ErrorBoundary>
        <Router/>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <Content/>
      </ConfirmProvider>
    </ThemeProvider>
  </StrictMode>,
);
