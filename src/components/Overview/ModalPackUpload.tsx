import { AddPhotoAlternate } from "@mui/icons-material";
import {
  Button,
  Collapse,
  DialogContentText,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { FormikErrors, useFormik } from "formik";
import { useEffect } from "react";
import { TransitionGroup } from "react-transition-group";
import * as yup from "yup";
import { FieldPackage, FormUploadPackage } from "../../../types";
import { apiRequest, getRequestError } from "../../constants";
import {
  FileUpload,
  FormDialog,
  FormFieldChange,
  useFormDialog,
} from "../Forms";

const initialValue: FieldPackage = { author: "", mark: "", file_link: "" };
const validationSchema = yup.object({
  packages: yup.array().of(
    yup.object({
      author: yup.string().required("作者為必填欄位"),
    }),
  ),
});

const action = "圖包上傳";
export function ModalPackUpload() {
  const { open, onOpen, onClose, useSubmitResult } = useFormDialog();
  const formik = useFormik<FormUploadPackage>({
    initialValues: {
      packages: [initialValue],
      files: [] as File[],
    },
    validationSchema,
    onSubmit: async (values) => {
      const [, setResult] = useSubmitResult;
      const data = new FormData();
      data.append("packages", JSON.stringify(values.packages));
      for (let file of values.files) data.append("files[]", file);

      await apiRequest
        .post("/subscriber/package", data)
        .then(() => {
          setResult({ status: "success", action });
          onClose();
        })
        .catch((err) =>
          setResult({ status: "error", action, reason: getRequestError(err) }),
        );
    },
  });

  useEffect(() => {
    if (open) formik.resetForm();
  }, [open]);

  return (
    <>
      <Button color="info" startIcon={<AddPhotoAlternate />} onClick={onOpen}>
        圖包上傳
      </Button>

      <FormDialog
        title="圖包上傳"
        open={open}
        onClose={() => onClose()}
        submitForm={formik.submitForm}
        isSubmitting={formik.isSubmitting}
        useSubmitResult={useSubmitResult}
        contentDivider={<Divider />}
      >
        <DialogContentText>
          此功能為上傳<strong>非常態訂閱</strong>
          之圖包用，若為長期訂閱，請使用更新功能。
        </DialogContentText>

        <FormFieldChange
          values={formik.values.packages}
          fieldName={"packages"}
          initialValue={initialValue}
          setFieldValue={formik.setFieldValue}
          touched={formik.touched.packages}
          resetTouched={formik.setFieldTouched}
        />

        <TransitionGroup>
          {formik.values.packages.map((field, n) => {
            const fieldTouched = formik.touched.packages?.at(n);
            const fieldError = formik.errors.packages?.at(
              n,
            ) as FormikErrors<FieldPackage>;

            return (
              <Collapse key={n}>
                <Stack direction="column" spacing={0.5} pb={1.5}>
                  <Stack direction="row" spacing={0.5}>
                    <TextField
                      label="作者"
                      name={`packages.${n}.author`}
                      value={field.author}
                      onChange={formik.handleChange}
                      error={
                        fieldTouched?.author && Boolean(fieldError?.author)
                      }
                      helperText={fieldTouched?.author && fieldError?.author}
                      required
                    />

                    <TextField
                      label="備註"
                      name={`packages.${n}.mark`}
                      value={field.mark}
                      onChange={formik.handleChange}
                    />
                  </Stack>

                  <TextField
                    label="檔案連結"
                    name={`packages.${n}.file_link`}
                    value={field.file_link}
                    onChange={formik.handleChange}
                    helperText="上傳至雲端後對檔案或資料夾右鍵->取得連結，建議填寫"
                  />
                </Stack>
              </Collapse>
            );
          })}
        </TransitionGroup>

        <FileUpload
          label="附件"
          files={formik.values.files}
          multiple
          onChange={(files) => formik.setFieldValue("files", files)}
        />
      </FormDialog>
    </>
  );
}
