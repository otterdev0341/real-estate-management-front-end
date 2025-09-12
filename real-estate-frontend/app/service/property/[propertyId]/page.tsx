"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import ViewPropertyForm from "@/components/form/property/property/ViewPropertyForm"
import CommonAttachments from "@/components/attached/CommonAttachments"
import PropertyTypeTransferList from "@/components/form/property/property/transferList/PropertyTypeTransferList"
import MemoTransferList from "@/components/form/memo/tranferList/MemoTransferList"
import ViewPropertyMemo from "@/components/form/property/displayMemoList/ViewPropertyMemo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import { PropertyService } from "@/service/property/PropertyService"
import { isLeft, isRight } from "@/implementation/Either"
import FileUpload from "@/domain/uploadFile/FileUpload"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import ViewPropertyPaymentTable from "@/components/form/property/property/payment/ViewPropertyPaymentTable"
import ViewPropertyPaymentTemplate from "@/components/form/property/property/payment/ViewPropertyPaymentTemplate"
import ViewPropertyInvestmentTemplate from "@/components/form/property/property/investment/ViewPropertyInvestmentTemplate"
import PropertyForcase from "@/components/form/property/forcase/PropertyForcase"

const TABS = [
  { key: "detail", label: "View Details" },
  { key: "attachment", label: "Attachments" },
  { key: "forcast", label: "Forecast" },
  { key: "propertyType", label: "Property Type" },
  { key: "memo", label: "Memos" },
  { key:"payment" , label: "Payments" },
  { key: "investment", label: "Investments" },
]

const fetchFiles = async (dto: BaseFetchFileRelatedDto) => {
  return PropertyService.instance.fetchPropertyFileRelated(dto)
}

export default function PropertyDetailPage() {
  const [activeTab, setActiveTab] = useState("detail")
  const [searchTerm, setSearchTerm] = useState("all")
  const params = useParams()
  const propertyId = typeof params.propertyId === "string" ? params.propertyId : ""

  // Prepare attachFile and removeFile functions
  const attachFile = async (dto: BaseAttachFileToTarget) => {
    return PropertyService.instance.attachFileToProperty(dto)
  }

  const removeFile = async (dto: BaseRemoveFileFromTarget) => {
    return PropertyService.instance.removeFileFromProperty({
      ...dto,
      targetId: propertyId,
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl text-left font-bold sm:ml-6">Property Details</h1>
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
              onClick={() => {
                setActiveTab(tab.key)
                if (tab.key === "attachment") setSearchTerm("all")
              }}
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
          {activeTab === "detail" && <ViewPropertyForm propertyId={propertyId} />}
          {activeTab === "attachment" && (
            <CommonAttachments
              id={propertyId}
              fetchFiles={fetchFiles}
              attachFile={attachFile}
              removeFile={removeFile}
            />
          )}
          {activeTab === "forcast" && (
            <div>
              <PropertyForcase propertyId={propertyId} />
            </div>
          )}
          {activeTab === "propertyType" && (
            <PropertyTypeTransferList propertyId={propertyId} />
          )}
          {activeTab === "property" && (
            <div className="w-full">
              {/* Responsive MemoTransferList for mobile and desktop */}
              {/* <div className="md:hidden space-y-4">
                <MemoTransferList memoId={propertyId} />
              </div>
              <div className="hidden md:block">
                <MemoTransferList memoId={propertyId} />
              </div> */}
            </div>
          )}
          {activeTab === "memo" && (
            <ViewPropertyMemo propertyId={propertyId} />
          )}
          {activeTab === "payment" && (
            <ViewPropertyPaymentTemplate propertyId={propertyId} />
          )}
          {activeTab === "investment" && (
            <ViewPropertyInvestmentTemplate propertyId={propertyId} />
          )}
        </div>
      </div>
    </div>
  )
}