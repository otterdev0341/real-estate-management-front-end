

import Pair from "@/implementation/Pair";
import { BaseDateConverter } from "../utility/BaseDateConverter";

export default class ReqUpdateSaleDto extends BaseDateConverter {
    private saleId: string;
    private saleDate: Date;
    private note: string;
    private propertyId: string; // UUID
    private contactId: string;
    private price: number;
    

    

    constructor(
        saleId: string,
        saleDate: Date,
        note: string,
        priopertyId: string,
        contactId: string,
        price: number
        
    ) {
        super();
        this.saleDate = saleDate;
        this.note = note;
        this.propertyId = priopertyId;
        this.contactId = contactId;
        this.price = price;
        this.saleId = saleId;
        
    }

     // Static factory method for no-args creation
    public static createEmpty(): ReqUpdateSaleDto {
        return new ReqUpdateSaleDto('', new Date(), '', '', '', 0);
    }

      // Getters
    public getSaleId(): string {
        return this.saleId;
    }

    public getSaleDate(): Date {
        return this.saleDate;
    }

    public getNote(): string {
        return this.note;
    }

    public getPropertyId(): string {
        return this.propertyId;
    }

    public getContactId(): string {
        return this.contactId;
    }

    public getPrice(): number {
        return this.price;
    }

    // Setters
    public setSaleId(saleId: string): void {
        this.saleId = saleId;
    }

    public setSaleDate(createdAt: Date): void {
        this.saleDate = createdAt;
    }

    public setNote(note: string): void {
        this.note = note;
    }

    public setPropertyId(propertyId: string): void {
        this.propertyId = propertyId;
    }

    public setContactId(contactId: string): void {
        this.contactId = contactId;
    }

    public setPrice(price: number): void {
        this.price = price;
    }



    public toFormData(): FormData {
        const formData = new FormData();
        formData.append('paymentDate', this.formatDateToMicroseconds(this.saleDate));
        formData.append('note', this.note);
        formData.append('propertyId', this.propertyId);
        formData.append('contactId', this.contactId);
         if (!this.price) {
            this.price = 0;
        }
        formData.append('price', this.price.toString());
        return formData;
    }


}