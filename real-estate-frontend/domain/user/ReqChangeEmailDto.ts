export default class ReqChangeEmailDto {
    private oldEmail: string;
    private newEmail: string;
    private password: string;

    constructor(oldEmail: string, newEmail: string, password: string) {
        this.oldEmail = oldEmail;
        this.newEmail = newEmail;
        this.password = password;
    }

    public getOldEmail(): string {
        return this.oldEmail;
    }

    public setOldEmail(oldEmail: string): void {
        this.oldEmail = oldEmail;
    }

    public getNewEmail(): string {
        return this.newEmail;
    }

    public setNewEmail(newEmail: string): void {
        this.newEmail = newEmail;
    }

    public getPassword(): string {
        return this.password;
    }

    public setPassword(password: string): void {
        this.password = password;
    }

    public toJSON(): object {
        return {
            oldEmail: this.oldEmail,
            newEmail: this.newEmail,
            password: this.password,
        };
    }   
}