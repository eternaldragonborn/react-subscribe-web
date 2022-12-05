import {Cancel, Lock} from "@mui/icons-material";
import {
  CircularProgress,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {IconHeader} from "./Icons";

/*
 * @param {{status: "loading" | "failed" | "forbidden"}} props
 * @returns
 */
export function TableLoading(props) {
  const {status} = props;

  return (
    <TableRow>
      <TableCell align="center" colSpan={8}>
        <Stack direction={"column"} alignItems={"center"}>
          {status === "loading" && (
            <>
              <CircularProgress size={"5rem"}/>
              <Typography variant="h3" color="initial" fontWeight={"bold"}>
                取得資料中...
              </Typography>
            </>
          )}

          {status === "failed" && (
            <IconHeader
              icon={Cancel}
              iconColor="red"
              header="資料取得失敗，請重新整理或進行回報。"
            />
          )}

          {status === "forbidden" && (
            <IconHeader
              icon={Lock}
              iconColor="red"
              header="沒有權限查看該頁面。"
            />
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

/** display on mobile or aomputer
 * @param {"mobile" | "computer"} display
 * @param {string?} type
 */
export const RwdDisplay = (display, type = "table-cell") => ({
  display: {
    xs: display === "mobile" ? type : "none",
    md: display === "mobile" ? "none" : type,
  },
});
