import FileUpload from "../uploadFile/FileUpload";

export default interface ResEntryMemoDto {
    id: string;
    name: string;
    detail: string;
    memoType: string; // need id by fetching from memoTypeStore
    createdAt: string;
    updatedAt: string;
    files: FileUpload[];
} 