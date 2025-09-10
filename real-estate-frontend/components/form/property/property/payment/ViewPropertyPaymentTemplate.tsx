"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ViewPropertyPaymentTable from "./ViewPropertyPaymentTable"
import ViewPropertyPaymentSummary from "./ViewPropertyPaymentSummary"

interface ViewPropertyPaymentTemplateProps {
  propertyId: string
}

const ViewPropertyPaymentTemplate = ({ propertyId }: ViewPropertyPaymentTemplateProps) => {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ViewPropertyPaymentTable propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="summary">
          <ViewPropertyPaymentSummary propertyId={propertyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ViewPropertyPaymentTemplate