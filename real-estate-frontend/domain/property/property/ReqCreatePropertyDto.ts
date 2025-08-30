export default interface ReqCreatePropertyDto {
  name: string;
  description: string;
  specific: string;
  highlight: string;
  area: string;
  price: number;
  fsp: number;
  maximumBudget: number;
  propertyStatus: string; // property status Id
  ownerBy: string; // contact Id
  mapUrl: string;
  lat: string;
  lng: string;
  files: File[];
}