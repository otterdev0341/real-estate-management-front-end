export default class ResEntryInvestmentItemDto {
    private id: string; // uuid
    private investTransaction: string; // uuid
    private contact: string;
    private amount: number;
    private percent: number;

    constructor(
        id: string,
        investTransaction: string,
        contact: string,
        amount: number,
        percent: number
    ) {
        this.id = id;
        this.investTransaction = investTransaction;
        this.contact = contact;
        this.amount = amount;
        this.percent = percent;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getInvestTransaction(): string {
        return this.investTransaction;
    }

    public getContact(): string {
        return this.contact;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getPercent(): number {
        return this.percent;
    }

    // Setters
    public setId(id: string): void {
        this.id = id;
    }

    public setInvestTransaction(investTransaction: string): void {
        this.investTransaction = investTransaction;
    }

    public setContact(contact: string): void {
        this.contact = contact;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }

    public setPercent(percent: number): void {
        this.percent = percent;
    }
}