import { Backdrop, CircularProgress, Typography } from "@mui/material";

export function BackdropLoading() {
  return (
    <Backdrop open>
      <CircularProgress size={"6rem"} />
      <Typography variant="h2" fontWeight={"bold"} color="white">
        載入頁面中...
      </Typography>
    </Backdrop>
  );
}
