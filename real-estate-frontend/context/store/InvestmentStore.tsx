"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { InvestmentService } from "@/service/investment/InvestmentService"
import ResEntryInvestmentDto from "@/domain/investment/response/ResEntryInvestmentDto"
import Either, { isRight } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"

interface InvestmentContextValue {
  investments: ResEntryInvestmentDto[]
  loading: boolean
  refreshInvestments: () => Promise<void>
}

const InvestmentContext = createContext<InvestmentContextValue>({
  investments: [],
  loading: true,
  refreshInvestments: async () => {},
})

export const useInvestmentContext = () => useContext(InvestmentContext)

export const InvestmentProvider = ({ children }: { children: React.ReactNode }) => {
  const [investments, setInvestments] = useState<ResEntryInvestmentDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvestments = async () => {
    setLoading(true)
    const result: Either<ServiceError, ResEntryInvestmentDto[]> = await InvestmentService.instance.fetchAllInvestments()
    if (isRight(result) && Array.isArray(result.value)) {
      setInvestments(result.value)
    } else {
      setInvestments([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInvestments()
  }, [])

  useEffect(() => {
    // Log investments when they actually change
    // console.log("Updated investments in InvestmentProvider", investments)
  }, [investments])

  return (
    <InvestmentContext.Provider value={{ investments, loading, refreshInvestments: fetchInvestments }}>
      {children}
    </InvestmentContext.Provider>
  )
}

const InvestmentStore = () => {
  return (
    <div>InvestmentStore</div>
  )
}

export default InvestmentStore