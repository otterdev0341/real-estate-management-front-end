import { BaseService } from "../base/BaseService"
import Either, { left, right } from "@/implementation/Either"
import { ServiceError, Unauthorized, FetchFailed, CreateFailed, UpdateFailed } from "@/implementation/ServiceError"

import FileUpload from "@/domain/uploadFile/FileUpload"
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import ReqCreatePaymentDto from "@/domain/payment/create/ReqCreatePaymentDto"
import ResEntryPaymentDto from "@/domain/payment/response/ResEntryPaymentDto"
import ReqUpdatePaymentDto from "@/domain/payment/update/ReqUpdatePaymentDto"
import ResEntryPaymentItemDto from "@/domain/payment/response/ResEntryPaymentItemDto"

export class PaymentService extends BaseService {
    private static _paymentInstance: PaymentService;

    private constructor() {
        super();
    }

    public static get instance(): PaymentService {
        if (!PaymentService._paymentInstance) {
            PaymentService._paymentInstance = new PaymentService();
        }
        return PaymentService._paymentInstance;
    }

    async createPayment(reqCreatePaymentDto: ReqCreatePaymentDto): Promise<Either<ServiceError, ResEntryPaymentDto>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const formData = reqCreatePaymentDto.toFormData();
            console.log("FormData entries:", formData);
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to create payment: ${res.statusText}`, new Error(res.statusText)));
                }
                if (res.status === 400) {
                    const errorJson = await res.json();
                    return left(CreateFailed.create("PaymentService", errorJson.message || "Failed to create payment", new Error(errorJson.message)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to create payment: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            return right(new ResEntryPaymentDto(
                responseData.id,
                responseData.transaction,
                responseData.property,
                responseData.contact,
                responseData.note,
                responseData.items ?? [],
                responseData.createdAt,
                responseData.updatedAt,
                
            ));
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during creating payment.", error));
        }
    }

    async updatePayment(reqUpdatePaymentDto: ReqUpdatePaymentDto): Promise<Either<ServiceError, ResEntryPaymentDto>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const targetId = reqUpdatePaymentDto.getId();
            const payload = reqUpdatePaymentDto.toFormData();
            // console.log("Update Payment FormData entries:", payload);
            // for (const pair of payload.entries()) {
            //     console.log(`${pair[0]}: ${pair[1]}`);
            // }
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/${targetId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: payload
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to update payment: ${res.statusText}`, new Error(res.statusText)));
                }
                if (res.status === 400) {
                    const errorJson = await res.json();
                    return left(UpdateFailed.create("PaymentService", errorJson.message || "Failed to update payment", new Error(errorJson.message)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to update payment: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            console.log("Raw payment update response data:", responseData);
            return right(new ResEntryPaymentDto(
                responseData.id,
                responseData.transactionType,
                responseData.note,
                responseData.amount,
                responseData.createdBy,
                responseData.createdAt,
                responseData.updatedAt,
                responseData.items ?? []
            ));
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during updating payment.", error));
        }
    }

    async fetchAllPayments(): Promise<Either<ServiceError, ResEntryPaymentDto[]>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to fetch payments: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to fetch payments: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            console.log("Raw payment fetch response data:", responseData);

            // Correct mapping: responseData.data is an array of payments
            const payments: ResEntryPaymentDto[] = Array.isArray(responseData.data)
                ? responseData.data.map((payment: any) =>
                    new ResEntryPaymentDto(
                        payment.id,
                        payment.transaction,
                        payment.property,
                        payment.note ?? "",
                        payment.contact,
                        (payment.items ?? []).map((item: any) =>
                            new ResEntryPaymentItemDto(
                                item.id,
                                item.paymentTransaction,
                                item.expense,
                                item.amount,
                                item.price
                            )
                        ),
                        payment.createdAt,
                        payment.updatedAt
                    )
                )
                : [];

            console.log("Fetched payments:", payments);
            return right(payments);
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during fetching payments.", error));
        }
    }

    async deletePayment(id: string): Promise<Either<ServiceError, void>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to delete payment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to delete payment: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(undefined);
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during deleting payment.", error));
        }
    }

    async fetchByPaymentId(id: string): Promise<Either<ServiceError, ResEntryPaymentDto>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/${id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to fetch payment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to fetch payment: ${res.statusText}`, new Error(res.statusText)));
            }

            const responseData = await res.json();
            const data = responseData.data;

            // Map items if present
            const items = Array.isArray(data.items)
                ? data.items.map((item: any) =>
                    new ResEntryPaymentItemDto(
                        item.id,
                        item.paymentTransaction,
                        item.expense,
                        item.amount,
                        item.price
                    )
                )
                : [];

            // Map payment object
            const payment = new ResEntryPaymentDto(
                data.id,
                data.transaction,
                data.property,
                data.note ?? "",
                data.contact,
                items,
                data.createdAt,
                data.updatedAt
            );

            return right(payment);
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during fetching payment.", error));
        }
    }

    async fetchPaymentFileRelated(dto: BaseFetchFileRelatedDto): Promise<Either<ServiceError, FileUpload[]>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            if (typeof dto.targetId !== "string" || typeof dto.fileType !== "string") {
                return left(FetchFailed.create("PaymentService", "Invalid targetId or fileType. Both must be strings."));
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/${dto.targetId}/files/${dto.fileType}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to fetch payment files: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to fetch payment files: ${res.statusText}`, new Error(res.statusText)));
            }

            const json = await res.json();
            const items: FileUpload[] = json.data ?? [];
            return right(items);
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during fetching payment files.", error));
        }
    }

    async attachFileToPayment(dto: BaseAttachFileToTarget): Promise<Either<ServiceError, void>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();

            const formData = new FormData();
            formData.append("file", dto.file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/attach/${dto.targetId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) {
                if (res.status === 401) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to attach file to payment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to attach file to payment: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(undefined);
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during attaching file to payment.", error));
        }
    }

    async removeFileFromPayment(dto: BaseRemoveFileFromTarget): Promise<Either<ServiceError, void>> {
        try {
            if (!this.isTokenExist()) {
                return left(Unauthorized.create("PaymentService", "No authentication token found."));
            }
            const token = this.getUserToken().get();
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payment/remove/${dto.targetId}/${dto.fileId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!res.ok && res.status !== 409) {
                if (res.status === 401 ) {
                    return left(Unauthorized.create("PaymentService", `Authorization failed to remove file from payment: ${res.statusText}`, new Error(res.statusText)));
                }
                return left(FetchFailed.create("PaymentService", `Failed to remove file from payment: ${res.statusText}`, new Error(res.statusText)));
            }

            return right(undefined);
        } catch (error) {
            return left(FetchFailed.create("PaymentService", "An unexpected error occurred during removing file from payment.", error));
        }
    }
}