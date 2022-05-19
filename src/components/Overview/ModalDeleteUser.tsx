import { Delete } from "@mui/icons-material";
import {
  Autocomplete,
  Dialog,
  DialogContent,
  DialogContentText,
  TextField,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import * as yup from "yup";
import { AuthContext } from "../../constants";
import { FormDialog, useFormDialog } from "../Utils";

type SubscriberOption = { name: string; id: string };

function ModalConfirm({}: {}) {
  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <Button onClick={onOpen}>確認</Button>

      <FormDialog open={open} onClose={onClose}>
        <DialogContent></DialogContent>
      </FormDialog>
    </>
  );
}

export default function ModalDeleteUser() {
  const {
    useSubscribeData: [data],
  } = useContext(AuthContext);
  const { open, onOpen, onClose, useSubmitResult } = useFormDialog();
  const [options, setOptions] = useState<SubscriberOption[]>([]);
  const formik = useFormik({
    initialValues: {
      subscriber: "",
    },
    validationSchema: yup.object({
      subscriber: yup.string().required("請選擇一個目標"),
    }),
    onSubmit: async (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  useEffect(() => {
    const options: SubscriberOption[] = [];
    for (let subscriber in data?.subscribers) {
      options.push({
        id: subscriber,
        name: data?.subscribers[subscriber].name,
      });
    }

    setOptions(options);
  }, [data]);

  return (
    <>
      <Button color="error" startIcon={<Delete />} onClick={() => onOpen()}>
        刪除訂閱者
      </Button>

      <FormDialog
        title="訂閱者資料刪除"
        open={open}
        onClose={onClose}
        submitForm={formik.submitForm}
        isSubmitting={formik.isSubmitting}
        useSubmitResult={useSubmitResult}
      >
        <DialogContent>
          <DialogContentText pb={2}>
            <span style={{ fontWeight: "bold", color: "red" }}>
              該動作無法復原
            </span>
            ，拔除訂閱者身分組即可禁止其瀏覽網址資訊且不需刪除資料，請再次確認是否需要刪除資料。
          </DialogContentText>

          <Autocomplete
            onChange={(_, value) => {
              formik.setFieldValue("subscriber", value?.id);
            }}
            options={options}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <li {...props} value={option.id}>
                {option.name}
              </li>
            )}
            renderInput={(param) => (
              <TextField
                label="要刪除的訂閱者"
                {...param}
                name="subscrber"
                required
                error={Boolean(formik.errors.subscriber)}
                helperText={formik.errors.subscriber}
              />
            )}
            clearOnEscape
            autoComplete
          />
        </DialogContent>
      </FormDialog>
    </>
  );
}
