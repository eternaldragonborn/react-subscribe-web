import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useFormik } from "formik";
import { useState, useContext } from "react";
import { FormDialog, useFormDialog } from "../Utils";
import { SubscriberPageContext } from "../../constants";

export function ModalPackUpload() {
  const { open, onClose } = useFormDialog();
  const formik = useFormik({
    initialValues: {
      package: [{ author: "", mark: "", download_url: "" }],
      files: [] as File[],
    },
    onSubmit: (values) => {},
  });

  return (
    <FormDialog title="圖包上傳" open={open} onClose={onClose}>
      <DialogContent></DialogContent>

      <DialogActions>
        <Button type="button" color="secondary" onClick={onClose}>
          取消
        </Button>
        <Button type="submit" color="primary" onClick={formik.submitForm}>
          確定
        </Button>
      </DialogActions>
    </FormDialog>
  );
}
