import { ResEntryMemoTypeDto } from "@/domain/memo/ResEntryMemoTypeDto"
import Either, { left, right } from "@/implementation/Either"

import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ReqCreateMemoTypeDto from "@/domain/memo/ReqCreateMemoTypeDto"
import ReqUpdateMemoTypeDto from "@/domain/memo/ReqUpdateMemoTypeDto"

export class MemoTypeService extends BaseService {
  private static _memoInstance: MemoTypeService

  private constructor() {
    super()
  }

  public static get instance(): MemoTypeService {
    if (!MemoTypeService._memoInstance) {
      MemoTypeService._memoInstance = new MemoTypeService()
    }
    return MemoTypeService._memoInstance
  }

  // if create success refresh memo type in store
  async createNewMemoType(reqCreateMemoTypeDto: ReqCreateMemoTypeDto): Promise<Either<ServiceError, ResEntryMemoTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({detail: reqCreateMemoTypeDto.detail}),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoTypeService", `Authorization failed to create memo type: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
        const errorJson = await res.json();
          return left(CreateFailed.create("MemoTypeService", errorJson.message || "Failed to create memo type", new Error(errorJson.message)));
        }
        return left(CreateFailed.create("MemoTypeService", `Failed to create memo type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryMemoTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      // In case of a network error or other unexpected issue
      return left(CreateFailed.create("MemoTypeService", "An unexpected error occurred during memo type creation.", error));
    }
  }



    async fetchAllMemoTypes(query: BaseQuery): Promise<Either<ServiceError, ResEntryMemoTypeDto[]>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoTypeService", "No authentication token found."));
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
            return left(Unauthorized.create("MemoTypeService", `Authorization failed to fetch memo types: ${res.statusText}`, new Error(res.statusText)));
            }
            return left(FetchFailed.create("MemoTypeService", `Failed to fetch memo types: ${res.statusText}`, new Error(res.statusText)));
        }
        
        const json = await res.json();
        
        const items: ResEntryMemoTypeDto[] = json.data?.items ?? [];
        
        return right(items);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoTypeService", "An unexpected error occurred during fetching memo types.", error));
        }
    }


    async deleteMemoType(id: string): Promise<Either<ServiceError, void>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoTypeService", "No authentication token found."));
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
            return left(Unauthorized.create("MemoTypeService", `Authorization failed to delete memo type: ${res.statusText}`, new Error(res.statusText)));
            }
            return left(FetchFailed.create("MemoTypeService", `Failed to delete memo type: ${res.statusText}`, new Error(res.statusText)));
        }
    
        return right(undefined);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoTypeService", "An unexpected error occurred during deleting memo type.", error));
        }
    }

    async updateMemoType(reqUpdateMemoTypeDto: ReqUpdateMemoTypeDto): Promise<Either<ServiceError, ResEntryMemoTypeDto>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoTypeService", "No authentication token found."));
        }
        const token = this.getUserToken().get();
        const { id, ...data} = reqUpdateMemoTypeDto;
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
            return left(Unauthorized.create("MemoTypeService", `Authorization failed to update memo type: ${res.statusText}`, new Error(res.statusText)));
            }
            if (res.status === 400) {
              const errorJson = await res.json();
              return left(UpdateFailed.create("MemoTypeService", errorJson.message || "Failed to update memo type", new Error(errorJson.message)));
            }
            return left(FetchFailed.create("MemoTypeService", `Failed to update memo type: ${res.statusText}`, new Error(res.statusText)));
        }
    
        const responseData: ResEntryMemoTypeDto = await res.json();
        return right(responseData);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoTypeService", "An unexpected error occurred during updating memo type.", error));
        }
    }

    async fetchMemoTypeById(id: string): Promise<Either<ServiceError, ResEntryMemoTypeDto>> {
        try {
        if (!this.isTokenExist()) {
            return left(Unauthorized.create("MemoTypeService", "No authentication token found."));
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
            return left(Unauthorized.create("MemoTypeService", `Authorization failed to fetch memo type: ${res.statusText}`, new Error(res.statusText)));
            }
            return left(FetchFailed.create("MemoTypeService", `Failed to fetch memo type: ${res.statusText}`, new Error(res.statusText)));
        }
    
        const responseData: ResEntryMemoTypeDto = await res.json();
        return right(responseData);
        } catch (error) {
        // In case of a network error or other unexpected issue
        return left(FetchFailed.create("MemoTypeService", "An unexpected error occurred during fetching memo type.", error));
        }
    }
}