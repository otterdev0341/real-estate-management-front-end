import { BaseService } from "../base/BaseService"
import Either, { left, right } from "@/implementation/Either"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ResEntryMemoDto from "@/domain/memo/ResEntryMemoDto"
import ReqCreateMemoDto from "@/domain/memo/ReqCreateMemoDto"
import ReqUpdateMemoDto from "@/domain/memo/ReqUpdateMemoDto"


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

  async createNewMemo(reqCreateMemoDto: ReqCreateMemoDto): Promise<Either<ServiceError, ResEntryMemoDto>> {
  try {
    if (!this.isTokenExist()) {
      return left(Unauthorized.create("MemoService", "No authentication token found."));
    }
    const token = this.getUserToken().get();

    // Build FormData for multipart
    const formData = new FormData();
    Object.entries(reqCreateMemoDto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // If value is a File or Blob, append directly
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          // For arrays of files or strings
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        // Do not set Content-Type, browser will set it for FormData
      },
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        return left(Unauthorized.create("MemoService", `Authorization failed to create memo: ${res.statusText}`, new Error(res.statusText)));
      }
      if (res.status === 400) {
        const errorJson = await res.json();
        return left(CreateFailed.create("MemoService", errorJson.message || "Failed to create memo", new Error(errorJson.message)));
      }
      return left(CreateFailed.create("MemoService", `Failed to create memo: ${res.statusText}`, new Error(res.statusText)));
    }

    const responseData: ResEntryMemoDto = await res.json();
    return right(responseData);
  } catch (error) {
    return left(CreateFailed.create("MemoService", "An unexpected error occurred during memo creation.", error));
  }
}

  async fetchAllMemos(query: BaseQuery): Promise<Either<ServiceError, ResEntryMemoDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(query),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to fetch memos: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("MemoService", `Failed to fetch memos: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryMemoDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during fetching memos.", error));
    }
  }

  async deleteMemo(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to delete memo: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("MemoService", `Failed to delete memo: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during deleting memo.", error));
    }
  }

  async updateMemo(reqUpdateMemoDto: ReqUpdateMemoDto): Promise<Either<ServiceError, ResEntryMemoDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const { id, ...data } = reqUpdateMemoDto;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to update memo: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("MemoService", errorJson.message || "Failed to update memo", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("MemoService", `Failed to update memo: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryMemoDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during updating memo.", error));
    }
  }

  async fetchMemoById(id: string): Promise<Either<ServiceError, ResEntryMemoDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to fetch memo: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("MemoService", `Failed to fetch memo: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryMemoDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during fetching memo.", error));
    }
  }
}