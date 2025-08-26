"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MemoTable from "@/components/table/memo/MemoTable"
import MemoTypeTable from "@/components/table/memo/MemoTypeTable"

const page = () => {
  const [activeTab, setActiveTab] = useState("memos")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Memo Management</h1>
            <p className="text-muted-foreground">Manage your memos and memo types</p>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="memos">Memos</SelectItem>
              <SelectItem value="types">Memo Types</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="memos">Memos</TabsTrigger>
            <TabsTrigger value="types">Memo Types</TabsTrigger>
          </TabsList>

          <TabsContent value="memos">
            <MemoTable />
          </TabsContent>

          <TabsContent value="types">
            <MemoTypeTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
export default page