import {
  NavigateBefore,
  NavigateNext,
  UploadFileRounded,
} from "@mui/icons-material";
import {
  Button,
  DialogContentText,
  IconButton,
  LinearProgress,
  Slide,
  Stack,
  TextField,
} from "@mui/material";
import { FormikErrors, useFormik } from "formik";
import { useCallback, useRef, useState } from "react";
import { TransitionGroup } from "react-transition-group";
import * as yup from "yup";
import { FieldBook } from "../../../types";
import { apiRequest, getFormData } from "../../constants";
import {
  FileUpload,
  FormDialog,
  FormFieldChange,
  useFormDialog,
} from "../Forms";

const initialValue: FieldBook = {
  author: "",
  title: "",
  url: "",
  mark: "",
  files: [],
};
const validationSchema = yup.object({
  books: yup.array().of(
    yup.object({
      title: yup.string().required("請輸入標題"),
      files: yup.array().min(1, "預覽圖為必要項目"),
      url: yup.string().required("請輸入下載網址").url("不合法的網址格式"),
    }),
  ),
});
const action = "本本上傳";

export function ModalBookUpload() {
  const { open, onOpen, onClose, useSubmitResult } = useFormDialog();
  const [fieldNum, setFieldNum] = useState(0);
  const [progress, setProgress] = useState(0);
  const formik = useFormik<{ books: FieldBook[] }>({
    validationSchema,
    initialValues: { books: [initialValue] },
    onSubmit: async (values) => {
      let failedCount = 0;
      const [, setResult] = useSubmitResult;
      setProgress(0);

      // send request
      for (let n = 0; n < values.books.length; n++) {
        const data = getFormData(values.books[n]);

        await apiRequest
          .post("/subscriber/book", data)
          .then(() => {})
          .catch((err) => {
            failedCount++;
          })
          .finally(() => setProgress(progress + 1));
      }

      // show result
      // TODO: show failresult
      if (failedCount === values.books.length)
        // add failed
        setResult({ status: "error", action, reason: "" });
      else if (failedCount)
        // partical failed
        setResult({
          status: "warning",
          action,
          message: `${
            values.books.length - failedCount
          } 本上傳成功\n${failedCount} 本上傳失敗`,
        });
      else {
        // success
        setResult({ status: "success", action });
        onClose();
      }
    },
  });
  // const dialogRef = useRef<HTMLDivElement>(null);

  const fieldTouched = useCallback(
    () => formik.touched.books?.at(fieldNum),
    [fieldNum, formik.touched.books],
  );
  const fieldError = useCallback(
    () => (formik.errors.books as FormikErrors<FieldBook>[])?.at(fieldNum),
    [fieldNum, formik.errors.books],
  );
  const progressCount = useCallback(
    (n: number) => (n / formik.values.books.length) * 100,
    [formik.values.books.length],
  );

  return (
    <>
      <Button
        color="info"
        startIcon={<UploadFileRounded />}
        onClick={() => {
          setFieldNum(0);
          setProgress(0);
          formik.resetForm();
          onOpen();
        }}
      >
        本本上傳
      </Button>

      <FormDialog
        title="本本上傳"
        open={open}
        onClose={onClose}
        submitForm={formik.submitForm}
        isSubmitting={formik.isSubmitting}
        useSubmitResult={useSubmitResult}
        spacing={1}
        // ref={dialogRef}
      >
        <FormFieldChange
          values={formik.values.books}
          fieldName="books"
          setFieldValue={formik.setFieldValue}
          initialValue={initialValue}
          touched={formik.touched.books}
          resetTouched={formik.setFieldTouched}
          onRemove={() => {
            if (fieldNum === formik.values.books.length - 1)
              setFieldNum(fieldNum - 1);
          }}
        />

        <DialogContentText>
          本本資料({fieldNum + 1} / {formik.values.books.length})：
        </DialogContentText>

        <Stack direction="row" display="flex" alignItems="center">
          <IconButton
            onClick={() => setFieldNum(fieldNum - 1)}
            disabled={fieldNum === 0}
          >
            <NavigateBefore />
          </IconButton>

          {/* <TransitionGroup>
            <Slide direction="left" unmountOnExit container={dialogRef.current}> */}
          <Stack direction="column" flexGrow={1} spacing={2}>
            <TextField
              label="繪師"
              name={`books.${fieldNum}.author`}
              value={formik.values.books[fieldNum].author}
              onChange={formik.handleChange}
            />

            <TextField
              label="標題"
              name={`books.${fieldNum}.title`}
              value={formik.values.books[fieldNum].title}
              error={fieldTouched()?.title && Boolean(fieldError()?.title)}
              helperText={fieldTouched()?.title && fieldError()?.title}
              onChange={formik.handleChange}
              required
            />

            <TextField
              label="下載網址"
              name={`books.${fieldNum}.url`}
              value={formik.values.books[fieldNum].url}
              onChange={formik.handleChange}
              error={fieldTouched()?.url && Boolean(fieldError()?.url)}
              helperText={fieldTouched()?.url && fieldError()?.url}
              required
            />

            <TextField
              label="備註(可輸入多行)"
              name={`books.${fieldNum}.mark`}
              value={formik.values.books[fieldNum].mark}
              onChange={formik.handleChange}
              multiline
              maxRows={3}
            />

            <FileUpload
              label="預覽圖"
              files={formik.values.books[fieldNum].files}
              onChange={(files) =>
                formik.setFieldValue(`books.${fieldNum}.files`, files)
              }
              onError={(error) =>
                formik.setFieldError(`books.${fieldNum}.files`, error)
              }
              error={Boolean(fieldError()?.files)}
              helperText={fieldError()?.files as string}
              required
            />
          </Stack>
          {/* </Slide>
          </TransitionGroup> */}

          <IconButton
            onClick={() => setFieldNum(fieldNum + 1)}
            disabled={fieldNum === formik.values.books.length - 1}
          >
            <NavigateNext />
          </IconButton>
        </Stack>

        {formik.isSubmitting && (
          <>
            <DialogContentText fontWeight="bold">上傳進度：</DialogContentText>
            <LinearProgress
              value={progressCount(progress)}
              valueBuffer={progressCount(progress + 1)}
              variant="buffer"
            />
          </>
        )}
      </FormDialog>
    </>
  );
}
