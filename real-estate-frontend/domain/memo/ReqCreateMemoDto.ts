

export default interface ReqCreateMemoDto {
  name: string;
  detail?: string;
  memoType: string; // Assuming UUID is a string in TypeScript
  files?: FileUpload[];
}