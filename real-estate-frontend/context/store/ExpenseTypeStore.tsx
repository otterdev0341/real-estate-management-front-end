"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ExpenseTypeService } from "@/service/expense/ExpenseTypeService"

import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"
import ResEntryExpenseTypeDto from "@/domain/expense/ResEntryExpenseTypeDto"

interface ExpenseTypeContextValue {
  expenseTypes: ResEntryExpenseTypeDto[]
  loading: boolean
  refreshExpenseTypes: () => Promise<void>
}

const ExpenseTypeContext = createContext<ExpenseTypeContextValue>({
  expenseTypes: [],
  loading: true,
  refreshExpenseTypes: async () => {},
})

export const useExpenseTypeContext = () => useContext(ExpenseTypeContext)

export const ExpenseTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [expenseTypes, setExpenseTypes] = useState<ResEntryExpenseTypeDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenseTypes = async () => {
    setLoading(true)
    const result = await ExpenseTypeService.instance.fetchAllExpenseTypes({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setExpenseTypes(result.value)
    } else {
      setExpenseTypes([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchExpenseTypes()
  }, [])

  return (
    <ExpenseTypeContext.Provider value={{ expenseTypes, loading, refreshExpenseTypes: fetchExpenseTypes }}>
      {children}
    </ExpenseTypeContext.Provider>
  )
}