export default interface ReqUpdateMemoDto {
  memoDate: String; // ISO date string
  id: string;
  name: string;
  detail?: string;
  memoType: string; // Assuming UUID is a string in TypeScript
  
}