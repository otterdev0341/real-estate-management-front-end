"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ExpenseTable from "@/components/table/expense/ExpenseTable"
import ExpenseTypeTable from "@/components/table/expense/ExpenseTypeTable"

const page = () => {
  const [activeTab, setActiveTab] = useState("expenses")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
            <p className="text-muted-foreground">Manage your expenses and expense types</p>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expenses">Expenses</SelectItem>
              <SelectItem value="types">Expense Types</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="types">Expense Types</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <ExpenseTable />
          </TabsContent>

          <TabsContent value="types">
            <ExpenseTypeTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
export default page