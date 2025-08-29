"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import ViewMemoForm from "@/components/form/memo/ViewMemoForm"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BaseFetchFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import { MemoService } from "@/service/memo/MemoService"
import { isLeft } from "@/implementation/Either"
import FileUpload from "@/domain/uploadFile/FileUpload"
import CommonAttachments from "@/components/attached/CommonAttachments"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline"

const TABS = [
	{ key: "detail", label: "View Details" },
	{ key: "attachment", label: "Attachments" },
	{ key: "property", label: "Linked Properties" },
]

const fetchFiles = async (dto: BaseFetchFileRelatedDto) => {
  return MemoService.instance.fetchMemoFileRelated(dto)
}

export default function MemoDetailPage() {
  const [activeTab, setActiveTab] = useState("detail")
  const [searchTerm, setSearchTerm] = useState("all")
  const params = useParams()
  const memoId = typeof params.memoId === "string" ? params.memoId : ""

  // Prepare attachFile and removeFile functions
  const attachFile = async (dto: BaseAttachFileToTarget) => {
    return MemoService.instance.attachFileToMemo(dto)
  }

  const removeFile = async (dto: BaseRemoveFileFromTarget) => {
    return MemoService.instance.removeFileFromMemo({
       ...dto,
      targetId: memoId, // always use memoId from params
    })
    
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
          <h1 className="text-2xl text-left font-bold sm:ml-6">Memo Details</h1>
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
        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 shadow-lg relative">
          {activeTab === "detail" && <ViewMemoForm memoId={memoId} />}
          {activeTab === "attachment" && (
            <CommonAttachments
              id={memoId}
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