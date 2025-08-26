"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContactTable from "@/components/table/contact/ContactTable"
import ConntactTypeTable from "@/components/table/contact/ConntactTypeTable"

const page = () => {
  const [activeTab, setActiveTab] = useState("contacts")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contact Management</h1>
            <p className="text-muted-foreground">Manage your contacts and contact types</p>
          </div>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contacts">Contacts</SelectItem>
              <SelectItem value="types">Contact Types</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-2 lg:w-[300px]">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="types">Contact Types</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <ContactTable />
          </TabsContent>

          <TabsContent value="types">
            <ConntactTypeTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
export default page