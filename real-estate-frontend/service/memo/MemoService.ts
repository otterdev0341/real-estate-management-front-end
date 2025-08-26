import { ResEntryMemoTypeDto } from "@/domain/memo/ResEntryMemoTypeDto"
import Either, { left, right } from "@/implementation/Either"

import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"

export class MemoService extends BaseService {
  private static _memoInstance: MemoService

  private constructor() {
    super()
  }

  public static get instance(): MemoService {
    if (!MemoService._memoInstance) {
      MemoService._memoInstance = new MemoService()
    }
    return MemoService._memoInstance
  }

  // if create success refresh memo type in store
  async createNewMemoType(data: { detail: string }): Promise<Either<ServiceError, ResEntryMemoTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to create memo type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(CreateFailed.create("MemoService", `Failed to create memo type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryMemoTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      // In case of a network error or other unexpected issue
      return left(CreateFailed.create("MemoService", "An unexpected error occurred during memo type creation.", error));
    }
  }



    async fetchAllMemoTypes(query: BaseQuery): Promise<Either<ServiceError, ResEntryMemoTypeDto[]>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoService", "No authentication token found."));
        }
        const token = this.getUserToken().get();
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo-type`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "body" : JSON.stringify(query)
            },
        });
    
        if (!res.ok) {
            if (res.status === 401) {
            return left(Unauthorized.create("MemoService", `Authorization failed to fetch memo types: ${res.statusText}`, new Error(res.statusText)));
            }
            return left(FetchFailed.create("MemoService", `Failed to fetch memo types: ${res.statusText}`, new Error(res.statusText)));
        }
    
        const responseData: ResEntryMemoTypeDto[] = await res.json();
        return right(responseData);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoService", "An unexpected error occurred during fetching memo types.", error));
        }
    }


    async deleteMemoType(id: string): Promise<Either<ServiceError, void>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoService", "No authentication token found."));
        }
        const token = this.getUserToken().get();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo-type/${id}`, {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
        });
    
        if (!res.ok) {
            if (res.status === 401) {
            return left(Unauthorized.create("MemoService", `Authorization failed to delete memo type: ${res.statusText}`, new Error(res.statusText)));
            }
            return left(FetchFailed.create("MemoService", `Failed to delete memo type: ${res.statusText}`, new Error(res.statusText)));
        }
    
        return right(undefined);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoService", "An unexpected error occurred during deleting memo type.", error));
        }
    }

    async updateMemoType(id: string, data: { detail: string }): Promise<Either<ServiceError, ResEntryMemoTypeDto>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoService", "No authentication token found."));
        }
        const token = this.getUserToken().get();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo-type/${id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
    
        if (!res.ok) {
            if (res.status === 401) {
            return left(Unauthorized.create("MemoService", `Authorization failed to update memo type: ${res.statusText}`, new Error(res.statusText)));
            }
            return left(FetchFailed.create("MemoService", `Failed to update memo type: ${res.statusText}`, new Error(res.statusText)));
        }
    
        const responseData: ResEntryMemoTypeDto = await res.json();
        return right(responseData);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoService", "An unexpected error occurred during updating memo type.", error));
        }
    }

    async fetchMemoTypeById(id: string): Promise<Either<ServiceError, ResEntryMemoTypeDto>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoService", "No authentication token found."));
        }
        const token = this.getUserToken().get();
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo-type/${id}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
        });
    
        if (!res.ok) {
            if (res.status === 401) {
            return left(Unauthorized.create("MemoService", `Authorization failed to fetch memo type: ${res.statusText}`, new Error(res.statusText)));
            }
            return left(FetchFailed.create("MemoService", `Failed to fetch memo type: ${res.statusText}`, new Error(res.statusText)));
        }
    
        const responseData: ResEntryMemoTypeDto = await res.json();
        return right(responseData);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoService", "An unexpected error occurred during fetching memo type.", error));
        }
    }
}