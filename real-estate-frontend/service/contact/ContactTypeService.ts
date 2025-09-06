import ResEntryContactTypeDto from "@/domain/contact/contactType/ResEntryContactTypeDto"
import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ReqUpdateContactTypeDto from "@/domain/contact/contactType/ReqUpdateContactTypeDto"

export class ContactTypeService extends BaseService {
  private static _contactInstance: ContactTypeService

  private constructor() {
    super()
  }

  public static get instance(): ContactTypeService {
    if (!ContactTypeService._contactInstance) {
      ContactTypeService._contactInstance = new ContactTypeService()
    }
    return ContactTypeService._contactInstance
  }

  async createNewContactType(data: { detail: string }): Promise<Either<ServiceError, ResEntryContactTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactTypeService", `Authorization failed to create contact type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(CreateFailed.create("ContactTypeService", `Failed to create contact type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryContactTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(CreateFailed.create("ContactTypeService", "An unexpected error occurred during contact type creation.", error));
    }
  }

  async fetchAllContactTypes(query: BaseQuery): Promise<Either<ServiceError, ResEntryContactTypeDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact-type`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactTypeService", `Authorization failed to fetch contact types: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ContactTypeService", `Failed to fetch contact types: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryContactTypeDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("ContactTypeService", "An unexpected error occurred during fetching contact types.", error));
    }
  }

  async deleteContactType(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact-type/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactTypeService", `Authorization failed to delete contact type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ContactTypeService", `Failed to delete contact type: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("ContactTypeService", "An unexpected error occurred during deleting contact type.", error));
    }
  }

  async updateContactType(ReqUpdateContactTypeDto: ReqUpdateContactTypeDto): Promise<Either<ServiceError, ResEntryContactTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact-type/${ReqUpdateContactTypeDto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({detail: ReqUpdateContactTypeDto.detail}),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactTypeService", `Authorization failed to update contact type: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
                  const errorJson = await res.json();
                  return left(UpdateFailed.create("ContactTypeService", errorJson.message || "Failed to update contact type", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("ContactTypeService", `Failed to update contact type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryContactTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ContactTypeService", "An unexpected error occurred during updating contact type.", error));
    }
  }

  async fetchContactTypeById(id: string): Promise<Either<ServiceError, ResEntryContactTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact-type/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactTypeService", `Authorization failed to fetch contact type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ContactTypeService", `Failed to fetch contact type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryContactTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ContactTypeService", "An unexpected error occurred during fetching contact type.", error));
    }
  }
}