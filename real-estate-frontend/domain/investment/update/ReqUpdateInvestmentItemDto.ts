export default class ReqUpdateInvestmentItemDto {
    private id: string; // uuid or empty
    private contact: string; // uuid
    private amount: number; 
    private percent: number;

    constructor(
        id: string,
        contact: string,
        amount: number,
        percent: number
    ) {
        this.id = id;
        this.contact = contact;
        this.amount = amount;
        this.percent = percent;
    }

    // Getters
    public getId(): string {
        return this.id;
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