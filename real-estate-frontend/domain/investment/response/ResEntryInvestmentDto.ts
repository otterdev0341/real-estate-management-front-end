import { BaseDateConverter } from "@/domain/utility/BaseDateConverter";
import ResEntryInvestmentItemDto from "./ResEntryInvestmentItemDto";

export default class ResEntryInvestmentDto extends BaseDateConverter {
    private id: string; // uuid
    private note: string;
    private transaction: string; // uuid
    private property: string;
    private items: ResEntryInvestmentItemDto[];
    private totalInvestedAmount: number;
    private investorCount: number;
    private investmentDate: Date;
    private updatedAt: Date;

    constructor(
        id: string,
        note: string,
        transaction: string,
        property: string,
        items: ResEntryInvestmentItemDto[],
        investmentDate: string,
        updatedAt: string
    ) {
        super();
        this.id = id;
        this.note = note;
        this.transaction = transaction;
        this.property = property;
        this.items = items;
        this.totalInvestedAmount = this.calculateTotalInvestedAmount();
        this.investorCount = items.length;
        this.investmentDate = this.convertStringToDate(investmentDate);
        this.updatedAt = this.convertStringToDate(updatedAt);
    }

    private calculateTotalInvestedAmount(): number {
        if (!this.items || this.items.length === 0) return 0;
        return this.items.reduce((sum, item) => sum + item.getAmount(), 0);
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getNote(): string {
        return this.note;
    }

    public getTransaction(): string {
        return this.transaction;
    }

    public getProperty(): string {
        return this.property;
    }

    public getItems(): ResEntryInvestmentItemDto[] {
        return this.items;
    }

    public getTotalInvestedAmount(): number {
        return this.totalInvestedAmount;
    }

    public getInvestmentDate(): Date {
        return this.investmentDate;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public getInvestorCount(): number {
        return this.investorCount;
    }

    // Setters
    public setId(id: string): void {
        this.id = id;
    }

    public setNote(note: string): void {
        this.note = note;
    }

    public setTransaction(transaction: string): void {
        this.transaction = transaction;
    }

    public setProperty(property: string): void {
        this.property = property;
    }

    public setItems(items: ResEntryInvestmentItemDto[]): void {
        this.items = items;
        this.totalInvestedAmount = this.calculateTotalInvestedAmount();
    }

    public setInvestmentDate(createdAt: Date): void {
        this.investmentDate = createdAt;
    }

    public setUpdatedAt(updatedAt: Date): void {
        this.updatedAt = updatedAt;
    }

    public setInvestorCount(count: number): void {
        this.investorCount = count;
    }
}