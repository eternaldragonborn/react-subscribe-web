import { Delete } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  DialogContent,
  DialogContentText,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useFormik } from "formik";
import { useCallback, useContext, useEffect, useState } from "react";
import * as yup from "yup";
import { apiRequest, AuthContext, getRequestError } from "../../constants";
import { FormDialog, useFormDialog } from "../Utils";

type SubscriberOption = { name: string | undefined; id: string | undefined };
const initialOption: SubscriberOption = { name: undefined, id: undefined };

function ModalConfirm({
  subscriber,
  submitForm,
  isSubmitting,
}: {
  subscriber: string | undefined;
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const confirmString = useCallback(
    () => `確認刪除訂閱者${subscriber}的資料`,
    [subscriber],
  );
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <LoadingButton
        variant="contained"
        disabled={!Boolean(subscriber)}
        loading={isSubmitting}
        onClick={onOpen}
      >
        確認
      </LoadingButton>

      <FormDialog
        open={open}
        onClose={onClose}
        confirmButton={
          <Button
            type="submit"
            color="primary"
            disabled={confirmInput !== confirmString()}
            onClick={() => {
              onClose();
              submitForm();
            }}
          >
            確定
          </Button>
        }
      >
        <DialogContent>
          <DialogContentText pb={2}>
            為確認執行該操作，請在下方輸入<code>{confirmString()}</code>
          </DialogContentText>

          <TextField
            label="確認訊息"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            required
          />
        </DialogContent>
      </FormDialog>
    </>
  );
}

const action = "刪除訂閱者";

export default function ModalDeleteUser() {
  const {
    useSubscribeData: [data, setData],
  } = useContext(AuthContext);
  const { open, onOpen, onClose, useSubmitResult } = useFormDialog();
  const [options, setOptions] = useState<SubscriberOption[]>([]);
  const [selected, setSelected] = useState<SubscriberOption | null>(
    initialOption,
  );
  const formik = useFormik({
    initialValues: {
      subscriber: "",
    },
    validationSchema: yup.object({
      subscriber: yup.string().required("請選擇一個目標"),
    }),
    onSubmit: async (values) => {
      const [, setResult] = useSubmitResult;
      await apiRequest({ method: "DELETE", url: "/subscriber", data: values })
        .then((res) => {
          if (res.data) {
            setSelected(initialOption);
            setResult({ action, status: "success" });
            setData({ ...res.data });
          } else setResult({ action, status: "warning" });

          onClose();
        })
        .catch((err) =>
          setResult({ action, status: "error", reason: getRequestError(err) }),
        );
    },
  });
  const artists = useCallback(
    () =>
      data?.artists
        .filter((artist) => artist.id === selected?.id)
        .map((artist) => artist.artist),
    [selected],
  );
  const theme = useTheme();

  // options initialize
  useEffect(() => {
    const options: SubscriberOption[] = [{ name: undefined, id: undefined }];
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
        confirmButton={
          <ModalConfirm
            isSubmitting={formik.isSubmitting}
            submitForm={formik.submitForm}
            subscriber={selected?.name}
          />
        }
      >
        <DialogContentText pb={2}>
          <span style={{ fontWeight: "bold", color: "red" }}>
            該動作無法復原
          </span>
          ，拔除訂閱者身分組即可禁止其瀏覽網址資訊且不需刪除資料，請再次確認是否需要刪除資料。
        </DialogContentText>

        <Autocomplete
          value={selected}
          onChange={(_, value) => {
            setSelected(value);
            formik.setFieldValue("subscriber", value?.id);
          }}
          options={options}
          getOptionLabel={(option) => option.name ?? ""}
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

        <DialogContentText display={artists()?.length ? "block" : "none"}>
          <Typography
            fontWeight="bold"
            color="red"
            fontSize={theme.typography.fontSize + 2}
          >
            以下繪師資料也將被刪除：
          </Typography>

          <span style={{ fontWeight: "bold" }}>{artists()?.join("、")}</span>
        </DialogContentText>
      </FormDialog>
    </>
  );
}
