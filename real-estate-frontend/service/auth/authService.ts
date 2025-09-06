import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized } from "@/implementation/ServiceError"
import { ReqCreateUserDto } from "@/domain/user/ReqCreateUserDto"
import { ReqLoginDto } from "@/domain/user/ReqLoginDto"
import { UserData } from "@/domain/user/UserDataDto"

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

  async login(data: ReqLoginDto): Promise<Either<ServiceError, { token: string; user: UserData }>> {
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

      // Fetch user data after login
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/resme`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!userRes.ok) {
        return left(FetchFailed.create("AuthService", "Failed to fetch user data after login", new Error("User fetch failed")))
      }

      const userDataResponse = await userRes.json()
      console.log("User Data Response in AuthService:", userDataResponse)
      const user = userDataResponse.data as UserData

      return right({ token, user })
    } catch (error) {
      return left(FetchFailed.create("AuthService", "An unexpected error occurred during login.", error))
    }
    }

}