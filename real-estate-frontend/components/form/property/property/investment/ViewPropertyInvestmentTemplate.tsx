"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ViewPropertyInvestmentTable from "./ViewPropertyInvestmentTable"
import ViewPropertyInvestmentSummary from "./ViewPropertyInvestmentSummary"

interface ViewPropertyInvestmentTemplateProps {
  propertyId: string
}

const ViewPropertyInvestmentTemplate = ({ propertyId }: ViewPropertyInvestmentTemplateProps) => {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="all">All Investments</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ViewPropertyInvestmentTable propertyId={propertyId} />
        </TabsContent>

        <TabsContent value="summary">
          <ViewPropertyInvestmentSummary propertyId={propertyId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ViewPropertyInvestmentTemplate