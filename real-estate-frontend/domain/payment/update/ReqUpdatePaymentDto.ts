import RequpdatePaymentItemDto from "./ReqUpdatePaymentItemDto";

export default class ReqUpdatePaymentDto {
    private id: string; // UUID
    private paymentDate: string; // ISO 8601 format
    private note: string;
    private contact: string; // UUID
    private property: string; // UUID
    private items: RequpdatePaymentItemDto[];
    

    constructor(
        id: string,
        paymentDate: string,
        note: string,
        contact: string,
        property: string,
        items: RequpdatePaymentItemDto[],
        
    ) {
        this.id = id;
        this.paymentDate = paymentDate;
        this.note = note;
        this.contact = contact;
        this.property = property;
        this.items = items;
        
    }

    // Getters

    public getId(): string {
        return this.id;
    }

    public getPaymentDate(): string {
        return this.paymentDate;
    }

    public getNote(): string {
        return this.note;
    }

    public getContact(): string {
        return this.contact;
    }

    public getProperty(): string {
        return this.property;
    }

    public getItems(): RequpdatePaymentItemDto[] {
        return this.items;
    }


    // Setters

    public setId(id: string): void {
        this.id = id;
    }


    public setPaymentDate(createdAt: string): void {
        this.paymentDate = createdAt;
    }

    public setNote(note: string): void {
        this.note = note;
    }

    public setContact(contact: string): void {
        this.contact = contact;
    }

    public setProperty(property: string): void {
        this.property = property;
    }

    public setItems(items: RequpdatePaymentItemDto[]): void {
        this.items = items;
    }



    public toFormData(): FormData {
        const formData = new FormData();

        const data = {
            note: this.note,
            paymentDate: this.paymentDate,
            contact: this.contact,
            property: this.property,
            items: this.items,
        };

        formData.append("data", JSON.stringify(data));

        return formData;
    }
}