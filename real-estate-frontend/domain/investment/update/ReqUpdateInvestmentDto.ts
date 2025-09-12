import { BaseDateConverter } from "@/domain/utility/BaseDateConverter";
import ReqUpdateInvestmentItemDto from "./ReqUpdateInvestmentItemDto";

export default class ReqUpdateInvestmentDto extends BaseDateConverter {
    private id: string; // uuid or empty
    private investmentDate: string;
    private note: string;
    private property: string; // uuid
    private items: ReqUpdateInvestmentItemDto[];

    constructor(
        id: string,
        investmentDate: string,
        note: string,
        property: string,
        items: ReqUpdateInvestmentItemDto[]
    ) {
        super();
        this.id = id;
        this.investmentDate = investmentDate;
        this.note = note;
        this.property = property;
        this.items = items;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getInvestmentDate(): string {
        return this.investmentDate;
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

    public setInvestmentDate(createdAt: Date): void {
        this.investmentDate = this.formatDateToMicroseconds(createdAt);
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
            investmentDate: this.investmentDate,
            property: this.property,
            items: this.items,
        };

        formData.append("data", JSON.stringify(data));

        return formData;
    }
}