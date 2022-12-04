import { Add, Edit } from "@mui/icons-material";
import { Button, DialogContentText, TextField } from "@mui/material";
import { useFormik } from "formik";
import { useCallback, useContext, useEffect } from "react";
import * as yup from "yup";
import { FormSubscriber } from "../../../types";
import { apiRequest, AuthContext, getRequestError } from "../../constants";
import { FormDialog, useFormDialog } from "../Forms";
import { Kbd } from "../Utils";

export function ModalEditUrl({ id }: { id: string }) {
  const {
    useSubscribeData: [subscribeData, setData],
  } = useContext(AuthContext);
  const url = subscribeData.subscribers[id];
  const { open, onClose, onOpen, useSubmitResult } =
    useFormDialog<HTMLTextAreaElement>();
  const formik = useFormik<FormSubscriber>({
    initialValues: {
      preview: "",
      download: "",
      id: id,
      mark: "",
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

  const notDirty = useCallback(() => {
    const values = formik.values;
    return (
      values.preview === url?.preview_url &&
      values.download === url?.download_url
    );
  }, [url, formik.values]);

  useEffect(() => {
    if (open)
      formik.setValues({
        preview: url?.preview_url ?? "",
        download: url?.download_url ?? "",
        id,
      });
  }, [open, url, id]);

  return (
    <>
      <Button
        startIcon={url ? <Edit /> : <Add />}
        color={url ? "info" : "success"}
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
        disableSubmit={notDirty()}
      >
        <DialogContentText>
          若不同繪師有不同網址，可輸入多行，並於各行網址前加上
          <code>`繪師名`：</code>
          ，將繪師名以<Kbd>`</Kbd>包覆可有
          <span className="artist-name">強調效果</span>。
        </DialogContentText>

        <TextField
          label="備註："
          name="mark"
          onChange={formik.handleChange}
          value={formik.values.mark}
        />

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
      </FormDialog>
    </>
  );
}
