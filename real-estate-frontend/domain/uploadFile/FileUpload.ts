export default interface FileUpload {
  // Assuming a FileUpload object has properties like name, size, type, etc.
  // Adjust these properties to match your backend's FileUpload class.
  id: string;
  fileName: string;
  urlPath: string;
  fileType: string; // image, pdf, other
  fileSize: number;
}

