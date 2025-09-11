


export default interface ReqCreateMemoDto {
  memoDate: Date; // ISO date string
  name: string;
  detail?: string;
  memoType: string; // Assuming UUID is a string in TypeScript
  files?: File[];
}