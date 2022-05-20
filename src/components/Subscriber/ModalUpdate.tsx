import { AddToDrive, Help } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Method } from "axios";
import { FormikErrors, useFormik } from "formik";
import { useCallback, useContext, useEffect } from "react";
import * as yup from "yup";
import { FormUpdate, StatusOptions } from "../../../types";
import {
  apiRequest,
  AuthContext,
  getFormData,
  getRequestError,
  SubscriberPageContext,
  validateField,
} from "../../constants";
import { FileUpload, FormDialog, useFormDialog } from "../Utils";

const StatusValues: { [status: string]: number } = {
  update: 0,
  noupdate: 2,
  unsubscribe: 3,
  delete: -1,
};

const validSchema = yup.object().shape({
  artist: yup.array().of(yup.string()).min(1, "至少需選擇一繪師"),
  status: yup
    .string()
    .required("請選擇更新狀態")
    .oneOf(Object.keys(StatusValues), "無效的選項"),
});

export default function ModalArtistUpdate({ id }: { id: string }) {
  const {
    useUser: [user],
    useSubscribeData: [data, setData],
  } = useContext(AuthContext);
  const {
    useSort: [sortState],
    useSelected: [selected, setSelected],
  } = useContext(SubscriberPageContext);
  const { open, onClose, onOpen, useSubmitResult } = useFormDialog();
  const formik = useFormik<FormUpdate>({
    initialValues: {
      id,
      artist: [] as string[],
      status: "" as StatusOptions,
      file_link: "",
      mark: "",
      attachments: [] as File[],
    },
    validate: async (values) => {
      const errors: FormikErrors<typeof values> = {};

      await validateField(validSchema, ["artist", "status"], values, errors);
      if (formik.errors.attachments)
        errors.attachments = formik.errors.attachments;

      return errors;
    },
    onSubmit: async (values) => {
      const [, setSubmitResult] = useSubmitResult;
      const formData = getFormData(values);

      if (values.status === "delete") formData.delete("attachments");

      await apiRequest
        .request({
          url: "/artist",
          method: values.status === "delete" ? "DELETE" : ("NOTIFY" as Method),
          data: formData,
        })
        .then((res) => {
          if (res.data) {
            setSubmitResult({ status: "success", action: "更新" });
            setData({ ...data, artists: res.data });
          } else setSubmitResult({ status: "warning", action: "更新" });
          formik.resetForm();
          setSelected([]);
        })
        .catch((err) => {
          const reason = getRequestError(err);
          setSubmitResult({ status: "error", action: "更新", reason });
        });
    },
  });
  let artists = sortState.data.map((d) => d.artist);

  useEffect(() => {
    formik.setFieldValue("artist", selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <>
      <Button onClick={onOpen} startIcon={<AddToDrive />}>
        更新繪師
      </Button>

      <FormDialog
        open={open}
        onClose={onClose}
        title="繪師更新"
        isSubmitting={formik.isSubmitting}
        submitForm={formik.submitForm}
        useSubmitResult={useSubmitResult}
      >
        <FormControl // artists
          required
          error={Boolean(formik.errors.artist)}
        >
          <FormLabel>繪師：</FormLabel>
          <Grid container columns={12} spacing={2}>
            {!artists.length && <Grid item>請先新增繪師</Grid>}
            {artists.map((artist) => {
              return (
                <Grid item key={artist} xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="artist"
                        value={artist}
                        onChange={formik.handleChange}
                        checked={formik.values.artist.includes(artist)}
                      />
                    }
                    label={artist}
                  />
                </Grid>
              );
            })}
          </Grid>
          <FormHelperText error>{formik.errors.artist}</FormHelperText>
        </FormControl>

        <FormControl // status
          required
          error={formik.touched.status && Boolean(formik.errors.status)}
        >
          <InputLabel id="status-select-label">狀態</InputLabel>
          <Select
            variant="filled"
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            label="狀態"
            labelId="status-select-label"
          >
            <MenuItem value={"update"}>更新</MenuItem>
            <MenuItem value={"noupdate"}>本月無更新</MenuItem>
            <MenuItem value={"unsubscribe"}>取消訂閱</MenuItem>
            <MenuItem value={"delete"}>刪除資料</MenuItem>
          </Select>
          <FormHelperText error>
            {formik.touched.status && formik.errors.status}
            {formik.values.status === "delete" &&
              "該動作無法復原，除非雲端中已無該繪師圖包，否則不建議刪除，請再次確認"}
          </FormHelperText>
        </FormControl>

        <TextField
          label="備註"
          name="mark"
          value={formik.values.mark}
          onChange={formik.handleChange}
        />

        <TextField // file link
          label={
            <Typography align="center">
              {"檔案連結"}
              <Tooltip title="檔案的直接下載連結，若有多個檔案可輸入多行">
                <Help fontSize="inherit" color="primary" />
              </Tooltip>
            </Typography>
          }
          multiline
          name="file_link"
          value={formik.values.file_link}
          onChange={formik.handleChange}
        />

        <FileUpload
          label="附件(可多選，總大小限制5MB內)"
          files={formik.values.attachments!}
          onChange={async (files) =>
            await formik.setFieldValue("attachments", files, false)
          }
          multiple
          sizeLimit={5 * 1024}
          onError={useCallback(
            (error: string | undefined) =>
              formik.setFieldError("attachments", error),
            [],
          )}
          error={Boolean(formik.errors.attachments)}
          helperText={formik.errors.attachments as string}
        />
      </FormDialog>
    </>
  );
}
