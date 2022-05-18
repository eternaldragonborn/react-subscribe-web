declare module "*.png";
declare module "*.svg";

export enum UpdateStatus {
  normal,
  newSubscribe,
  noUpdate,
  unSubscribed,
}
export type StatusOptions = "update" | "noupdate" | "unsubscribe" | "delete";
export const Status: { [key: string]: UpdateStatus } = {
  update: UpdateStatus.normal,
  noupdate: UpdateStatus.noUpdate,
  unsubscribe: UpdateStatus.unSubscribed,
  // "delete":
};

interface FormData {
  [field: string]: any;
}

export interface FieldArtist {
  artist?: string;
  name: string;
  mark: string;
}
export interface FormArtist extends FormData {
  id: string;
  artists: FieldArtist[];
}

export interface FormUpdate extends FormData {
  id: string;
  artist: string[];
  status: StatusOptions;
  file_link?: string;
  mark?: string;
  attachments?: File[];
}

export interface FormUploadPackage extends FormData {}

export interface FormSubscriber extends FormData {
  id: string;
  preview?: string;
  download: string;
}
