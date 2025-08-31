import FileUpload from "../uploadFile/FileUpload";


export default interface ReqCreateMemoDto {
  createdAt: string; // ISO date string
  name: string;
  detail?: string;
  memoType: string; // Assuming UUID is a string in TypeScript
  files?: FileUpload[];
}