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

//#region form format
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

export interface FieldPackage {
  author: string;
  mark: string;
  file_link: string;
}
export interface FormUploadPackage extends FormData {
  packages: FieldPackage[];
  files: File[];
}

export interface FieldBook {
  author: string;
  title: string;
  url: string;
  mark: string;
  files: File[];
}
export interface FormBook {
  books: FieldBook[];
}

export interface FormSubscriber extends FormData {
  id: string;
  preview?: string;
  download: string;
}
//#endregion
