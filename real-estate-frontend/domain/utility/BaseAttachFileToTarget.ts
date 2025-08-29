import FileUpload from "../uploadFile/FileUpload";

export default interface BaseAttachFileToTarget {
    targetId: string;
    file: File;
}