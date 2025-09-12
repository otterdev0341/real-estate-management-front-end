import ReqCreateSaleDto from "@/domain/sale/ReqCreateSaleDto"
import ReqUpdateSaleDto from "@/domain/sale/ReqUpdateSaleDto"
import ResEntrySaleDto from "@/domain/sale/ResEntrySaleDto"
import Either, { left, right } from "@/implementation/Either"
import { ServiceError, Unauthorized, FetchFailed, CreateFailed, UpdateFailed } from "@/implementation/ServiceError"
import { BaseService } from "../base/BaseService"
import Pair from "@/implementation/Pair"
import FileUpload from "@/domain/uploadFile/FileUpload"
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"


export class SaleService extends BaseService {
  private static _saleInstance: SaleService

  private constructor() {
    super()
  }

  public static get instance(): SaleService {
    if (!SaleService._saleInstance) {
      SaleService._saleInstance = new SaleService()
    }
    return SaleService._saleInstance
  }

  async createSale(reqCreateSaleDto: ReqCreateSaleDto): Promise<Either<ServiceError, ResEntrySaleDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const formData = reqCreateSaleDto.toFormData();
      
      // for (let pair of formData.entries()) {
      //   console.log(`${pair[0]}: ${pair[1]}`);
      // }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Do not set Content-Type for multipart/form-data
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("SaleService", `Authorization failed to create sale: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          // console.log(errorJson);
          return left(CreateFailed.create("SaleService", errorJson.message || "Failed to create sale", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("SaleService", `Failed to create sale: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData = await res.json();
      // console.log("Response Data in sale service:", responseData);
      // You may need to map responseData to ResEntrySaleDto if not already
      return right(new ResEntrySaleDto(
        responseData.id,
        responseData.transactionType,
        responseData.property,
        responseData.contact,
        responseData.price,
        responseData.note,
        responseData.createdBy,
        responseData.createdAt,
        responseData.updatedAt
      ));
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during creating sale.", error));
    }
  }

  async updateSale(reqUpdateSaleDto: ReqUpdateSaleDto): Promise<Either<ServiceError, ResEntrySaleDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const targetId = reqUpdateSaleDto.getSaleId().toString();
      const payload = reqUpdateSaleDto.toFormData();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale/${targetId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: payload
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("SaleService", `Authorization failed to update sale: ${res.statusText}`, new Error(res.statusText)));
        }
        if (res.status === 400) {
          const errorJson = await res.json();
          return left(UpdateFailed.create("SaleService", errorJson.message || "Failed to update sale", new Error(errorJson.message)));
        }
        return left(FetchFailed.create("SaleService", `Failed to update sale: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData = await res.json();
      // console.log("Response Data in update sale service:", responseData);
      return right(new ResEntrySaleDto(
        responseData.id,
        responseData.transactionType,
        responseData.property,
        responseData.contact,
        responseData.price,
        responseData.note,
        responseData.createdBy,
        responseData.saleDate,
        responseData.updatedAt
      ));
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during updating sale.", error));
    }
  }

  // Example: fetch all sales
  async fetchAllSales(): Promise<Either<ServiceError, ResEntrySaleDto[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("SaleService", `Authorization failed to fetch sales: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("SaleService", `Failed to fetch sales: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData = await res.json();
      
      const items: ResEntrySaleDto[] = responseData?.data?.items ?? [];
      // console.log(`Response Data in fetchAllSales: `, items);
      const sales = Array.isArray(items)
        ? items.map((sale: any) =>
            new ResEntrySaleDto(
              sale.id,
              sale.transactionType,
              sale.property,
              sale.contact,
              sale.price,
              sale.note,
              sale.createdBy,
              sale.saleDate,
              sale.updatedAt
            )
          )
        : [];
      return right(sales);
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during fetching sales.", error));
    }
  }

  async deleteSale(id: string): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("SaleService", `Authorization failed to delete sale: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("SaleService", `Failed to delete sale: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during deleting sale.", error));
    }
  }

  async fetchBySaleId(id: string): Promise<Either<ServiceError, ResEntrySaleDto>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("SaleService", `Authorization failed to fetch sale: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("SaleService", `Failed to fetch sale: ${res.statusText}`, new Error(res.statusText)));
      }

      const responseData = await res.json();
      const data = responseData.data;
      // console.log("Response Data in fetchBySaleId:", data);

      const sale = new ResEntrySaleDto(
        data.id,
        data.transactionType,
        data.property,
        data.contact,
        data.price,
        data.note,
        data.createdBy,
        data.saleDate,
        data.updatedAt
      );
      return right(sale);
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during fetching sale.", error));
    }
  }

  async fetchSaleFileRelated(dto: BaseFetchFileRelatedDto): Promise<Either<ServiceError, FileUpload[]>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      if (typeof dto.targetId !== "string" || typeof dto.fileType !== "string") {
        return left(FetchFailed.create("SaleService", "Invalid targetId or fileType. Both must be strings."));
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale/${dto.targetId}/files/${dto.fileType}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("SaleService", `Authorization failed to fetch sale files: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("SaleService", `Failed to fetch sale files: ${res.statusText}`, new Error(res.statusText)));
      }

      const json = await res.json();
      // console.log("Response Data in fetchSaleFileRelated:", json);
      const items: FileUpload[] = json.data ?? [];
      return right(items);
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during fetching sale files.", error));
    }
  }

  async attachFileToSale(dto: BaseAttachFileToTarget): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();

      const formData = new FormData();
      formData.append("file", dto.file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale/attach/${dto.targetId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) {
          return left(Unauthorized.create("SaleService", `Authorization failed to attach file to sale: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("SaleService", `Failed to attach file to sale: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during attaching file to sale.", error));
    }
  }

  async removeFileFromSale(dto: BaseRemoveFileFromTarget): Promise<Either<ServiceError, void>> {
    try {
      if (!this.isTokenExist()) {
        return left(Unauthorized.create("SaleService", "No authentication token found."));
      }
      const token = this.getUserToken().get();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/sale/remove/${dto.targetId}/${dto.fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok && res.status !== 409) {
        if (res.status === 401 ) {
          return left(Unauthorized.create("SaleService", `Authorization failed to remove file from sale: ${res.statusText}`, new Error(res.statusText)));
        }
        return left(FetchFailed.create("SaleService", `Failed to remove file from sale: ${res.statusText}`, new Error(res.statusText)));
      }

      return right(undefined);
    } catch (error) {
      return left(FetchFailed.create("SaleService", "An unexpected error occurred during removing file from sale.", error));
    }
  }
}
