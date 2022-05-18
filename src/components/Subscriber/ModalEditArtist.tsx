import { Add, Remove } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  DialogContent,
  DialogContentText,
  Stack,
  TextField,
} from "@mui/material";
import { FormikErrors, useFormik } from "formik";
import { useContext, useEffect } from "react";
import * as yup from "yup";
import { FieldArtist, FormArtist } from "../../../types";
import {
  apiRequest,
  AuthContext,
  getFormData,
  getRequestError,
  SubscriberPageContext,
} from "../../constants";
import { FormDialog, useFormDialog } from "../Utils";

const validationSchema = yup.object({
  artists: yup.array().of(
    yup.object().shape({
      name: yup.string().required("繪師名不可為空").max(30, "長度上限30字"),
      mark: yup.string().max(20, "長度上限20字"),
    }),
  ),
});

export function ModalEditArtist({ id }: { id: string }) {
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

  useEffect(() => {
    if (artistData.type) {
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
    >
      <DialogContent>
        <Stack direction="column" spacing={2}>
          {artistData.type === "add" && (
            <>
              <DialogContentText>
                點擊下方按鈕可新增或減少欄位
              </DialogContentText>
              <ButtonGroup size="small">
                <Button // add field
                  type="button"
                  variant="contained"
                  disabled={formik.values.artists.length >= 5}
                  onClick={() => {
                    formik.setFieldValue("artists", [
                      ...formik.values.artists,
                      { name: "", mark: "" } as FieldArtist,
                    ]);
                  }}
                >
                  <Add fontSize="small" />
                </Button>
                <Button // remove field
                  type="button"
                  variant="contained"
                  color="secondary"
                  disabled={formik.values.artists.length === 1}
                  onClick={() => {
                    const index = formik.values.artists.length - 1;
                    formik.setFieldValue(
                      "artists",
                      formik.values.artists.slice(0, -1),
                    );
                    if (formik.touched.artists?.at(index))
                      formik.setFieldTouched(`artists.${index - 1}`, false);
                  }}
                >
                  <Remove fontSize="small" />
                </Button>
              </ButtonGroup>
            </>
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
        </Stack>
      </DialogContent>
    </FormDialog>
  );
}
