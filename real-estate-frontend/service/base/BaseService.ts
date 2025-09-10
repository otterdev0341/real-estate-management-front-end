import Either from "@/implementation/Either"
import { Optional } from "@/implementation/Optional"
import { FetchFailed, ServiceError } from "@/implementation/ServiceError"

export abstract class BaseService {
  private static _instance: BaseService

  protected constructor() {}

  // Get JWT token from cookie
  protected getUserToken(): Optional<string>{
    if (typeof document === "undefined") return Optional.empty()
    const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/)
    return match ? Optional.of(decodeURIComponent(match[1])) : Optional.empty()
  }

  // Check if JWT token exists, not null, not empty
  protected isTokenExist(): boolean {
    const token = this.getUserToken().get();
    return !!token && token.trim() !== ""
  }
}