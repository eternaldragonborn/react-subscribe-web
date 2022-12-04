import { Close } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Zoom,
} from "@mui/material";
import { useEffect, useState } from "react";
import { urlReplace } from "../../constants";
import { State } from "../../constants/types";

interface UrlData {
  type: "預覽" | "下載";
  artist: string;
  data: string;
}

type Props = {
  useModalData: State<any>;
};

export default function UrlModal(props: Props) {
  const {
    useModalData: [data, setData],
  } = props;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    //@ts-ignore
    if (!open) setData({});
  }, [open, setData]);

  useEffect(() => {
    if (Object.keys(data).length !== 0) setOpen(true);
  }, [data]);

  return (
    <Dialog
      TransitionComponent={Zoom}
      transitionDuration={350}
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      sx={{ wordBreak: "break-all" }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Typography sx={{ flexGrow: 1 }} variant="inherit" color="inherit">
            {`${data?.artist} 的 ${data?.type}`}
          </Typography>

          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        dividers
        dangerouslySetInnerHTML={{ __html: urlReplace(data?.data) }}
      />
    </Dialog>
  );
}
