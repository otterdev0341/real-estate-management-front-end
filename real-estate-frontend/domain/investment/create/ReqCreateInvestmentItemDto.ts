export default class ReqCreateInvestmentItemDto {
    private contact: string;
    private amount: number;
    private percent: number;

    constructor(
        contact: string,
        amount: number,
        percent: number
    ) {
        this.contact = contact;
        this.amount = amount;
        this.percent = percent;
    }

    // Getters
    

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