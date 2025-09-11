import { BaseService } from "../base/BaseService"
import Either, { left, right } from "@/implementation/Either"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ResEntryMemoDto from "@/domain/memo/ResEntryMemoDto"
import ReqCreateMemoDto from "@/domain/memo/ReqCreateMemoDto"
import ReqUpdateMemoDto from "@/domain/memo/ReqUpdateMemoDto"
import FileUpload from "@/domain/uploadFile/FileUpload"
import BaseFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import ResEntryPropertyDto from "@/domain/property/property/ResEntryPropertyDto"
import formatDateToMicroseconds from "@/utility/formatDateToMicroSeconds"


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
        } else if (value instanceof Date) {
          // Convert Date to ISO string
          const result = formatDateToMicroseconds(value);
          formData.append(key, result);
        
        } else if (key === "createdAt") {
          // Skip createdAt field if present
          return;
        }
        else {
          formData.append(key, value as string);
        }
      }
    });

    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

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
    console.log("Created memo data:", responseData);
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
        }
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

      // Build FormData for multipart
      const formData = new FormData();
      Object.entries(reqUpdateMemoDto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, value as string);
          }
        }
      });
      console.log("FormData entries for updateMemo:");
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${reqUpdateMemoDto.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Do not set Content-Type, browser will set it for FormData
        },
        body: formData,
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
      console.log("Updated memo data:", responseData);
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
      if (!id) {
        return left(FetchFailed.create("MemoService", "Memo ID is required to fetch memo."));
      }
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

      const json = await res.json();
      // console.log("Full response:", json); // Add this line
      const responseData: ResEntryMemoDto = json.data;
      console.log("Memo data:", responseData); // This is your original log
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during fetching memo.", error));
    }
  }


  async fetchMemoFileRelated(dto: BaseFetchFileRelatedDto): Promise<Either<ServiceError, FileUpload[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      // Check types before fetch
      if (typeof dto.targetId !== "string" || typeof dto.fileType !== "string") {
        return left(FetchFailed.create("MemoService", "Invalid targetId or fileType. Both must be strings."));
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${dto.targetId}/files/${dto.fileType}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to fetch memo files: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("MemoService", `Failed to fetch memo files: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      
      const items: FileUpload[] = json.data ?? [];
      
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during fetching memo files.", error));
    }
  }

  async attachFileToMemo(dto: BaseAttachFileToTarget): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      // Build FormData for multipart
      const formData = new FormData();
      formData.append("file", dto.file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/attach/${dto.targetId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Do not set Content-Type, browser will set it for FormData
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to attach file to memo: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("MemoService", `Failed to attach file to memo: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during attaching file to memo.", error));
    }
  }

  async removeFileFromMemo(dto: BaseRemoveFileFromTarget): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/remove/${dto.targetId}/${dto.fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 409) {
        if (res.status === 401 ) {
          return left(Unauthorized.create("MemoService", `Authorization failed to remove file from memo: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("MemoService", `Failed to remove file from memo: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during removing file from memo.", error));
    }
  }

  async fetchAllPropertiesByMemoId(memoId: string): Promise<Either<ServiceError, ResEntryPropertyDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("MemoService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      // Check types before fetch
     

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${memoId}/properties`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("MemoService", `Authorization failed to fetch memo files: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("MemoService", `Failed to fetch memo files: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      console.log(json);
      const items: ResEntryPropertyDto[] = json.data ?? [];
      console.log("Fetched Property by memo id memo service:", items);
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("MemoService", "An unexpected error occurred during fetching memo files.", error));
    }
  }

}