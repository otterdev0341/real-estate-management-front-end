import { BaseDateConverter } from "@/domain/utility/BaseDateConverter";
import ReqCreatePaymentItemDto from "./ReqCreatePaymentItemDto";

export default class ReqCreatePaymentDto extends BaseDateConverter {
    private createdAt: string; // ISO 8601 format
    private note: string;
    private contact: string; // UUID
    private property: string; // UUID
    private items: ReqCreatePaymentItemDto[];
    private files: Blob[];

    constructor(
        createdAt: string,
        note: string,
        contact: string,
        property: string,
        items: ReqCreatePaymentItemDto[],
        files: File[] = []
    ) {
        super();
        this.createdAt = createdAt;
        this.note = note;
        this.contact = contact;
        this.property = property;
        this.items = items;
        this.files = files;
    }

    // Getters
    public getCreatedAt(): string {
        return this.createdAt;
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
    public setCreatedAt(createdAt: Date): void {
        this.createdAt = this.formatDateToMicroseconds(createdAt);
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
            createdAt: this.createdAt,
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