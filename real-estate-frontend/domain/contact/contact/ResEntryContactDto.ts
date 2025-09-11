export default interface ContactDto {
  id: string;
  businessName: string;
  internalName: string;
  detail: string;
  note: string;
  contactType: string;
  address: string;
  phone: string;
  mobilePhone: string;
  line: string;
  email: string;
}

// table businessName, internalName, contactType, mobilePhone, email