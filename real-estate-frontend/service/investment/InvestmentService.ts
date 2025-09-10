import { BaseService } from "../base/BaseService";
import Either, { left, right } from "@/implementation/Either";
import { ServiceError, Unauthorized, FetchFailed, CreateFailed, UpdateFailed } from "@/implementation/ServiceError";
import ReqCreateInvestmentDto from "@/domain/investment/create/ReqCreateInvestmentDto";
import ReqUpdateInvestmentDto from "@/domain/investment/update/ReqUpdateInvestmentDto";
import ResEntryInvestmentDto from "@/domain/investment/response/ResEntryInvestmentDto";
import ResEntryInvestmentItemDto from "@/domain/investment/response/ResEntryInvestmentItemDto";
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto";
import FileUpload from "@/domain/uploadFile/FileUpload";
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget";
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget";

export class InvestmentService extends BaseService {
    private static _investmentInstance: InvestmentService;

    private constructor() {
        super();
    }

    public static get instance(): InvestmentService {
        if (!InvestmentService._investmentInstance) {
            InvestmentService._investmentInstance = new InvestmentService();
        }
        return InvestmentService._investmentInstance;
    }

    async createInvestment(reqCreateInvestmentDto: ReqCreateInvestmentDto): Promise<Either<ServiceError, ResEntryInvestmentDto>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const formData = reqCreateInvestmentDto.toFormData();
            console.log("Creating investment with data in investment service:");
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to create investment: ${res.statusText}`, new Error(res.statusText)));
                }
                if (res.status === 400) {
                    const errorJson = await res.json();
                    return left(CreateFailed.create("InvestmentService", errorJson.message || "Failed to create investment", new Error(errorJson.message)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to create investment: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            return right(new ResEntryInvestmentDto(
                responseData.id,
                responseData.note,
                responseData.transaction,
                responseData.property,
                (responseData.items ?? []).map((item: any) =>
                    new ResEntryInvestmentItemDto(
                        item.id,
                        item.investTransaction,
                        item.contact,
                        item.amount,
                        item.percent
                    )
                ),
                responseData.createdAt,
                responseData.updatedAt
            ));
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during creating investment.", error));
        }
    }

    async updateInvestment(reqUpdateInvestmentDto: ReqUpdateInvestmentDto): Promise<Either<ServiceError, ResEntryInvestmentDto>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const targetId = reqUpdateInvestmentDto.getId();
            const payload = reqUpdateInvestmentDto.toFormData();
            console.log("Updating investment with data in investment service:");
            for (const pair of payload.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment/${targetId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: payload
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to update investment: ${res.statusText}`, new Error(res.statusText)));
                }
                if (res.status === 400) {
                    const errorJson = await res.json();
                    return left(UpdateFailed.create("InvestmentService", errorJson.message || "Failed to update investment", new Error(errorJson.message)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to update investment: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            return right(new ResEntryInvestmentDto(
                responseData.id,
                responseData.note,
                responseData.transaction,
                responseData.property,
                (responseData.items ?? []).map((item: any) =>
                    new ResEntryInvestmentItemDto(
                        item.id,
                        item.investTransaction,
                        item.contact,
                        item.amount,
                        item.percent
                    )
                ),
                responseData.createdAt,
                responseData.updatedAt
            ));
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during updating investment.", error));
        }
    }

    async fetchAllInvestments(): Promise<Either<ServiceError, ResEntryInvestmentDto[]>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to fetch investments: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to fetch investments: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            const investments: ResEntryInvestmentDto[] = Array.isArray(responseData.data)
                ? responseData.data.map((investment: any) =>
                    new ResEntryInvestmentDto(
                        investment.id,
                        investment.note,
                        investment.transaction,
                        investment.property,
                        (investment.items ?? []).map((item: any) =>
                            new ResEntryInvestmentItemDto(
                                item.id,
                                item.investTransaction,
                                item.contact,
                                item.amount,
                                item.percent
                            )
                        ),
                        investment.createdAt,
                        investment.updatedAt
                    )
                )
                : [];

            return right(investments);
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during fetching investments.", error));
        }
    }

    async deleteInvestment(id: string): Promise<Either<ServiceError, void>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to delete investment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to delete investment: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(undefined);
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during deleting investment.", error));
        }
    }

    async fetchByInvestmentId(id: string): Promise<Either<ServiceError, ResEntryInvestmentDto>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to fetch investment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to fetch investment: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            const data = responseData.data;
            console.log("Fetched investment data:", data);
            const items = Array.isArray(data.items)
                ? data.items.map((item: any) =>
                    new ResEntryInvestmentItemDto(
                        item.id,
                        item.investTransaction,
                        item.contact,
                        item.amount,
                        item.percent
                    )
                )
                : [];

            const investment = new ResEntryInvestmentDto(
                data.id,
                data.note,
                data.transaction,
                data.property,
                items,
                data.createdAt,
                data.updatedAt
            );

            return right(investment);
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during fetching investment.", error));
        }
    }

    async fetchInvestmentFileRelated(dto: BaseFetchFileRelatedDto): Promise<Either<ServiceError, FileUpload[]>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            if (typeof dto.targetId !== "string" || typeof dto.fileType !== "string") {
                return left(FetchFailed.create("InvestmentService", "Invalid targetId or fileType. Both must be strings."));
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment/${dto.targetId}/files/${dto.fileType}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to fetch investment files: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to fetch investment files: ${res.statusText}`, new Error(res.statusText)));
            }

            const json = await res.json();
            const items: FileUpload[] = json.data ?? [];
            return right(items);
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during fetching investment files.", error));
        }
    }

    async attachFileToInvestment(dto: BaseAttachFileToTarget): Promise<Either<ServiceError, void>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const formData = new FormData();
            formData.append("file", dto.file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment/attach/${dto.targetId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to attach file to investment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to attach file to investment: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(undefined);
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during attaching file to investment.", error));
        }
    }

    async removeFileFromInvestment(dto: BaseRemoveFileFromTarget): Promise<Either<ServiceError, void>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment/remove/${dto.targetId}/${dto.fileId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok && res.status !== 409) {
                if (res.status === 401 ) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to remove file from investment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to remove file from investment: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(undefined);
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during removing file from investment.", error));
        }
    }

    async fetchAllInvestmentByPropertyId(propertyId: string): Promise<Either<ServiceError, ResEntryInvestmentDto[]>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("InvestmentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/investment/property/${propertyId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("InvestmentService", `Authorization failed to fetch investments by property ID: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("InvestmentService", `Failed to fetch investments by property ID: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            const investments: ResEntryInvestmentDto[] = Array.isArray(responseData.data)
                ? responseData.data.map((investment: any) =>
                    new ResEntryInvestmentDto(
                        investment.id,
                        investment.note,
                        investment.transaction,
                        investment.property,
                        (investment.items ?? []).map((item: any) =>
                            new ResEntryInvestmentItemDto(
                                item.id,
                                item.investTransaction,
                                item.contact,
                                item.amount,
                                item.percent
                            )
                        ),
                        investment.createdAt,
                        investment.updatedAt
                    )
                )
                : [];

            return right(investments);
        } catch (error) {
            return left(FetchFailed.create("InvestmentService", "An unexpected error occurred during fetching investments by property ID.", error));
        }
    }
}