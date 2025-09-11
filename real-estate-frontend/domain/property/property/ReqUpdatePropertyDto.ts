export default interface ReqUpdatePropertyDto {
  id: string;
  name: string;
  description: string;
  specific: string;
  highlight: string;
  area: string;
  price: number;
  fsp: number;
  budget: number;
  propertyStatus: string;
  ownerBy: string; 
  mapUrl: string;
  lat: string;
  lng: string;
}