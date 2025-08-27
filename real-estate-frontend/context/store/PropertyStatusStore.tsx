"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { PropertyStatusService } from "@/service/property/PropertyStatusService"
import { ResEntryPropertyStatusDto } from "@/domain/property/propertyStatus/ResEntryPropertyStatusDto"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"

interface PropertyStatusContextValue {
  propertyStatuses: ResEntryPropertyStatusDto[]
  loading: boolean
  refreshPropertyStatuses: () => Promise<void>
}

const PropertyStatusContext = createContext<PropertyStatusContextValue>({
  propertyStatuses: [],
  loading: true,
  refreshPropertyStatuses: async () => {},
})

export const usePropertyStatusContext = () => useContext(PropertyStatusContext)

export const PropertyStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [propertyStatuses, setPropertyStatuses] = useState<ResEntryPropertyStatusDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPropertyStatuses = async () => {
    setLoading(true)
    const result = await PropertyStatusService.instance.fetchAllPropertyStatuses({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setPropertyStatuses(result.value)
    } else {
      setPropertyStatuses([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPropertyStatuses()
  }, [])

  return (
    <PropertyStatusContext.Provider value={{ propertyStatuses, loading, refreshPropertyStatuses: fetchPropertyStatuses }}>
      {children}
    </PropertyStatusContext.Provider>
  )
}