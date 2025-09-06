import { ResEntryPropertyStatusDto } from "@/domain/property/propertyStatus/ResEntryPropertyStatusDto"
import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ReqCreatePropertyStatusDto from "@/domain/property/propertyStatus/ReqCreatePropertyStatusDto"
import ReqUpdatePropertyStatusDto from "@/domain/property/propertyStatus/ReqUpdatePropertyStatusDto"

export class PropertyStatusService extends BaseService {
  private static _propertyStatusInstance: PropertyStatusService

  private constructor() {
    super()
  }

  public static get instance(): PropertyStatusService {
    if (!PropertyStatusService._propertyStatusInstance) {
      PropertyStatusService._propertyStatusInstance = new PropertyStatusService()
    }
    return PropertyStatusService._propertyStatusInstance
  }

  async createNewPropertyStatus(reqCreatePropertyStatusDto: ReqCreatePropertyStatusDto): Promise<Either<ServiceError, ResEntryPropertyStatusDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyStatusService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(reqCreatePropertyStatusDto),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyStatusService", `Authorization failed to create property status: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("PropertyStatusService", errorJson.message || "Failed to create property status", new Error(errorJson.message)));
        }
        return left(CreateFailed.create("PropertyStatusService", `Failed to create property status: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyStatusDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(CreateFailed.create("PropertyStatusService", "An unexpected error occurred during property status creation.", error));
    }
  }

  async fetchAllPropertyStatuses(query: BaseQuery): Promise<Either<ServiceError, ResEntryPropertyStatusDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyStatusService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyStatusService", `Authorization failed to fetch property statuses: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyStatusService", `Failed to fetch property statuses: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryPropertyStatusDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("PropertyStatusService", "An unexpected error occurred during fetching property statuses.", error));
    }
  }

  async deletePropertyStatus(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyStatusService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-status/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyStatusService", `Authorization failed to delete property status: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyStatusService", `Failed to delete property status: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("PropertyStatusService", "An unexpected error occurred during deleting property status.", error));
    }
  }

  async updatePropertyStatus(reqUpdatePropertyStatusDto: ReqUpdatePropertyStatusDto): Promise<Either<ServiceError, ResEntryPropertyStatusDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyStatusService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const { id, ...data } = reqUpdatePropertyStatusDto;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyStatusService", `Authorization failed to update property status: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("PropertyStatusService", errorJson.message || "Failed to update property status", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("PropertyStatusService", `Failed to update property status: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyStatusDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("PropertyStatusService", "An unexpected error occurred during updating property status.", error));
    }
  }

  async fetchPropertyStatusById(id: string): Promise<Either<ServiceError, ResEntryPropertyStatusDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("PropertyStatusService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/property-status/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("PropertyStatusService", `Authorization failed to fetch property status: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("PropertyStatusService", `Failed to fetch property status: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryPropertyStatusDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("PropertyStatusService", "An unexpected error occurred during fetching property status.", error));
    }
}
}