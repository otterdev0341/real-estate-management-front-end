import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized } from "@/implementation/ServiceError"
import { ReqCreateUserDto } from "@/domain/user/ReqCreateUserDto"
import { ReqLoginDto } from "@/domain/user/ReqLoginDto"
import { UserData } from "@/domain/user/UserDataDto"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { useContactContext } from "@/context/store/ContactStore"
import { useMemoContext } from "@/context/store/MemoStore"
import { useExpenseContext } from "@/context/store/ExpenseStore"
import { useSaleContext } from "@/context/store/SaleStore"
import { useInvestmentContext } from "@/context/store/InvestmentStore"
import { usePaymentContext } from "@/context/store/PaymentStore"

export class AuthService extends BaseService {
  private static _authInstance: AuthService

  private constructor() {
    super()
  }

  public static get instance(): AuthService {
    if (!AuthService._authInstance) {
      AuthService._authInstance = new AuthService()
    }
    return AuthService._authInstance
  }

  async register(data: ReqCreateUserDto): Promise<Either<ServiceError, UserData>> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorJson = await res.json()
        return left(CreateFailed.create("AuthService", errorJson.message || "Registration failed", new Error(errorJson.message)))
      }

      const responseData = await res.json()
      // Registration usually does not return user data, but if it does:
      return right(responseData.data as UserData)
    } catch (error) {
      return left(CreateFailed.create("AuthService", "An unexpected error occurred during registration.", error))
    }
  }

  async login(data: ReqLoginDto): Promise<Either<ServiceError, string>> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorJson = await res.json()
        return left(FetchFailed.create("AuthService", errorJson.message || "Login failed", new Error(errorJson.message)))
      }

      const responseData = await res.json()
      const token = responseData.data?.token
      if (!token) {
        return left(FetchFailed.create("AuthService", "No token received", new Error("No token")))
      }
      console.log("Token received in AuthService:", token);

      // save token to cokkie
      document.cookie = `auth_token=${token}; path=/; max-age=86400`; // 1 day expiration

      
      

      

      return right(token)
    } catch (error) {
      console.error("Error during login:", error);
      return left(FetchFailed.create("AuthService", "An unexpected error occurred during login.", error))
    }
    }

  async logout(): Promise<Either<ServiceError, null>> {
    try {
      // Clear the auth token cookie
      document.cookie = "auth_token=; path=/; max-age=0"

      return right(null)
    } catch (error) {
      return left(FetchFailed.create("AuthService", "An unexpected error occurred during logout.", error))
    }
  }


  async fetchCurrentUser(): Promise<Either<ServiceError, UserData>> {
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("auth_token="))?.split("=")[1]
      if (!token) {
        return left(Unauthorized.create("AuthService", "No auth token found", new Error("No auth token")))
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/resme`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const errorJson = await res.json()
        return left(FetchFailed.create("AuthService", errorJson.message || "Fetch current user failed", new Error(errorJson.message)))
      }

      const responseData = await res.json()
      console.log("Current user data fetched:", responseData.data);
      return right(responseData.data as UserData)
    } catch (error) {
      return left(FetchFailed.create("AuthService", "An unexpected error occurred while fetching current user.", error))
    }

  }
}