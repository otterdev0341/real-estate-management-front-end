import Either, { left, right } from "@/implementation/Either";
import { BaseService } from "../base/BaseService";
import { ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError";
import ReqChangePasswordDto from "@/domain/user/ReqChangePasswordDto";
import ReqChangeUserInfoDto from "@/domain/user/ReqChangeUserInfoDto";
import ReqChangeEmailDto from "@/domain/user/ReqChangeEmailDto";

export default class UserService extends BaseService {

    private static _userInstance: UserService;

    private constructor() {
        super();
    }

    public static get instance(): UserService {
        if (!UserService._userInstance) {
            UserService._userInstance = new UserService();
        }
        return UserService._userInstance;
    }

    // Add user-related methods here, e.g., fetchUserProfile, updateUserSettings, etc.

    async changePassword(data: ReqChangePasswordDto): Promise<Either<ServiceError, boolean>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("UserService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const payload = data.toJSON();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("UserService", `Authorization failed to change password: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(UpdateFailed.create("UserService", `Failed to change password: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(true);
        } catch (error) {
            return left(UpdateFailed.create("UserService", "An unexpected error occurred during password change.", error));
        }
    }

    async changeUserInfo(data: ReqChangeUserInfoDto): Promise<Either<ServiceError, boolean>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("UserService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const payload = data.toJSON();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/change-info`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("UserService", `Authorization failed to change user info: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(UpdateFailed.create("UserService", `Failed to change user info: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(true);
        } catch (error) {
            return left(UpdateFailed.create("UserService", "An unexpected error occurred during user info change.", error));
        }
    }

    async changeEmail(data: ReqChangeEmailDto): Promise<Either<ServiceError, boolean>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("UserService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const payload = data.toJSON();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/change-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("UserService", `Authorization failed to change email: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(UpdateFailed.create("UserService", `Failed to change email: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(true);
        } catch (error) {
            return left(UpdateFailed.create("UserService", "An unexpected error occurred during email change.", error));
        }
    }

}