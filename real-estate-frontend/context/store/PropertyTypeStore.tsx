"use client"

import { createContext, useContext, useEffect, useState } from "react"

import ResEntryPropertyTypeDto from "@/domain/property/propertyType/ResEntryPropertyTypeDto"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"
import { PropertyTypeService } from "@/service/property/PropertyTypeService"

interface PropertyTypeContextValue {
  propertyTypes: ResEntryPropertyTypeDto[]
  loading: boolean
  refreshPropertyTypes: () => Promise<void>
}

const PropertyTypeContext = createContext<PropertyTypeContextValue>({
  propertyTypes: [],
  loading: true,
  refreshPropertyTypes: async () => {},
})

export const usePropertyTypeContext = () => useContext(PropertyTypeContext)

export const PropertyTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [propertyTypes, setPropertyTypes] = useState<ResEntryPropertyTypeDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPropertyTypes = async () => {
    setLoading(true)
    const result = await PropertyTypeService.instance.fetchAllPropertyTypes({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setPropertyTypes(result.value)
    } else {
      setPropertyTypes([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPropertyTypes()
  }, [])

  return (
    <PropertyTypeContext.Provider value={{ propertyTypes, loading, refreshPropertyTypes: fetchPropertyTypes }}>
      {children}
    </PropertyTypeContext.Provider>
  )
}