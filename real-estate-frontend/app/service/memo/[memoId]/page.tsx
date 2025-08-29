"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import ViewMemoForm from "@/components/form/memo/ViewMemoForm"
import CommonAttachments from "@/components/attached/CommonAttachments"

const TABS = [
  { key: "detail", label: "View Details" },
  { key: "attachment", label: "Attachments" },
  { key: "property", label: "Linked Properties" }
]

// Example fetchFiles function for CommonAttachments
const fetchFiles = async (id: string) => {
  // Replace with your real fetch logic
  return []
}

export default function MemoDetailPage() {
  const [activeTab, setActiveTab] = useState("detail")
  const [searchTerm, setSearchTerm] = useState("all")
  const params = useParams()
  const memoId = typeof params.memoId === "string" ? params.memoId : ""

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <a href="/service/memo" className="text-muted-foreground text-sm hover:underline">&larr; Back to Memos</a>
        <h1 className="text-2xl font-bold ml-6">Memo Details</h1>
        <div className="flex-1" />
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border mb-6">
        {TABS.map(tab => (
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
      <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-6 shadow-lg relative">
        {activeTab === "detail" && (
          <ViewMemoForm memoId={memoId} />
        )}
        {activeTab === "attachment" && (
          <CommonAttachments
            id={memoId}
            fetchFiles={fetchFiles}
            attachFile={async () => {}}
            removeFile={async () => {}}
          />
        )}
      </div>
    </div>
  )
}