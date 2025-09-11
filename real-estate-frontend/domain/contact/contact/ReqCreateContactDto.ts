export default interface ReqCreateContactDto {
  businessName: string;
  internalName?: string;
  detail?: string;
  note?: string;
  contactType: string; // need id by fetching from contactTypeStore
  address?: string;
  phone?: string;
  mobilePhone?: string;
  line?: string;
  email?: string;
}