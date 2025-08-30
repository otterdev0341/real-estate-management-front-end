import { BaseService } from "../base/BaseService"
import Either, { left, right } from "@/implementation/Either"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ReqCreatePropertyDto from "@/domain/property/property/ReqCreatePropertyDto"
import ReqUpdatePropertyDto from "@/domain/property/property/ReqUpdatePropertyDto"
import ResEntryPropertyDto from "@/domain/property/property/ResEntryPropertyDto"
import FileUpload from "@/domain/uploadFile/FileUpload"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import ResEntryMemoDto from "@/domain/memo/ResEntryMemoDto"
import ReqAssignPropertyType from "@/domain/utility/ReqAssignPropertyType"
import ResEntryPropertyTypeDto from "@/domain/property/propertyType/ResEntryPropertyTypeDto"

export class PropertyService extends BaseService {
  private static _propertyInstance: PropertyService

  private constructor() {
    super()
  }

  public static get instance(): PropertyService {
    if (!PropertyService._propertyInstance) {
      PropertyService._propertyInstance = new PropertyService()
    }
    return PropertyService._propertyInstance
  }

  async createNewProperty(reqCreatePropertyDto: ReqCreatePropertyDto): Promise<Either<ServiceError, ResEntryPropertyDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      // Build FormData for multipart
      const formData = new FormData();
      Object.entries(reqCreatePropertyDto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "files" && Array.isArray(value)) {
            value.forEach((file: File) => formData.append("files", file));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to create property: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(CreateFailed.create("PropertyService", errorJson.message || "Failed to create property", new Error(errorJson.message)));
        }
        return left(CreateFailed.create("PropertyService", `Failed to create property: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(CreateFailed.create("PropertyService", "An unexpected error occurred during property creation.", error));
    }
  }

  async fetchAllProperties(query: BaseQuery): Promise<Either<ServiceError, ResEntryPropertyDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to fetch properties: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to fetch properties: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryPropertyDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during fetching properties.", error));
    }
  }

  async deleteProperty(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to delete property: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to delete property: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during deleting property.", error));
    }
  }

  async updateProperty(reqUpdatePropertyDto: ReqUpdatePropertyDto): Promise<Either<ServiceError, ResEntryPropertyDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const { id, ...data } = reqUpdatePropertyDto;

 
      // Build FormData for multipart
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (
          (key === "price" && (value === "" || value === null || value === undefined)) ||
          (key === "maximumBudget" && (value === "" || value === null || value === undefined)) ||
          (key === "fsp" && (value === "" || value === null || value === undefined))
        ) {
          formData.append(key, "0.0");
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to update property: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("PropertyService", errorJson.message || "Failed to update property", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to update property: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during updating property.", error));
    }
  }

  async fetchPropertyById(id: string): Promise<Either<ServiceError, ResEntryPropertyDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      if (!id) {
        return left(FetchFailed.create("PropertyService", "Property ID is required to fetch property."));
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to fetch property: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to fetch property: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const responseData: ResEntryPropertyDto = json.data;
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during fetching property.", error));
    }
  }

  async fetchPropertyFileRelated(dto: BaseFetchFileRelatedDto): Promise<Either<ServiceError, FileUpload[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      if (typeof dto.targetId !== "string" || typeof dto.fileType !== "string") {
        return left(FetchFailed.create("PropertyService", "Invalid targetId or fileType. Both must be strings."));
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${dto.targetId}/files/${dto.fileType}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to fetch property files: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to fetch property files: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: FileUpload[] = json.data ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during fetching property files.", error));
    }
  }

  async attachFileToProperty(dto: BaseAttachFileToTarget): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const formData = new FormData();
      formData.append("file", dto.file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/attach/${dto.targetId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to attach file to property: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to attach file to property: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during attaching file to property.", error));
    }
  }

  async removeFileFromProperty(dto: BaseRemoveFileFromTarget): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/remove/${dto.targetId}/${dto.fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 409) {
        if (res.status === 401 ) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to remove file from property: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to remove file from property: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during removing file from property.", error));
    }

  }


  async assignMemoToProperty(propertyId: string, memoId: string): Promise<Either<ServiceError, void>> {
     try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${memoId}/${propertyId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 ) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to remove file from property: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 500 ) {
          return left(CreateFailed.create("PropertyService", `Failed to attach memo to property with InternalError: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to remove file from property: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during removing file from property.", error));
    }
  }


  async removeMemoFromProperty(propertyId: string, memoId: string): Promise<Either<ServiceError, void>> {
     try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/remove-memo/${memoId}/${propertyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 409) {
        if (res.status === 401 ) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to remove file from property: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 500 ) {
          return left(UpdateFailed.create("PropertyService", `Failed to remove memo to property with InternalError: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to remove file from property: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during removing file from property.", error));
    }
  }

  async fetchAllMemosByProperty(propertyId: string): Promise<Either<ServiceError, ResEntryMemoDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${propertyId}/memos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to fetch memos by property: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to fetch memo by property: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      console.log(json);
      const items: ResEntryMemoDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during fetching memo by property.", error));
    }
  }


  async assignPropertyTypeToProperty(reqAssignPropertyType: ReqAssignPropertyType): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const { propertyId, propertyTypes } = reqAssignPropertyType;

      console.log("Assigning property types:", propertyTypes, "to property ID:", propertyId);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${propertyId}/assign/property-type`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyTypes }),
      });



      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to assign property type: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          return left(UpdateFailed.create("PropertyService", `Failed to assign property type to property with BadRequest: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to assign property type: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      console.log(json);

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during assigning property type.", error));
    }
  }

  async removePropertyTypeToProperty(propertyTypeId: string, propertyId: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${propertyTypeId}/${propertyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to fetch memos by property: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          return left(UpdateFailed.create("PropertyService", `Failed to assign property type to property with BadRequest: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 500) {
        return left(FetchFailed.create("PropertyService", `Failed to remove property type from property due internal error: ${res.statusText}`, new Error(res.statusText)));
        }
      }
      
      return right(undefined);
      
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during fetching memo by property.", error));
    }
  }

  async fetchAllPropertyTypesByPropertyId(propertyId: string): Promise<Either<ServiceError, ResEntryPropertyTypeDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property/${propertyId}/property-type`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyService", `Authorization failed to fetch memos by property: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          return left(UpdateFailed.create("PropertyService", `Failed to fetch property by property with BadRequest: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyService", `Failed to fetch memo by property: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryPropertyTypeDto[] = json.data?.items ?? [];
      return right(items);
      
    } catch (error) {
      return left(FetchFailed.create("PropertyService", "An unexpected error occurred during fetching memo by property.", error));
    }
  }



}