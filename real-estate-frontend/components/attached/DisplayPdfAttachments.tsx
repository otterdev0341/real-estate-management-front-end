import FileUpload from "@/domain/uploadFile/FileUpload"
import correctFilePathUrl from "@/utility/correctFilePath"
import { FaRegFilePdf } from "react-icons/fa6"
import { useEffect, useState } from "react"
import Modal from "@/components/modal/Modal"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { ArrowDownTrayIcon, TrashIcon } from "@heroicons/react/24/outline"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import Either, { isLeft } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"

interface DisplayPdfAttachmentsProps {
  files: FileUpload[]
  onView?: (file: FileUpload) => void
  onDownload?: (file: FileUpload) => void
  onDelete?: (file: FileUpload) => void
  removeFileFromTarget: (dto: BaseRemoveFileFromTarget) => Promise<Either<ServiceError, void>>
  targetId: string
}

const DisplayPdfAttachments = ({
  files,
  onView,
  onDownload,
  onDelete,
  removeFileFromTarget,
  targetId,
}: DisplayPdfAttachmentsProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingFile, setDeletingFile] = useState<FileUpload | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const pdfFiles = files.filter(f => f.fileType === "pdf")

  const handleDeleteClick = (file: FileUpload) => {
    setDeletingFile(file)
    setDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deletingFile) return
    setIsSubmitting(true)
    setDeleteError("")
    const result = await removeFileFromTarget({
      fileId: deletingFile.id,
      targetId: targetId,
    })
    setIsSubmitting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete file.")
    } else {
      setDeleteModalOpen(false)
      setDeletingFile(null)
      // Optionally trigger refresh in parent via prop if needed
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 mt-2">
        <span>
          <FaRegFilePdf className="w-5 h-5 text-red-300" />
        </span>
        <span className="text-red-500 font-semibold flex items-center">
          PDF Documents ({pdfFiles.length})
        </span>
      </div>
      {pdfFiles.map(file => (
        <div
          key={file.id}
          className={`flex ${isMobile ? "flex-col items-start" : "items-center"} justify-between px-4 py-2 rounded-lg border border-border bg-white mb-2`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-full">
              <a
                href={correctFilePathUrl(file.urlPath)}
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline text-sm block w-full ${
                  isMobile ? "break-words whitespace-normal" : "max-w-xs md:max-w-md lg:max-w-lg truncate"
                }`}
                style={isMobile ? {} : { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {file.fileName}
              </a>
              <div className="text-xs text-muted-foreground">{file.fileSize}</div>
              {isMobile && (
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-transparent text-gray-700 p-0 flex items-center justify-center"
                    onClick={() => onDownload?.(file)}
                    aria-label="Download"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="bg-transparent text-red-400 p-0 flex items-center justify-center"
                    onClick={() => handleDeleteClick(file)}
                    aria-label="Delete"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {!isMobile && (
            <div className="flex gap-2">
              <button
                className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
                onClick={() => onDownload?.(file)}
              >
                <span className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M12 4v12" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </span>
                Download
              </button>
              <button
                className="px-2 py-1 text-xs rounded bg-red-50 text-red-400 hover:bg-red-100 flex items-center gap-1"
                onClick={() => handleDeleteClick(file)}
              >
                <span className="text-red-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M19 7l-1-3a2 2 0 00-2-2H8a2 2 0 00-2 2L5 7" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </span>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
      {pdfFiles.length === 0 && (
        <div className="text-muted-foreground text-sm mt-4">No PDF documents found.</div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingFile(null)
        }}
        title="Delete PDF"
        maxWidth="sm"
        footer={null}
      >
        <CommonDeleteForm
          description={`Are you sure you want to delete "${deletingFile?.fileName}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModalOpen(false)
            setDeletingFile(null)
          }}
          isSubmitting={isSubmitting}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default DisplayPdfAttachments