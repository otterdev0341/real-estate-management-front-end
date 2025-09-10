"use client"

import { useState } from "react"

import CommonAttachments from "@/components/attached/CommonAttachments"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import { InvestmentService } from "@/service/investment/InvestmentService"
import ViewInvestmentForm from "@/components/form/investment/ViewInvestmentForm"
import { useParams } from "next/navigation"



const TABS = [
  { key: "detail", label: "View Details" },
  { key: "attachment", label: "Attachments" },
]

const fetchFiles = async (dto: BaseFetchFileRelatedDto) => {
  return InvestmentService.instance.fetchInvestmentFileRelated(dto)
}

const attachFile = async (dto: BaseAttachFileToTarget) => {
  return InvestmentService.instance.attachFileToInvestment(dto)
}

const removeFile = async (dto: BaseRemoveFileFromTarget) => {
  return InvestmentService.instance.removeFileFromInvestment(dto)
}

const Page = () => {
  const [activeTab, setActiveTab] = useState("detail")
  const params = useParams();
  const investmentId = typeof params.investmentId === "string" ? params.investmentId : "";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl text-left font-bold sm:ml-6">Investment Details</h1>
        <div className="flex-1" />

        {/* Mobile Tab Selector */}
        <div className="sm:hidden mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab) => (
                <SelectItem key={tab.key} value={tab.key}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs for desktop */}
        <div className="hidden sm:flex items-center border-b border-border mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-muted-foreground hover:text-violet-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 shadow-lg relative overflow-x-auto">
          {activeTab === "detail" && <ViewInvestmentForm investmentId={investmentId} />}
          {activeTab === "attachment" && (
            <CommonAttachments
              id={investmentId}
              fetchFiles={fetchFiles}
              attachFile={attachFile}
              removeFile={removeFile}
            />
          )}
        </div>
      </div>
    </div>
  )
}
export default Page