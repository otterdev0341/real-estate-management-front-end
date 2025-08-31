export default interface ReqUpdateMemoDto {
  createdAt: string; // ISO date string
  id: string;
  name: string;
  detail?: string;
  memoType: string; // Assuming UUID is a string in TypeScript
  
}