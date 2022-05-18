import {
  CloudDownload,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Lock,
  Search,
} from "@mui/icons-material";
import {
  Collapse,
  Divider,
  IconButton,
  Link,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import _ from "lodash";
import React, { Dispatch, useContext, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ArtistData } from "../../../server/constant";
import { AuthContext } from "../../constants";
import { CircleCloseIcon, RwdDisplay } from "../Utils";

function UrlContent(
  artist: string,
  url: { preview_url: string; download_url: string } | null,
  setModalData: Dispatch<any>,
): React.ReactNode[] {
  const contents: React.ReactNode[] = [];

  if (!url)
    // not subscriber
    return _.times(2, () => {
      return (
        <Tooltip title="非訂閱者無法查看">
          <span>
            <IconButton size="small" disabled>
              <Lock sx={{ color: "black" }} />
            </IconButton>
          </span>
        </Tooltip>
      );
    });
  else {
    // subscriber
    // preview
    if (!url.preview_url?.trim() || url.preview_url.trim() === "無") {
      // no preview
      contents[0] = (
        <Tooltip title="該訂閱者無設定預覽網址" arrow>
          <span>
            <IconButton size="small" disabled>
              <CircleCloseIcon sx={{ color: "gray" }} />
            </IconButton>
          </span>
        </Tooltip>
      );
    } else {
      // has preview
      contents[0] = (
        <IconButton
          size="small"
          onClick={() => {
            setModalData({
              type: "預覽",
              artist,
              data: url.preview_url,
            });
          }}
        >
          <Search sx={{ color: "black" }} />
        </IconButton>
      );
    }

    // download
    contents[1] = (
      <IconButton
        size="small"
        onClick={() =>
          setModalData({
            type: "下載",
            artist: artist,
            data: url.download_url,
          })
        }
      >
        <CloudDownload sx={{ color: "black" }} />
      </IconButton>
    );

    return contents;
  }
}

export function Row({
  artist,
  url,
  setModalData,
}: {
  artist: ArtistData;
  url: { preview_url: string; download_url: string } | null;
  setModalData: Dispatch<any>;
}) {
  const {
    useUser: [user],
  } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover onClick={() => setOpen(!open)}>
        <TableCell // collapse icon
          align="center"
          padding="checkbox"
          sx={{ ...RwdDisplay("mobile") }}
        >
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>

        <TableCell>{artist.artist}</TableCell>

        <TableCell sx={{ ...RwdDisplay("computer") }}>{artist.mark}</TableCell>

        <TableCell sx={{ ...RwdDisplay("computer") }}>
          {artist.updateDate}
        </TableCell>

        <TableCell>{artist.status}</TableCell>

        {/* 訂閱者 */}
        <TableCell sx={{ ...RwdDisplay("computer") }}>
          {user.status === "manager" ? (
            <Link
              to={`/subscribe-sys/subscriber/${artist.id.slice(2, -1)}`}
              component={RouterLink}
            >
              {artist.subscriber}
            </Link>
          ) : (
            artist.subscriber
          )}
        </TableCell>

        {UrlContent(artist.artist, url, setModalData).map((cell, n) => {
          return (
            <TableCell
              key={n}
              sx={{ ...RwdDisplay("computer") }}
              align="center"
            >
              {cell}
            </TableCell>
          );
        })}
      </TableRow>

      <TableRow sx={{ ...RwdDisplay("mobile", "table-row") }}>
        <TableCell sx={{ py: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Stack spacing={0.5} sx={{ m: 1 }} divider={<Divider />}>
              <Typography variant="inherit" color="inherit">
                {"備註：" + artist.mark}
              </Typography>

              <Typography variant="inherit" color="inherit">
                {"訂閱者："}
                {user.status === "manager" ? (
                  <Link
                    to={`/subscriber/${artist.id.slice(2, -1)}`}
                    component={RouterLink}
                  >
                    {artist.subscriber}
                  </Link>
                ) : (
                  artist.subscriber
                )}
              </Typography>

              <Typography variant="inherit" color="inherit">
                {"更新日期：" + artist.updateDate}
              </Typography>

              <Stack
                direction="row"
                alignContent="center"
                justifyContent="center"
                spacing={2}
                divider={<Divider orientation="vertical" flexItem />}
              >
                {UrlContent(artist.artist, url, setModalData).map(
                  (content, n) => {
                    return <React.Fragment key={n}>{content}</React.Fragment>;
                  },
                )}
              </Stack>
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
