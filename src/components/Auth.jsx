import {Cancel, CheckCircle} from "@mui/icons-material";
import {
  Backdrop,
  CircularProgress,
  Link,
  Stack,
  Typography,
  Zoom,
} from "@mui/material";
import axios from "axios";
import {useContext, useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {AuthContext} from "../constants";
import {IconHeader} from "./Utils";

export default function Authenticate() {
  const [searchParams] = useSearchParams();
  const {
    useUser: [, setUser],
  } = useContext(AuthContext);
  const code = searchParams.get("code");
  const [status, setStatus] = useState("loading");
  const [clock, setClock] = useState(5);

  useEffect(() => {
    if (!code) setStatus("failed");
    else
      axios
        .post("/api/auth/discord", {code: code})
        .then((res) => {
          const token = res.data;
          setStatus("success");
          axios
            .get("/api/auth/getuser", {
              headers: {Authorization: `Bearer ${token}`},
            })
            .then((res) => {
              setUser(res.data);
              localStorage.setItem("subscribe-web-token", token);
              setStatus("success");
            })
            .catch(() => setStatus("failed"));
        })
        .catch(() => {
          setStatus("failed");
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // go back to overview after 5 sec
  useEffect(() => {
    let tick;
    if (status !== "loading") {
      tick = setInterval(() => {
        setClock(clock - 1);
      }, 1000);
    }

    if (clock === 0) {
      window.location.href = "/subscribe-sys";
    }

    return () => clearInterval(tick);
  }, [status, clock]);

  return (
    <Backdrop
      open
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      unselectable
    >
      {status === "loading" && (
        <Stack
          justifyContent={"center"}
          alignItems="center"
          spacing={0}
          direction="column"
        >
          <CircularProgress size={"5rem"}/>
          <Typography variant="h3" fontWeight={"bold"} color="white">
            驗證中...
          </Typography>
        </Stack>
      )}

      <Zoom in={status !== "loading"} mountOnEnter>
        <Stack direction={"column"} spacing={0} alignItems="center">
          <IconHeader
            color={status === "success" ? "green" : "red"}
            icon={status === "success" ? CheckCircle : Cancel}
            header={`驗證${status === "success" ? "成功" : "失敗"}`}
          >
            <Typography variant="h6" color="white" fontWeight="bold">
              <span style={{fontSize: "1.5rem"}}>{clock}</span>
              {" 秒後返回總覽，或"}
              <Link href="/subscribe-sys">立刻返回</Link>
            </Typography>
          </IconHeader>
        </Stack>
      </Zoom>
    </Backdrop>
  );
}
