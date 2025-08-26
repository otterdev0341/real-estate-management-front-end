export interface ReqCreateContactDto {
  businessName: string;
  internalName?: string;
  detail?: string;
  note?: string;
  contactType: string; // Assuming UUID is represented as a string in TypeScript
  address?: string;
  phone?: string;
  mobilePhone?: string;
  line?: string;
  email?: string;
}