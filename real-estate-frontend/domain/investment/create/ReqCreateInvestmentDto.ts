import { BaseDateConverter } from "@/domain/utility/BaseDateConverter";
import ReqCreateInvestmentItemDto from "./ReqCreateInvestmentItemDto";

export default class ReqCreateInvestmentDto extends BaseDateConverter {
    private investmentDate: string; // ISO 8601 format
    private note: string;
    private property: string; // UUID
    private items: ReqCreateInvestmentItemDto[];
    private files: Blob[];

    constructor(
        investmentDate: string,
        note: string,
        property: string,
        items: ReqCreateInvestmentItemDto[],
        files: File[] = []
    ) {
        super();
        this.investmentDate = investmentDate;
        this.note = note;
        this.property = property;
        this.items = items;
        this.files = files;
    }

    // Getters
    public getInvestmentDate(): string {
        return this.investmentDate;
    }

    public getNote(): string {
        return this.note;
    }

    public getProperty(): string {
        return this.property;
    }

    public getItems(): ReqCreateInvestmentItemDto[] {
        return this.items;
    }

    public getFiles(): Blob[] {
        return this.files;
    }

    // Setters
    public setInvestmentDate(createdAt: Date): void {
        this.investmentDate = this.formatDateToMicroseconds(createdAt);
    }

    public setNote(note: string): void {
        this.note = note;
    }

    public setProperty(property: string): void {
        this.property = property;
    }

    public setItems(items: ReqCreateInvestmentItemDto[]): void {
        this.items = items;
    }

    public setFiles(files: File[]): void {
        this.files = files;
    }

    public toFormData(): FormData {
        const formData = new FormData();

        const data = {
            note: this.note,
            investmentDate: this.investmentDate,
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