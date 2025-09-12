import FileUpload from "../uploadFile/FileUpload";
import { BaseDateConverter } from "../utility/BaseDateConverter";

export default class ResEntrySaleDto extends BaseDateConverter {
    id: string; // UUID
    transactionType: string;
    property: string;
    contact: string;
    price: number;
    note: string;
    createdBy: string;
    saleDate: Date;
    updatedAt: Date;
    files: FileUpload[];

    constructor(
        id: string,
        transactionType: string,
        property: string,
        contact: string,
        price: number,
        note: string,
        createdBy: string,
        saleDate: string,
        jsonUpdatedAt: string,
        files: FileUpload[] = []
    ) {
        super();
        this.id = id;
        this.transactionType = transactionType;
        this.property = property;
        this.contact = contact;
        this.price = price;
        this.note = note;
        this.createdBy = createdBy;
        this.saleDate = this.convertStringToDate(saleDate);
        this.updatedAt = this.convertStringToDate(jsonUpdatedAt);
        this.files = files;
    }


}