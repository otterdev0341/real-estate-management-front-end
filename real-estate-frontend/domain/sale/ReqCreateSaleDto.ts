import { BaseDateConverter } from "../utility/BaseDateConverter";

export default class ReqCreateSaleDto extends BaseDateConverter {
    createdAt: Date;
    note: string;
    propertyId: string; // UUID
    contactId: string;
    price: number;
    files?: Blob[];

    constructor(
        createdAt: Date,
        note: string,
        propertyId: string,
        contactId: string,
        price: number,
        files?: Blob[]
    ) {
        super();
        this.createdAt = createdAt;
        this.note = note;
        this.propertyId = propertyId;
        this.contactId = contactId;
        this.price = price;
        this.files = files;
    }


    public toFormData(): FormData {
        const formData = new FormData();
        formData.append('createdAt', this.formatDateToMicroseconds(this.createdAt));
        formData.append('note', this.note);
        formData.append('propertyId', this.propertyId);
        formData.append('contactId', this.contactId);
        // if price is undefine, or empty string, set to 0
        if (!this.price) {
            this.price = 0;
            formData.append('price', '0');
        }
        formData.append('price', this.price.toString());
        if (this.files) {
            this.files.forEach((file, index) => {
                formData.append(`files`, file);
            });
        }
        return formData;
    }


}