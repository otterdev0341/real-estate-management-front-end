export default class ResEntryPaymentItemDto  {
    id: string; // UUID
    paymentTransaction: string; // UUID
    expense: string
    amount: number;
    price: number;
    total: number;
    constructor(
        
        id: string,
        paymentTransaction: string,
        expense: string,
        amount: number,
        price: number
    ) {    
        this.id = id;
        this.paymentTransaction = paymentTransaction;
        this.expense = expense;
        this.amount = amount;
        this.price = price;
        this.total = this.amount * this.price;
    }
}