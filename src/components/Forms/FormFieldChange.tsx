import { Add, Remove } from "@mui/icons-material";
import { DialogContentText, ButtonGroup, Button } from "@mui/material";
import { FormikTouched } from "formik";

export function FormFieldChange<T>({
  values,
  initialValue,
  fieldName,
  setFieldValue,
  touched,
  resetTouched,
  maxField,
}: {
  values: T[];
  fieldName: string;
  setFieldValue: (field: string, value: T[]) => Promise<any>;
  initialValue: T;
  touched: FormikTouched<T>[] | undefined;
  resetTouched: (field: string, touched: boolean) => Promise<any>;
  maxField?: number;
}) {
  return (
    <>
      <DialogContentText>點擊下方按鈕可新增或減少欄位</DialogContentText>
      <ButtonGroup size="small">
        <Button // add field
          type="button"
          variant="contained"
          disabled={values.length >= (maxField ?? 5)}
          onClick={() => {
            setFieldValue(fieldName, [...values, initialValue]);
          }}
        >
          <Add fontSize="small" />
        </Button>

        <Button // remove field
          type="button"
          variant="contained"
          color="secondary"
          disabled={values.length === 1}
          onClick={() => {
            const index = values.length - 1;
            setFieldValue(fieldName, values.slice(0, -1));
            if (touched?.at(index))
              resetTouched(`${fieldName}.${index - 1}`, false);
          }}
        >
          <Remove fontSize="small" />
        </Button>
      </ButtonGroup>
    </>
  );
}
