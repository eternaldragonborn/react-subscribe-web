import { Upload } from "@mui/icons-material";
import {
  Button,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ErrorBoundary } from "./ErrorBoundary";

interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => Promise<any>;
  label: string;
  multiple?: boolean;
  disabled?: boolean;
  accept?: string[];
  required?: boolean;
  bgcolor?: string;
  error?: boolean;
  helperText?: string;
  sizeLimit?: number;
  numLimit?: number;
  onError?: (error: string | undefined) => void;
}
export function FileUpload({
  files,
  onChange,
  label,
  multiple = false,
  disabled = false,
  accept = ["image/*"],
  required = false,
  bgcolor = grey[300],
  error,
  helperText,
  sizeLimit, // KB
  numLimit,
  onError,
}: FileUploadProps) {
  const [title, setTitle] = useState("拖放檔案至此或點擊以選取檔案");
  const [limitText, setLimitText] = useState("");
  const [selectedText, setSelectedText] =
    useState("已選擇 0 個檔案，總大小 0 KB");
  const { isDragActive, isDragReject, getInputProps, getRootProps } =
    useDropzone({
      accept: { "image/*": [] },
      disabled,
      multiple: multiple,
      onDrop: (acceptFiles) => {
        if (acceptFiles.length) onFileSelected(acceptFiles);
      },
    });

  //#region set title
  useEffect(() => {
    if (isDragActive) setTitle("拖放檔案至此");
    else if (isDragReject) setTitle("檔案類型不被接受");
    else setTitle("拖放檔案或點擊此處以選取檔案");
  }, [isDragActive, isDragReject]);
  //#endregion

  //#region set files
  const onFileSelected = useCallback(
    (selectedFiles: File[] | null) => {
      if (!selectedFiles) {
        onChange([]);
        return;
      }

      onChange([...files, ...selectedFiles]);
    },
    [files, onChange],
  );
  //#endregion

  useEffect(() => {
    const size = _.sum(files.map((f) => f.size)) / 1024;
    onChange(files);
    setSelectedText(
      `已選擇 ${files.length} 個檔案，總大小 ${size.toFixed(2)} KB`,
    );

    //#region error check
    if (onError && files) {
      let errorMessage: string | undefined = undefined;
      if (sizeLimit && size > sizeLimit)
        errorMessage = `選擇的總檔案大小：${size.toFixed(
          2,
        )}KB，大小限制 ${sizeLimit} KB`;
      else if (numLimit && files.length > numLimit)
        errorMessage = `選擇了 ${files.length} 個檔案，限制 ${numLimit} 個`;
      else if (required && !files.length) errorMessage = "請選擇檔案";

      onError(errorMessage);
    }
    //#endregion
  }, [files, numLimit, required, sizeLimit]);

  //#region set limit helperText
  useEffect(() => {
    const limits: string[] = [];
    if (numLimit) limits.push(`最多可選 ${numLimit} 個檔案`);
    if (sizeLimit) limits.push(`總大小限制 ${sizeLimit} KB`);

    setLimitText(limits.join(", "));
  }, []);
  //#endregion

  return (
    <ErrorBoundary>
      <Stack direction="column">
        <Stack direction="row" display="flex" alignItems="center">
          <TextField
            variant="filled"
            disabled
            aria-readonly
            multiline
            required={required}
            label={label}
            value={files.map((file) => file.name).join("\n")}
            error={error}
            sx={{ flexGrow: 1 }}
          />
          <Button
            size="small"
            color="secondary"
            sx={{ width: "fit-content" }}
            onClick={(e) => {
              e.preventDefault();
              onFileSelected(null);
            }}
          >
            清空所選
          </Button>
        </Stack>

        <Stack
          direction="column"
          bgcolor={bgcolor}
          sx={{ "&:hover": { bgcolor: alpha(bgcolor, 0.6) } }}
          {...getRootProps()}
          border="1px dotted rgba(0, 0, 0, 0.42)"
          borderTop="none"
        >
          <input {...getInputProps()} />

          <FormHelperText sx={{ pl: "0.5rem" }} error={error}>
            {selectedText}
          </FormHelperText>

          <Stack
            direction="column"
            alignItems="center"
            justifyItems="center"
            p="2rem"
          >
            <Upload fontSize="large" />
            <Typography variant="inherit" color="inherit">
              {title}
            </Typography>
          </Stack>

          <FormHelperText sx={{ pl: "0.5rem" }} error={error}>
            {limitText}
          </FormHelperText>
        </Stack>
      </Stack>
    </ErrorBoundary>
  );
}
