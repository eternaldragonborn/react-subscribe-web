import {Warning} from "@mui/icons-material";
import {
  Checkbox,
  Stack,
  TableCell,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {Edit} from "@mui/icons-material";
import _ from "lodash";
import {useContext} from "react";
import {SubscriberPageContext} from "../../constants";

function Row({artist}) {
  const {
    useSelected: [selected, setSelected],
    useArtistEdit: [, setArtistData],
  } = useContext(SubscriberPageContext);
  // const [open, setOpen] = useState(false);

  return (
    <TableRow
      onClick={(e) => {
        if (e.target.localName === "td") {
          e.target.parentElement.querySelector("input").click();
        }
      }}
    >
      <TableCell align="center" padding="checkbox">
        <Checkbox
          checked={selected.includes(artist.artist)}
          onClick={(e) => {
            e.target.checked
              ? setSelected([...selected, artist.artist])
              : setSelected([..._.pull(selected, artist.artist)]);
          }}
        />
      </TableCell>

      <TableCell align="center">
        <IconButton
          size="small"
          onClick={() => {
            setArtistData({
              type: "edit",
              artist: artist.artist,
              mark: artist.mark,
            });
          }}
        >
          <Tooltip title="繪師資訊修改">
            <Edit/>
          </Tooltip>
        </IconButton>
      </TableCell>

      <TableCell>{artist.artist}</TableCell>

      <TableCell>{artist.mark}</TableCell>

      <TableCell>{artist.updateDate}</TableCell>

      <TableCell>
        <Stack justifyItems="center" direction="row">
          <Typography variant="inherit" color="inherit">
            {artist.status}
          </Typography>
          {artist.status === "未更新" && (
            <Warning color="warning" fontSize="small"/>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default function ArtistsTable() {
  const {
    useSort: [sortState],
  } = useContext(SubscriberPageContext);

  return (
    <>
      {sortState.data.map((artist) => {
        return <Row key={artist.artist} artist={artist}/>;
      })}
    </>
  );
}
