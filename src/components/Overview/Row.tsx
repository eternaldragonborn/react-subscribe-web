import {CloudDownload, Lock, Search} from "@mui/icons-material";
import {IconButton, Link, TableCell, TableRow, Tooltip} from "@mui/material";
import _ from "lodash";
import React, {Dispatch, useContext, useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {ArtistData} from "../../../server/constant";
import {AuthContext} from "../../constants";
import {CircleCloseIcon} from "../Utils";

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
              <Lock sx={{color: "black"}}/>
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
              <CircleCloseIcon sx={{color: "gray"}}/>
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
          <Search sx={{color: "black"}}/>
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
        <CloudDownload sx={{color: "black"}}/>
      </IconButton>
    );

    return contents;
  }
}

export default function Row({
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
    <TableRow hover onClick={() => setOpen(!open)}>
      <TableCell>{artist.artist}</TableCell>

      <TableCell>{artist.mark}</TableCell>

      <TableCell>{artist.updateDate}</TableCell>

      <TableCell>{artist.status}</TableCell>

      {/* 訂閱者 */}
      <TableCell>
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
          <TableCell key={n} align="center">
            {cell}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
