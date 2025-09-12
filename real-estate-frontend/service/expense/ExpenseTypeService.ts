import ResEntryExpenseTypeDto from "@/domain/expense/ResEntryExpenseTypeDto"
import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized, UpdateFailed } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ReqUpdateExpenseTypeDto from "@/domain/expense/ReqUpdateExpenseTypeDto"

export class ExpenseTypeService extends BaseService {
  private static _expenseInstance: ExpenseTypeService

  private constructor() {
    super()
  }

  public static get instance(): ExpenseTypeService {
    if (!ExpenseTypeService._expenseInstance) {
      ExpenseTypeService._expenseInstance = new ExpenseTypeService()
    }
    return ExpenseTypeService._expenseInstance
  }

  async createNewExpenseType(data: { detail: string }): Promise<Either<ServiceError, ResEntryExpenseTypeDto>> {

    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseTypeService", `Authorization failed to create expense type: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
        const errorJson = await res.json();
        
        return left(CreateFailed.create("ExpenseTypeService", errorJson.message || "Failed to create expense type", new Error(errorJson.message)));
      }
        return left(CreateFailed.create("ExpenseTypeService", `Failed to create expense type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryExpenseTypeDto = await res.json();
      
      return right(responseData);
    } catch (error) {
      return left(CreateFailed.create("ExpenseTypeService", "An unexpected error occurred during expense type creation.", error));
    }
  }

  async fetchAllExpenseTypes(query: BaseQuery): Promise<Either<ServiceError, ResEntryExpenseTypeDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense-type`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseTypeService", `Authorization failed to fetch expense types: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ExpenseTypeService", `Failed to fetch expense types: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryExpenseTypeDto[] = json.data?.items ?? [];
      console.log("Fetched expense types:", items.length);
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("ExpenseTypeService", "An unexpected error occurred during fetching expense types.", error));
    }
  }

  async deleteExpenseType(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense-type/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseTypeService", `Authorization failed to delete expense type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ExpenseTypeService", `Failed to delete expense type: ${res.statusText}`, new Error(res.statusText)));
      }
      

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("ExpenseTypeService", "An unexpected error occurred during deleting expense type.", error));
    }
  }

  async updateExpenseType(reqUpdateExpenseTypeDto: ReqUpdateExpenseTypeDto): Promise<Either<ServiceError, ResEntryExpenseTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseTypeService", "No authentication token found."));
      }

      

      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense-type/${reqUpdateExpenseTypeDto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({detail: reqUpdateExpenseTypeDto.detail }),
      });
      
    

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseTypeService", `Authorization failed to update expense type: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("ExpenseTypeService", errorJson.message || "Failed to update expense type", new Error(errorJson.message)));
      }
        return left(FetchFailed.create("ExpenseTypeService", `Failed to update expense type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryExpenseTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ExpenseTypeService", "An unexpected error occurred during updating expense type.", error));
    }
  }

  async fetchExpenseTypeById(id: string): Promise<Either<ServiceError, ResEntryExpenseTypeDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseTypeService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense-type/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseTypeService", `Authorization failed to fetch expense type: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ExpenseTypeService", `Failed to fetch expense type: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryExpenseTypeDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ExpenseTypeService", "An unexpected error occurred during fetching expense type.", error));
    }
}
}