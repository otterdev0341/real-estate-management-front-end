import { BaseDateConverter } from "@/domain/utility/BaseDateConverter";
import ReqUpdateInvestmentItemDto from "./ReqUpdateInvestmentItemDto";

export default class ReqUpdateInvestmentDto extends BaseDateConverter {
    private id: string; // uuid or empty
    private createdAt: string;
    private note: string;
    private property: string; // uuid
    private items: ReqUpdateInvestmentItemDto[];

    constructor(
        id: string,
        createdAt: string,
        note: string,
        property: string,
        items: ReqUpdateInvestmentItemDto[]
    ) {
        super();
        this.id = id;
        this.createdAt = createdAt;
        this.note = note;
        this.property = property;
        this.items = items;
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

    public getProperty(): string {
        return this.property;
    }

    public getItems(): ReqUpdateInvestmentItemDto[] {
        return this.items;
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

    public setProperty(property: string): void {
        this.property = property;
    }

    public setItems(items: ReqUpdateInvestmentItemDto[]): void {
        this.items = items;
    }

    public toFormData(): FormData {
        const formData = new FormData();

        const data = {
            note: this.note,
            createdAt: this.createdAt,
            property: this.property,
            items: this.items,
        };

        formData.append("data", JSON.stringify(data));

        return formData;
    }
}