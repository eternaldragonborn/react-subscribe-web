import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogProps,
  DialogTitle,
  Grow,
  Snackbar,
  Typography,
} from "@mui/material";
import { ReactNode, useCallback, useRef, useState } from "react";
import { State } from "../../constants/types";
import { ErrorBoundary } from "./ErrorBoundary";
interface SubmitResult {
  status: "success" | "error" | "warning" | undefined;
  action?: string;
  // message?: string;
  reason?: string;
}

//#region FormDialog
interface FormDialogProps extends DialogProps {
  title?: string;
  children: ReactNode;
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
  useSubmitResult: State<SubmitResult>;
}
export const FormDialog = (props: FormDialogProps) => {
  const {
    title,
    onClose,
    submitForm,
    isSubmitting,
    useSubmitResult: [submitResult, setSubmitResult],
    ...dialogProps
  } = props;

  return (
    <>
      <Dialog
        {...dialogProps}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        transitionDuration={dialogProps.transitionDuration ?? 350}
        TransitionComponent={dialogProps.TransitionComponent ?? Grow}
        disableEscapeKeyDown={isSubmitting}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Typography sx={{ flexGrow: 1 }} variant="inherit" color="inherit">
              {title}
            </Typography>
          </Box>
        </DialogTitle>

        <ErrorBoundary>{dialogProps.children}</ErrorBoundary>

        <DialogActions>
          <Button
            type="button"
            color="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <LoadingButton
            type="submit"
            color="primary"
            variant="contained"
            onClick={submitForm}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            確定
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(submitResult.status)}
        autoHideDuration={5_000}
        onClose={() => setSubmitResult({ status: undefined })}
      >
        <Alert
          severity={submitResult.status}
          onClose={() => setSubmitResult({ status: undefined })}
        >
          {submitResult.status === "error" && (
            <>
              <AlertTitle>{submitResult.action}失敗</AlertTitle>
              原因：<strong>{submitResult.reason}</strong>
            </>
          )}
          {submitResult.status === "success" && `${submitResult.action}成功`}
          {submitResult.status === "warning" && (
            <>
              <AlertTitle>`${submitResult.action}成功`</AlertTitle>
              更新資料失敗，查看新資料請重新整理頁面。
            </>
          )}
        </Alert>
      </Snackbar>
    </>
  );
};
//#endregion

//#region FormDialog hook
export function useFormDialog<T>() {
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const useSubmitResult = useState<SubmitResult>({
    status: undefined,
  });
  const initalFocus = useRef<T>(null);

  return {
    open,
    setOpen,
    onOpen,
    onClose,
    initalFocus,
    useSubmitResult,
  };
}
//#endregion
