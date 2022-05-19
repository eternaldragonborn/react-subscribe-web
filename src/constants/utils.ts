import axios from "axios";
import { ObjectSchema } from "yup";

export const urlReplace = (url = "") => {
  url = url.replace(/`([^`]*)`/g, '<span class="artist-name">$1</span>');
  url = url.replace(
    /((https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .\-?=#]*)*\/?)/g,
    '<a href="$1" target="_blank">$1</a><br/>',
  );
  url = url.replace(/\\n/g, "<br>");
  return url;
};

export const apiRequest = axios.create({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("subscribe-web-token")}`,
  },
  baseURL: "/api",
  timeout: 10_000,
});

export const validateField = async (
  schema: ObjectSchema<any>,
  field: string | string[],
  values: any,
  error: any,
): Promise<void> => {
  if (Array.isArray(field))
    for (let f of field as string[])
      await schema
        .validateAt(f, values)
        .catch((err) => (error[f] = err.errors[0]));
  else
    await schema
      .validateAt(field, values)
      .catch((err) => (error[field] = err.errors[0]));
};

export const getFormData = (values: any) => {
  const formData = new FormData();
  for (let value in values) {
    if (Array.isArray(values[value]))
      values[value].forEach((d: any) => formData.append(value + "[]", d));
    else formData.append(value, values[value]);
  }

  return formData;
};

export const getRequestError: (error: any) => string = (error: any) => {
  if (error.response) {
    if (error.response.status === 404) return "無效的請求網址";
    else if (error.response.data) return error.response.data;
    else return "未知原因。";
  } else if (error.request) {
    return "伺服器無回應。";
  } else {
    console.log(error.message);
    return "送出資料時發生錯誤。";
  }
};
