import { BaseDateConverter } from "@/domain/utility/BaseDateConverter";
import ReqCreatePaymentItemDto from "./ReqCreatePaymentItemDto";

export default class ReqCreatePaymentDto extends BaseDateConverter {
    private paymentDate: string; // ISO 8601 format
    private note: string;
    private contact: string; // UUID
    private property: string; // UUID
    private items: ReqCreatePaymentItemDto[];
    private files: Blob[];

    constructor(
        paymentDate: string,
        note: string,
        contact: string,
        property: string,
        items: ReqCreatePaymentItemDto[],
        files: File[] = []
    ) {
        super();
        this.paymentDate = paymentDate;
        this.note = note;
        this.contact = contact;
        this.property = property;
        this.items = items;
        this.files = files;
    }

    // Getters
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

    public getItems(): ReqCreatePaymentItemDto[] {
        return this.items;
    }

    public getFiles(): Blob[] {
        return this.files;
    }

    // Setters
    public setPaymentDate(paymentDate: Date): void {
        this.paymentDate = this.formatDateToMicroseconds(paymentDate);
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

    public setItems(items: ReqCreatePaymentItemDto[]): void {
        this.items = items;
    }

    public setFiles(files: File[]): void {
        this.files = files;
    }

    public toFormData(): FormData {
        const formData = new FormData();

        // Prepare the DTO for the "data" field (matches backend expectation)
        const data = {
            note: this.note,
            paymentDate: this.paymentDate,
            contact: this.contact,
            property: this.property,
            items: this.items,
        };

        formData.append("data", JSON.stringify(data));

        // Attach files (as "files" array)
        if (this.files && this.files.length > 0) {
            this.files.forEach(file => {
                formData.append("files", file);
            });
        }

        return formData;
    }

}