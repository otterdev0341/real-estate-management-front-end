import Either, { left, right } from "@/implementation/Either"
import { BaseService } from "../base/BaseService"
import { CreateFailed, FetchFailed, ServiceError, Unauthorized } from "@/implementation/ServiceError"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import ResEntryExpenseDto from "@/domain/expense/ResEntryExpenseDto"
import ReqUpdateExpenseDto from "@/domain/expense/ReqUpdateExpenseDto"

export class ExpenseService extends BaseService {
  private static _expenseInstance: ExpenseService

  private constructor() {
    super()
  }

  public static get instance(): ExpenseService {
    if (!ExpenseService._expenseInstance) {
      ExpenseService._expenseInstance = new ExpenseService()
    }
    return ExpenseService._expenseInstance
  }

  async createNewExpense(data: { detail: string; expenseType: string }): Promise<Either<ServiceError, ResEntryExpenseDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseService", `Authorization failed to create expense: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(CreateFailed.create("ExpenseService", errorJson.message || "Failed to create expense", new Error(errorJson.message)));
        }
        return left(CreateFailed.create("ExpenseService", `Failed to create expense: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryExpenseDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(CreateFailed.create("ExpenseService", "An unexpected error occurred during expense creation.", error));
    }
  }

  async fetchAllExpenses(query: BaseQuery): Promise<Either<ServiceError, ResEntryExpenseDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "body": JSON.stringify(query)
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseService", `Authorization failed to fetch expenses: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ExpenseService", `Failed to fetch expenses: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      const items: ResEntryExpenseDto[] = json.data?.items ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("ExpenseService", "An unexpected error occurred during fetching expenses.", error));
    }
  }

  async deleteExpense(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseService", `Authorization failed to delete expense: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ExpenseService", `Failed to delete expense: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("ExpenseService", "An unexpected error occurred during deleting expense.", error));
    }
  }

  async updateExpense(id: string, data: ReqUpdateExpenseDto): Promise<Either<ServiceError, ResEntryExpenseDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseService", `Authorization failed to update expense: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(FetchFailed.create("ExpenseService", errorJson.message || "Failed to update expense", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("ExpenseService", `Failed to update expense: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryExpenseDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ExpenseService", "An unexpected error occurred during updating expense.", error));
    }
  }

  async fetchExpenseById(id: string): Promise<Either<ServiceError, ResEntryExpenseDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("ExpenseService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/expense/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("ExpenseService", `Authorization failed to fetch expense: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("ExpenseService", `Failed to fetch expense: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData: ResEntryExpenseDto = await res.json();
      return right(responseData);
    } catch (error) {
      return left(FetchFailed.create("ExpenseService", "An unexpected error occurred during fetching expense.", error));
    }
}
}