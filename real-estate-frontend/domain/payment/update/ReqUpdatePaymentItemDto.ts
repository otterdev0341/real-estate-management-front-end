export default class RequpdatePaymentItemDto  {
    private id: string; // can be null
    private expense: string; // UUID
    private amount: number;
    private price: number;
    
    constructor(
        id: string | null,
        expense: string,
        amount: number,
        price: number
    ) {    
        this.id = id ? id : '';
        this.expense = expense;
        this.amount = amount;
        this.price = price;
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getExpense(): string {
        return this.expense;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getPrice(): number {
        return this.price;
    }

    // Setters
    public setId(id: string): void {
        this.id = id;
    }

    public setExpense(expense: string): void {
        this.expense = expense;
    }

    public setAmount(amount: number): void {
        this.amount = amount;
    }

    public setPrice(price: number): void {
        this.price = price;
    }
}