import FileUpload from "@/domain/uploadFile/FileUpload";

export default interface ResEntryPropertyDto {
  id: string;
  name: string;
  description: string;
  specific: string;
  highlight: string;
  area: string;
  price: string;
  fsp: string;
  budget: string;
  currentExpense?: number;
  budgetUsedPercent?: number;
  propertyType?: string[];
  propertyStatus: string;
  ownerBy: string;
  mapUrl: string;
  lat: string;
  lng: string;
  sold?: boolean;
  files: FileUpload[];
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}