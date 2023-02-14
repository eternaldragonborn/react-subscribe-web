import { Logout } from "@mui/icons-material";
import { Box, Button, Container, Stack, Tab, Tabs } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useContext, useEffect, useState } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { AuthContext, discordOauthURL, siteURL } from "../../constants";
import { DiscordIcon, DragonIcon, ErrorBoundary } from "../Utils";

export function Header() {
  const {
    useUser: [user],
  } = useContext(AuthContext);
  const [page, setPage] = useState("overview");
  const location = useLocation();
  const confirm = useConfirm();

  useEffect(() => {
    if (location.pathname === "/subscribe-sys") setPage("overview");
    else if (location.pathname.includes("subscriber")) setPage("subscriber");
  }, [location.pathname]);

  return (
    <>
      <header>
        <Container>
          <Box
            sx={{ display: "flex", py: "0.5rem" }}
            justifyItems="center"
            alignItems="center"
          >
            <img
              src={DragonIcon}
              alt=""
              style={{ height: "40px", width: "auto", paddingRight: "0.5rem" }}
            />

            <ErrorBoundary>
              <Tabs sx={{ flexGrow: 1 }} value={page}>
                <Tab
                  component={RouterLink}
                  to="/subscribe-sys"
                  label="訂閱總覽"
                  value="overview"
                />
                {user && user?.status !== "user" && (
                  <Tab
                    component={RouterLink}
                    to={`/subscribe-sys/subscriber/${user.id}`}
                    label="訂閱資料"
                    value="subscriber"
                  />
                )}
                <Tab label="問題/建議回報" disabled />
              </Tabs>

              <Stack spacing={2} justifyContent="center">
                {user ? (
                  <Button
                    variant="contained"
                    startIcon={<Logout />}
                    onClick={() => {
                      confirm({ description: "確定要登出嗎？", title: "登出" })
                        .then(() => {
                          localStorage.removeItem("subscribe-web-token");
                          window.location.href = siteURL;
                        })
                        .catch(() => {});
                    }}
                    color="error"
                  >
                    登出
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    href={discordOauthURL}
                    startIcon={<DiscordIcon />}
                  >
                    登入
                  </Button>
                )}
              </Stack>
            </ErrorBoundary>
          </Box>
        </Container>
      </header>

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </>
  );
}
