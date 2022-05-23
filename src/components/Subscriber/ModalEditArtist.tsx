import { Stack, TextField } from "@mui/material";
import { FormikErrors, useFormik } from "formik";
import { useCallback, useContext, useEffect } from "react";
import * as yup from "yup";
import { FieldArtist, FormArtist } from "../../../types";
import {
  apiRequest,
  AuthContext,
  getRequestError,
  SubscriberPageContext,
} from "../../constants";
import { FormDialog, FormFieldChange, useFormDialog } from "../Forms";

const validationSchema = yup.object({
  artists: yup.array().of(
    yup.object().shape({
      name: yup.string().required("繪師名不可為空").max(30, "長度上限30字"),
      mark: yup.string().max(20, "長度上限20字"),
    }),
  ),
});
const initialValue: FieldArtist = { name: "", mark: "" };

export default function ModalEditArtist({ id }: { id: string }) {
  const {
    useArtistEdit: [artistData, setArtistData],
  } = useContext(SubscriberPageContext);
  const {
    useSubscribeData: [data, setData],
  } = useContext(AuthContext);
  const { open, setOpen, onClose, useSubmitResult } =
    useFormDialog<HTMLDivElement>();
  const formik = useFormik<FormArtist>({
    initialValues: {
      id,
      artists: [
        {
          artist: artistData.artist,
          name: artistData.artist ?? "",
          mark: artistData.mark ?? "",
        },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      const [, setResult] = useSubmitResult;
      const action = artistData.type === "add" ? "新增" : "更改";

      await apiRequest
        .request({
          url: "/artist",
          method: artistData.type === "add" ? "POST" : "PATCH",
          data: values,
        })
        .then((res) => {
          if (res.data) {
            setData({ ...data, artists: res.data });
            setResult({
              status: "success",
              action,
            });
          } else setResult({ status: "warning", action });
          onClose();
        })
        .catch((err) => {
          setResult({ status: "error", action, reason: getRequestError(err) });
        });
    },
  });

  const isDirty = useCallback(() => {
    if (artistData.type === "edit") {
      const values = formik.values.artists[0];
      return (
        values.name !== artistData.artist || values.mark !== artistData.mark
      );
    } else return true;
  }, [artistData, formik.values.artists[0]]);

  // reset fields
  useEffect(() => {
    if (artistData.type && artistData.type !== "delete") {
      formik.setTouched({ artists: [] });

      if (artistData.type === "edit") {
        formik.setValues({
          id,
          artists: [
            {
              artist: artistData.artist,
              name: artistData.artist!!,
              mark: artistData.mark!!,
            },
          ],
        });
      } else {
        formik.setValues({
          id,
          artists: [
            {
              artist: undefined,
              name: "",
              mark: "",
            },
          ],
        });
      }

      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistData]);

  return (
    <FormDialog
      title={formik.values.artists[0].artist ? "繪師資訊更改" : "繪師新增"}
      submitForm={formik.submitForm}
      isSubmitting={formik.isSubmitting}
      useSubmitResult={useSubmitResult}
      onClose={() => {
        onClose();
        setArtistData({ type: null });
      }}
      open={open}
      disableSubmit={!isDirty()}
    >
      {artistData.type === "add" && (
        <FormFieldChange
          values={formik.values.artists}
          fieldName="artists"
          setFieldValue={formik.setFieldValue}
          initialValue={initialValue}
          touched={formik.touched.artists}
          resetTouched={formik.setFieldTouched}
        />
      )}

      {formik.values.artists.map((field, n) => {
        const fieldTouched = formik.touched.artists?.at(n);
        const fieldErrors = formik.errors.artists?.at(
          n,
        ) as FormikErrors<FieldArtist>;

        return (
          <Stack direction="row" spacing={0.5} key={n}>
            <TextField
              name={`artists.${n}.name`}
              label="繪師名"
              required
              error={fieldTouched?.name && Boolean(fieldErrors?.name)}
              helperText={fieldTouched?.name && fieldErrors?.name}
              value={field.name}
              onChange={formik.handleChange}
            />

            <TextField
              name={`artists.${n}.mark`}
              label="備註"
              error={Boolean(fieldErrors?.mark)}
              helperText={fieldErrors?.mark}
              value={field.mark}
              onChange={formik.handleChange}
            />
          </Stack>
        );
      })}
    </FormDialog>
  );
}
