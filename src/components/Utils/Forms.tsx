import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grow,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { State } from "../../constants/types";
import { ErrorBoundary } from "./ErrorBoundary";

//#region request result define
interface RequestResult {
  action: string;
}
interface ErrorResult extends RequestResult {
  status: "error";
  reason: string;
}
interface NormalResult extends RequestResult {
  status: "warning" | "success";
}
type SubmitResult = ErrorResult | NormalResult | { status: undefined };
//#endregion

function ResultSnackbar({ useResult }: { useResult: State<SubmitResult> }) {
  const [submitResult, setSubmitResult] = useResult;
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => {
    setOpen(false);
    setSubmitResult({ status: undefined });
  }, [setSubmitResult]);

  useEffect(() => {
    if (submitResult.status) setOpen(true);
  }, [submitResult]);

  return (
    <Snackbar // result alert
      open={open}
      autoHideDuration={5_000}
      onClose={onClose}
    >
      <Alert severity={submitResult.status} onClose={onClose}>
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
  );
}

//#region FormDialog
interface FormDialogProps extends DialogProps {
  title?: string;
  children: ReactNode;
  submitForm?: () => Promise<void>;
  isSubmitting?: boolean;
  onClose: () => void;
  useSubmitResult?: State<SubmitResult>;
  confirmButton?: ReactNode;
  action?: ReactNode;
}
export const FormDialog = (props: FormDialogProps) => {
  const {
    title,
    onClose,
    submitForm,
    isSubmitting,
    useSubmitResult,
    action,
    confirmButton,
    ...dialogProps
  } = props;

  return (
    <>
      <Dialog
        {...dialogProps}
        onClose={() => {
          if (!isSubmitting) onClose(); // not allow to close the dialog when submitting
        }}
        maxWidth="sm"
        fullWidth
        transitionDuration={dialogProps.transitionDuration ?? 350}
        TransitionComponent={dialogProps.TransitionComponent ?? Grow}
        disableEscapeKeyDown={isSubmitting}
      >
        {title && (
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Typography
                sx={{ flexGrow: 1 }}
                variant="inherit"
                color="inherit"
              >
                {title}
              </Typography>
            </Box>
          </DialogTitle>
        )}

        <ErrorBoundary>
          <DialogContent>
            <Stack direction="column" spacing={2}>
              {dialogProps.children}
            </Stack>
          </DialogContent>
        </ErrorBoundary>

        <DialogActions>
          {action ? (
            action
          ) : (
            <>
              <Button
                type="button"
                color="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                取消
              </Button>
              {confirmButton ? (
                confirmButton
              ) : (
                <LoadingButton
                  type="submit"
                  color="primary"
                  variant="contained"
                  onClick={submitForm}
                  loading={isSubmitting}
                >
                  確定
                </LoadingButton>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {useSubmitResult && <ResultSnackbar useResult={useSubmitResult} />}
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
