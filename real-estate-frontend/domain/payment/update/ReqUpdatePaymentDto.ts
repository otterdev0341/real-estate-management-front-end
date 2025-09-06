import RequpdatePaymentItemDto from "./ReqUpdatePaymentItemDto";

export default class ReqUpdatePaymentDto {
    private id: string; // UUID
    private createdAt: string; // ISO 8601 format
    private note: string;
    private contact: string; // UUID
    private property: string; // UUID
    private items: RequpdatePaymentItemDto[];
    private files: File[];

    constructor(
        id: string,
        createdAt: string,
        note: string,
        contact: string,
        property: string,
        items: RequpdatePaymentItemDto[],
        files: File[] = []
    ) {
        this.id = id;
        this.createdAt = createdAt;
        this.note = note;
        this.contact = contact;
        this.property = property;
        this.items = items;
        this.files = files;
    }

    // Getters

    public getId(): string {
        return this.id;
    }

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

    public getItems(): RequpdatePaymentItemDto[] {
        return this.items;
    }

    public getFiles(): File[] {
        return this.files;
    }

    // Setters

    public setId(id: string): void {
        this.id = id;
    }


    public setCreatedAt(createdAt: string): void {
        this.createdAt = createdAt;
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

    public setFiles(files: File[]): void {
        this.files = files;
    }

    public toFormData(): FormData {
        const formData = new FormData();

        const data = {
            note: this.note,
            createdAt: this.createdAt,
            contact: this.contact,
            property: this.property,
            items: this.items,
        };

        formData.append("data", JSON.stringify(data));

        if (this.files && this.files.length > 0) {
            this.files.forEach(file => {
                formData.append("files", file);
            });
        }

        return formData;
    }
}