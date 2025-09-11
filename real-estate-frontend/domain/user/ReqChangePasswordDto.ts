export default class ReqChangePasswordDto {
    private newPassword: string;
    private verifyNewPassword: string;
    private oldPassword: string;

    constructor(newPassword: string, verifyNewPassword: string, oldPassword: string) {
        this.newPassword = newPassword;
        this.verifyNewPassword = verifyNewPassword;
        this.oldPassword = oldPassword;
    }

    public getNewPassword(): string {
        return this.newPassword;
    }

    public setNewPassword(newPassword: string): void {
        this.newPassword = newPassword;
    }

    public getVerifyNewPassword(): string {
        return this.verifyNewPassword;
    }

    public setVerifyNewPassword(verifyNewPassword: string): void {
        this.verifyNewPassword = verifyNewPassword;
    }

    public getOldPassword(): string {
        return this.oldPassword;
    }

    public setOldPassword(oldPassword: string): void {
        this.oldPassword = oldPassword;
    }

    public toJSON(): object {
        return {
            newPassword: this.newPassword,
            verifyNewPassword: this.verifyNewPassword,
            oldPassword: this.oldPassword,
        };
    }
}