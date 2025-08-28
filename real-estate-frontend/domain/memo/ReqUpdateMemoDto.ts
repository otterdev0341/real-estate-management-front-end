export default interface ReqUpdateMemoDto {
  id: string;
    name: string;
  detail?: string;
  memoType: string; // Assuming UUID is a string in TypeScript
  
}