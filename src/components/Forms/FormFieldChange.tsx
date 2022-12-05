import {Add, Remove} from "@mui/icons-material";
import {DialogContentText, ButtonGroup, Button, Stack} from "@mui/material";
import {FormikTouched} from "formik";

export function FormFieldChange<T>({
                                     values,
                                     initialValue,
                                     fieldName,
                                     setFieldValue,
                                     touched,
                                     resetTouched,
                                     maxField,
                                     onAdd,
                                     onRemove,
                                   }: {
  values: T[];
  fieldName: string;
  setFieldValue: (field: string, value: T[]) => Promise<any>;
  initialValue: T;
  touched: FormikTouched<T>[] | undefined;
  resetTouched: (field: string, touched: boolean) => Promise<any>;
  maxField?: number;
  onAdd?: () => void;
  onRemove?: () => void;
}) {
  return (
    <Stack direction="row" spacing={1}>
      <ButtonGroup size="small">
        <Button // add field
          type="button"
          variant="contained"
          disabled={values.length >= (maxField ?? 5)}
          onClick={() => {
            if (onAdd) onAdd();
            setFieldValue(fieldName, [...values, initialValue]);
          }}
        >
          <Add fontSize="small"/>
        </Button>

        <Button // remove field
          type="button"
          variant="contained"
          color="secondary"
          disabled={values.length === 1}
          onClick={() => {
            if (onRemove) onRemove();
            const index = values.length - 1;
            setFieldValue(fieldName, values.slice(0, -1));
            if (touched?.at(index))
              resetTouched(`${fieldName}.${index}`, false);
          }}
        >
          <Remove fontSize="small"/>
        </Button>
      </ButtonGroup>
      <DialogContentText>點擊左方按鈕可新增或減少欄位</DialogContentText>
    </Stack>
  );
}
