"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { PropertyService } from "@/service/property/PropertyService"
import ResEntryPropertyDto from "@/domain/property/property/ResEntryPropertyDto"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"

interface PropertyContextValue {
  properties: ResEntryPropertyDto[]
  loading: boolean
  refreshProperties: () => Promise<void>
}

const PropertyContext = createContext<PropertyContextValue>({
  properties: [],
  loading: true,
  refreshProperties: async () => {},
})

export const usePropertyContext = () => useContext(PropertyContext)

export const PropertyProvider = ({ children }: { children: React.ReactNode }) => {
  const [properties, setProperties] = useState<ResEntryPropertyDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProperties = async () => {
    setLoading(true)
    const result = await PropertyService.instance.fetchAllProperties({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setProperties(result.value)
    } else {
      setProperties([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  return (
    <PropertyContext.Provider value={{ properties, loading, refreshProperties: fetchProperties }}>
      {children}
    </PropertyContext.Provider>
  )
}