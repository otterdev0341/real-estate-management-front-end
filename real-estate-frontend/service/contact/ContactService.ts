import { ContactDto } from "@/domain/contact/contact/ResEntryContactDto"
import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { ReqUpdateContactDto } from "@/domain/contact/contact/ReqUpdateContactDto"

export class ContactService extends BaseService {
  private static _contactInstance: ContactService

  private constructor() {
    super()
  }

  public static get instance(): ContactService {
    if (!ContactService._contactInstance) {
      ContactService._contactInstance = new ContactService()
    }
    return ContactService._contactInstance
  }

  async createNewContact(data: Partial<ContactDto>): Promise<Either<ServiceError, ContactDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactService", `Authorization failed to create contact: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(CreateFailed.create("ContactService", `Failed to create contact: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ContactDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(CreateFailed.create("ContactService", "An unexpected error occurred during contact creation.", error));
    }
  }

  async fetchAllContacts(query: BaseQuery): Promise<Either<ServiceError, ContactDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactService", `Authorization failed to fetch contacts: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ContactService", `Failed to fetch contacts: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      console.log("Fetch All Contacts Response:", json);
      const items: ContactDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("ContactService", "An unexpected error occurred during fetching contacts.", error));
    }
  }

  async deleteContact(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactService", `Authorization failed to delete contact: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ContactService", `Failed to delete contact: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("ContactService", "An unexpected error occurred during deleting contact.", error));
    }
  }

  async updateContact(reqUpdateContactDto: ReqUpdateContactDto): Promise<Either<ServiceError, ContactDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const { id, ...dataWithoutId } = reqUpdateContactDto;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dataWithoutId),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactService", `Authorization failed to update contact: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("ContactService", errorJson.message || "Failed to update contact", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("ContactService", `Failed to update contact: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ContactDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ContactService", "An unexpected error occurred during updating contact.", error));
    }
  }

  async fetchContactById(id: string): Promise<Either<ServiceError, ContactDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ContactService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/contact/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ContactService", `Authorization failed to fetch contact: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ContactService", `Failed to fetch contact: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ContactDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ContactService", "An unexpected error occurred during fetching contact.", error));
    }
}
}