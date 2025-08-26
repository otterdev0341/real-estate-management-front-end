"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PropertyTable from "@/components/table/property/PropertyTable"
import PropertyTypeTable from "@/components/table/property/PropertyTypeTable"
import PropertyStatusTable from "@/components/table/property/PropertyStatusTable"

export default function PropertyManagement() {
  const [activeTab, setActiveTab] = useState("properties")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Property Management</h1>
            <p className="text-muted-foreground">Manage your real estate portfolio</p>
          </div>
        </div>

        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="properties">Properties</SelectItem>
              <SelectItem value="types">Property Types</SelectItem>
              <SelectItem value="statuses">Property Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="types">Property Types</TabsTrigger>
            <TabsTrigger value="statuses">Property Status</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertyTable />
          </TabsContent>

          <TabsContent value="types">
            <PropertyTypeTable />
          </TabsContent>

          <TabsContent value="statuses">
            <PropertyStatusTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
