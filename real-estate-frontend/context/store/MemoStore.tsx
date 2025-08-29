"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { MemoService } from "@/service/memo/MemoService"
import ResEntryMemoDto from "@/domain/memo/ResEntryMemoDto"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"

interface MemoContextValue {
  memos: ResEntryMemoDto[]
  loading: boolean
  refreshMemos: () => Promise<void>
}

const MemoContext = createContext<MemoContextValue>({
  memos: [],
  loading: true,
  refreshMemos: async () => {},
})

export const useMemoContext = () => useContext(MemoContext)

export const MemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [memos, setMemos] = useState<ResEntryMemoDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMemos = async () => {
    setLoading(true)
    const result = await MemoService.instance.fetchAllMemos({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setMemos(result.value)
    } else {
      setMemos([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMemos()
  }, [])

  return (
    <MemoContext.Provider value={{ memos, loading, refreshMemos: fetchMemos }}>
      {children}
      </MemoContext.Provider>
  )
}