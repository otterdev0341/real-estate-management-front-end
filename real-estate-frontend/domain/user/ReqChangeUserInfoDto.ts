import { BaseDateConverter } from "../utility/BaseDateConverter";

export default class ReqChangeUserInfoDto extends BaseDateConverter {
    private firstName: string;
    private lastName: string;
    private dob: Date;
    private gender: string;

    constructor(firstName: string, lastName: string, dob: Date, gender: string) {
        super();
        this.firstName = firstName;
        this.lastName = lastName;
        this.dob = dob;
        this.gender = gender;
    }

    public getFirstName(): string {
        return this.firstName;
    }

    public setFirstName(firstName: string): void {
        this.firstName = firstName;
    }

    public getLastName(): string {
        return this.lastName;
    }

    public setLastName(lastName: string): void {
        this.lastName = lastName;
    }

    public getDob(): Date {
        return this.dob;
    }

    public setDob(dob: Date): void {
        this.dob = dob;
    }

    public getGender(): string {
        return this.gender;
    }

    public setGender(gender: string): void {
        this.gender = gender;
    }

    public toJSON(): object {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            dob: this.formatDateToMicroseconds(this.dob),
            gender: this.gender
        };
    }

}