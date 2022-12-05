import {Lock} from "@mui/icons-material";
import {Link, TableCell, TableRow} from "@mui/material";
import {discordOauthURL} from "../../constants";
import {IconHeader} from "../Utils";

export default function TableNotLogin() {
  return (
    <TableRow>
      <TableCell colSpan={8} align="center">
        <IconHeader
          icon={Lock}
          iconSize="5rem"
          headerSize={"h3"}
          header={
            <>
              請先<Link href={discordOauthURL}>登入</Link>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
