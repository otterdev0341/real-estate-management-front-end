"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { SaleService } from "@/service/sale/SaleService"
import ResEntrySaleDto from "@/domain/sale/ResEntrySaleDto"
import Either, { isRight } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"

interface SaleContextValue {
  sales: ResEntrySaleDto[]
  loading: boolean
  refreshSales: () => Promise<void>
}

const SaleContext = createContext<SaleContextValue>({
  sales: [],
  loading: true,
  refreshSales: async () => {},
})

export const useSaleContext = () => useContext(SaleContext)

export const SaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [sales, setSales] = useState<ResEntrySaleDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSales = async () => {
    setLoading(true)
    const result: Either<ServiceError, ResEntrySaleDto[]> = await SaleService.instance.fetchAllSales()
    console.log("Result from SaleService:", result.value)
    if (isRight(result) && Array.isArray(result.value)) {
      console.log("Setting sales to:", result.value)
      setSales(result.value)
    } else {
      setSales([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSales()
  }, [])

  // Log sales when they actually change
  useEffect(() => {
    console.log("Updated sales in SaleProvider", sales)
  }, [sales])

  return (
    <SaleContext.Provider value={{ sales, loading, refreshSales: fetchSales }}>
      {children}
    </SaleContext.Provider>
  )
}