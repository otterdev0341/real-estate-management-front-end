"use client"

import { useEffect, useState } from "react"
import { PaperClipIcon, DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import BaseFileRelatedDto from "@/domain/utility/BaseFetchFileRelatedDto"
import FileUpload from "@/domain/uploadFile/FileUpload"
import Either, { isRight } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import DisplayImageAttachments from "@/components/attached/DisplayImageAttachments"
import DisplayPdfAttachments from "@/components/attached/DisplayPdfAttachments"
import DisplayOtherAttachments from "@/components/attached/DisplayOtherAttachments"
import DisplayImageMobileAttachments from "@/components/attached/DisplayImageMobileAttachments"
import AttachFileToTargetForm from "@/components/form/attach/AttachFileToTargetForm"
import Modal from "@/components/modal/Modal"


interface CommonAttachmentsProps {
  id: string
  fetchFiles: (dto: BaseFileRelatedDto) => Promise<Either<ServiceError, FileUpload[]>>
  attachFile: (dto: BaseAttachFileToTarget) => Promise<Either<ServiceError, void>>
  removeFile: (dto: BaseRemoveFileFromTarget) => Promise<Either<ServiceError, void>>
}
// this will 4 thing as props
/**
 * 1: fetch all, it will handle fetch case by this tab
 * 2: attach file to target, to use with upload button
 * 3: delete file from target will use with delete button that parsing file id
 * 4: target id to fetch files
 */

const CommonAttachments = ({ id, fetchFiles, attachFile, removeFile }: CommonAttachmentsProps) => {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("all")
  const [searchText, setSearchText] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchFiles({ targetId: id, fileType: "all" }).then(result => {
      if (isRight(result)) {
        setFiles(result.value)
        console.log("Fetched files success:", result.value);
      } else {
        setFiles([])
      }
      setLoading(false)
    })
  }, [id, fetchFiles])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Filter by tab and search text
  const filteredFiles = files.filter(file => {
    const matchesTab =
      searchTerm === "all" ||
      (searchTerm === "image" && file.fileType === "image") ||
      (searchTerm === "pdf" && file.fileType === "pdf") ||
      (searchTerm === "other" && file.fileType === "other")
    const matchesSearch =
      (file.fileName ?? "").toLowerCase().includes(searchText.toLowerCase())
    return matchesTab && matchesSearch
  })

  const tabOptions = [
    {
      key: "all",
      label: files.length > 0 ? `All (${files.length})` : "All"
    },
    {
      key: "image",
      label: (() => {
        const count = files.filter(f => f.fileType === "image").length
        return count > 0 ? `Images (${count})` : "Images"
      })()
    },
    {
      key: "pdf",
      label: (() => {
        const count = files.filter(f => f.fileType === "pdf").length
        return count > 0 ? `PDFs (${count})` : "PDFs"
      })()
    },
    {
      key: "other",
      label: (() => {
        const count = files.filter(f => f.fileType === "other").length
        return count > 0 ? `Others (${count})` : "Others"
      })()
    }
  ]

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Responsive header: Attachments + Upload button */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="font-semibold text-lg flex items-center gap-2">
          <PaperClipIcon className="w-5 h-5 text-muted-foreground" />
          Attachments
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 font-medium flex items-center gap-2 w-full sm:w-auto"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <PaperClipIcon className="w-4 h-4" />
          Upload File
        </button>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload File"
        maxWidth="sm"
        footer={null}
      >
        <AttachFileToTargetForm
          attachFile={attachFile}
          id={id}
          serviceName="Memo"
          onCancel={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false)
            setLoading(true)
            fetchFiles({ targetId: id, fileType: "all" }).then(result => {
              if (isRight(result)) {
                setFiles(result.value)
              } else {
                setFiles([])
              }
              setLoading(false)
            })
          }}
        />
      </Modal>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by file name..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-violet-300 text-sm"
        />
      </div>
      {/* Responsive Tabs */}
      <div className="mb-6">
        {/* Mobile: Select dropdown */}
        <div className="md:hidden">
          <select
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm bg-muted"
          >
            {tabOptions.map(tab => (
              <option key={tab.key} value={tab.key}>{tab.label}</option>
            ))}
          </select>
        </div>
        {/* Desktop: Button tabs */}
        <div className="hidden md:flex gap-2">
          {tabOptions.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSearchTerm(tab.key)}
              className={`px-3 py-1 rounded-full font-medium text-sm ${
                searchTerm === tab.key
                  ? "bg-violet-100 text-violet-700"
                  : "bg-muted text-muted-foreground hover:bg-violet-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {/* Images */}
      {searchTerm === "image" && isMobile ? (
        <DisplayImageMobileAttachments
          files={filteredFiles}
          removeFileFromTarget={removeFile}
          targetId={id}
          tabSelected="mobile"
          onRefresh={() => {
            setLoading(true)
            fetchFiles({ targetId: id, fileType: "all" }).then(result => {
              if (isRight(result)) {
                setFiles(result.value)
              } else {
                setFiles([])
              }
              setLoading(false)
            })
          }}
        />
      ) : (
        ["all", "image"].includes(searchTerm) && (
          <DisplayImageAttachments
            files={filteredFiles}
            removeFileFromTarget={async (dto) => {
              const result = await removeFile(dto)
              if (result && isRight(result)) {
                setLoading(true)
                fetchFiles({ targetId: id, fileType: "all" }).then(result => {
                  if (isRight(result)) {
                    setFiles(result.value)
                  } else {
                    setFiles([])
                  }
                  setLoading(false)
                })
              }
              return result
            }}
            targetId={id}
            tabSelected={searchTerm}
            onRefresh={() => {
              setLoading(true)
              fetchFiles({ targetId: id, fileType: "all" }).then(result => {
                if (isRight(result)) {
                  setFiles(result.value)
                } else {
                  setFiles([])
                }
                setLoading(false)
              })
            }}
          />
        )
      )}
      {/* PDFs */}
      {["all", "pdf"].includes(searchTerm) && (
        <DisplayPdfAttachments
          files={filteredFiles}
          onView={file => {}}
          onDownload={file => {}}
          onDelete={file => {}}
          targetId={id}
          removeFileFromTarget={async (dto) => {
            const result = await removeFile(dto)
            if (result && isRight(result)) {
              setLoading(true)
              fetchFiles({ targetId: id, fileType: "all" }).then(result => {
                if (isRight(result)) {
                  setFiles(result.value)
                } else {
                  setFiles([])
                }
                setLoading(false)
              })
            }
            return result
          }}
        />
      )}
      {/* Others */}
      {["all", "other"].includes(searchTerm) && (
        <DisplayOtherAttachments
          targetId={id}
          files={filteredFiles}
          removeFileFromTarget={async (dto) => {
            const result = await removeFile(dto)
            if (result && isRight(result)) {
              setLoading(true)
              fetchFiles({ targetId: id, fileType: "all" }).then(result => {
                if (isRight(result)) {
                  setFiles(result.value)
                } else {
                  setFiles([])
                }
                setLoading(false)
              })
            }
            return result
          }}
        />
      )}
    </div>
  )
}

export default CommonAttachments