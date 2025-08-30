import ResEntryPropertyTypeDto from "@/domain/property/propertyType/ResEntryPropertyTypeDto"
import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ReqCreatePropertyTypeDto from "@/domain/property/propertyType/ReqCreatePropertyTypeDto"
import ReqUpdatePropertyTypeDto from "@/domain/property/propertyType/ReqUpdatePropertyTypeDto"

export class PropertyTypeService extends BaseService {
  private static _propertyTypeInstance: PropertyTypeService

  private constructor() {
    super()
  }

  public static get instance(): PropertyTypeService {
    if (!PropertyTypeService._propertyTypeInstance) {
      PropertyTypeService._propertyTypeInstance = new PropertyTypeService()
    }
    return PropertyTypeService._propertyTypeInstance
  }

  async createNewPropertyType(reqCreatePropertyTypeDto: ReqCreatePropertyTypeDto): Promise<Either<ServiceError, ResEntryPropertyTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(reqCreatePropertyTypeDto),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyTypeService", `Authorization failed to create property type: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("PropertyTypeService", errorJson.message || "Failed to create property type", new Error(errorJson.message)));
        }
        return left(CreateFailed.create("PropertyTypeService", `Failed to create property type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(CreateFailed.create("PropertyTypeService", "An unexpected error occurred during property type creation.", error));
    }
  }

  async fetchAllPropertyTypes(query: BaseQuery): Promise<Either<ServiceError, ResEntryPropertyTypeDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-type`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "body": JSON.stringify(query)
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyTypeService", `Authorization failed to fetch property types: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyTypeService", `Failed to fetch property types: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryPropertyTypeDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("PropertyTypeService", "An unexpected error occurred during fetching property types.", error));
    }
  }

  async deletePropertyType(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-type/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyTypeService", `Authorization failed to delete property type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyTypeService", `Failed to delete property type: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyTypeService", "An unexpected error occurred during deleting property type.", error));
    }
  }

  async updatePropertyType(reqUpdatePropertyType: ReqUpdatePropertyTypeDto): Promise<Either<ServiceError, ResEntryPropertyTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const { id, ...data } = reqUpdatePropertyType;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-type/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyTypeService", `Authorization failed to update property type: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("PropertyTypeService", errorJson.message || "Failed to update property type", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("PropertyTypeService", `Failed to update property type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("PropertyTypeService", "An unexpected error occurred during updating property type.", error));
    }
  }

  async fetchPropertyTypeById(id: string): Promise<Either<ServiceError, ResEntryPropertyTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-type/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyTypeService", `Authorization failed to fetch property type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyTypeService", `Failed to fetch property type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("PropertyTypeService", "An unexpected error occurred during fetching property type.", error));
    }
  }
}