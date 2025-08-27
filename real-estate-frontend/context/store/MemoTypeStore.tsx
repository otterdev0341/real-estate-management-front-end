"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { MemoTypeService } from "@/service/memo/MemoTypeService"
import { ResEntryMemoTypeDto } from "@/domain/memo/ResEntryMemoTypeDto"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight, left, right } from "@/implementation/Either"

interface MemoTypeContextValue {
  memoTypes: ResEntryMemoTypeDto[]
  loading: boolean
  refreshMemoTypes: () => Promise<void>
}

const MemoTypeContext = createContext<MemoTypeContextValue>({
  memoTypes: [],
  loading: true,
  refreshMemoTypes: async () => {},
})

export const useMemoTypeContext = () => useContext(MemoTypeContext)

export const MemoTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [memoTypes, setMemoTypes] = useState<ResEntryMemoTypeDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMemoTypes = async () => {
    setLoading(true)
    const result = await MemoTypeService.instance.fetchAllMemoTypes({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setMemoTypes(result.value)
    } else {
      setMemoTypes([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMemoTypes()
  }, [])

  return (
    <MemoTypeContext.Provider value={{ memoTypes, loading, refreshMemoTypes: fetchMemoTypes }}>
      {children}
    </MemoTypeContext.Provider>
  )
}