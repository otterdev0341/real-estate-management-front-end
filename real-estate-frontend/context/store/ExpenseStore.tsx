"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ExpenseService } from "@/service/expense/ExpenseService"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"
import ResEntryExpenseDto from "@/domain/expense/ResEntryExpenseDto"

interface ExpenseContextValue {
  expenses: ResEntryExpenseDto[]
  loading: boolean
  refreshExpenses: () => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextValue>({
  expenses: [],
  loading: true,
  refreshExpenses: async () => {},
})

export const useExpenseContext = () => useContext(ExpenseContext)

export const ExpenseProvider = ({ children }: { children: React.ReactNode }) => {
  const [expenses, setExpenses] = useState<ResEntryExpenseDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = async () => {
    setLoading(true)
    const result = await ExpenseService.instance.fetchAllExpenses({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setExpenses(result.value)
    } else {
      setExpenses([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  return (
    <ExpenseContext.Provider value={{ expenses, loading, refreshExpenses: fetchExpenses }}>
      {children}
    </ExpenseContext.Provider>
  )
}