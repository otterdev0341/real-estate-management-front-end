import { BaseDateConverter } from "../../utility/BaseDateConverter";
import ResEntryPaymentItemDto from "./ResEntryPaymentItemDto";

export default class ResEntryPaymentDto extends BaseDateConverter {
    id: string; // UUID
    transaction: string; // UUID
    property: string; // UUID
    note: string;
    contact: string
    items: ResEntryPaymentItemDto[];
    created: Date;
    updated: Date;

    
    constructor(
        id: string,
        transaction: string,
        property: string,
        note: string,
        contact: string,
        items: ResEntryPaymentItemDto[],
        jsonCreated: string,
        jsonUpdated: string
    ) {
        super();
        this.id = id;
        this.transaction = transaction;
        this.property = property;
        this.note = note;
        this.contact = contact;
        this.items = items;
        this.created = this.convertStringToDate(jsonCreated);
        this.updated = this.convertStringToDate(jsonUpdated);
    }

    get totalAmount(): number {
        return this.items.reduce((sum, item) => sum + item.total, 0);
    }
}