export default class ReqCreatePaymentItemDto  {
    private expense: string; // UUID
    private amount: number;
    private price: number;
    
    constructor(
        expense: string,
        amount: number,
        price: number
    ) {    
        this.expense = expense;
        this.amount = amount;
        this.price = price;
    }

    // Getters
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