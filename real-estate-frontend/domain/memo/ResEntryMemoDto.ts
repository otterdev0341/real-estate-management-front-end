export default interface ResEntryMemoDto {
    id: string;
    detail: string;
    memoType: string; // need id by fetching from memoTypeStore
    files: FileUpload[];
} 