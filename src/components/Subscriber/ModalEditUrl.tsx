import { Add, Edit } from "@mui/icons-material";
import {
  Button,
  DialogContent,
  DialogContentText,
  Stack,
  TextField,
} from "@mui/material";
import { useFormik } from "formik";
import { useContext, useEffect } from "react";
import * as yup from "yup";
import { FormSubscriber } from "../../../types";
import { apiRequest, AuthContext, getRequestError } from "../../constants";
import { FormDialog, Kbd, useFormDialog } from "../Utils";

export function ModalEditUrl({ id }: { id: string }) {
  const {
    useSubscribeData: [subscribeData, setData],
  } = useContext(AuthContext);
  const url = subscribeData.subscribers[id];
  const { open, onClose, onOpen, useSubmitResult } =
    useFormDialog<HTMLTextAreaElement>();
  const formik = useFormik<FormSubscriber>({
    initialValues: {
      preview: url?.preview_url ?? "",
      download: url?.download_url ?? "",
      id: id,
    },
    onSubmit: async (values) => {
      const action = "網址" + (url ? "更新" : "建檔");
      const [, setResult] = useSubmitResult;

      await apiRequest
        .post("/subscriber", values)
        .then((res) => {
          if (res.data) {
            setResult({
              status: "success",
              action,
            });
            setData({ ...subscribeData, subscribers: res.data });
          } else setResult({ status: "warning", action });
          onClose();
        })
        .catch((err) =>
          setResult({ status: "error", action, reason: getRequestError(err) }),
        );
    },
    validationSchema: yup.object({
      download: yup.string().required("下載網址不可為空"),
    }),
  });

  useEffect(() => {
    if (open)
      formik.setValues({
        preview: url.preview_url,
        download: url.download_url,
        id,
      });
  }, [open, url, id]);

  return (
    <>
      <Button
        startIcon={url ? <Edit /> : <Add />}
        color={url ? "primary" : "success"}
        type="button"
        variant="contained"
        onClick={onOpen}
      >
        {url ? "編輯網址" : "網址建檔"}
      </Button>

      <FormDialog
        open={open}
        onClose={onClose}
        title={"網址編輯"}
        submitForm={formik.submitForm}
        isSubmitting={formik.isSubmitting}
        useSubmitResult={useSubmitResult}
      >
        <DialogContent>
          <Stack direction="column" spacing={2} width={1} alignItems="center">
            <DialogContentText>
              若不同繪師有不同網址，可輸入多行，並於各行網址前加上
              <code>`繪師名`：</code>
              ，將繪師名以<Kbd>`</Kbd>包覆可有
              <span className="artist-name">強調效果</span>。
            </DialogContentText>

            <TextField
              label="預覽網址："
              name="preview"
              multiline
              minRows={3}
              maxRows={6}
              onChange={formik.handleChange}
              value={formik.values.preview}
            />

            <TextField
              label="下載網址："
              name="download"
              multiline
              minRows={3}
              maxRows={6}
              onChange={formik.handleChange}
              value={formik.values.download}
              error={formik.touched.download && Boolean(formik.errors.download)}
              helperText={
                formik.touched.download && (formik.errors.download as String)
              }
              required
            />
          </Stack>
        </DialogContent>
      </FormDialog>
    </>
  );
}
