"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { PaymentService } from "@/service/payment/paymentService"
import ResEntryPaymentDto from "@/domain/payment/response/ResEntryPaymentDto"
import Either, { isRight } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"

interface PaymentContextValue {
  payments: ResEntryPaymentDto[]
  loading: boolean
  refreshPayments: () => Promise<void>
}

const PaymentContext = createContext<PaymentContextValue>({
  payments: [],
  loading: true,
  refreshPayments: async () => {},
})

export const usePaymentContext = () => useContext(PaymentContext)

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const [payments, setPayments] = useState<ResEntryPaymentDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {
    setLoading(true)
    const result: Either<ServiceError, ResEntryPaymentDto[]> = await PaymentService.instance.fetchAllPayments()
    if (isRight(result) && Array.isArray(result.value)) {
      setPayments(result.value)
    } else {
      setPayments([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    // Log payments when they actually change
    console.log("Updated payments in PaymentProvider", payments)
  }, [payments])

  return (
    <PaymentContext.Provider value={{ payments, loading, refreshPayments: fetchPayments }}>
      {children}
    </PaymentContext.Provider>
  )
}

const PaymentStore = () => {
  return (
    <div>PaymentStore</div>
  )
}
export default PaymentStore