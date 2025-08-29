import { PaperClipIcon, ArrowDownTrayIcon, TrashIcon } from "@heroicons/react/24/outline"
import FileUpload from "@/domain/uploadFile/FileUpload"
import { useEffect, useState } from "react"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import Either, { isLeft } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"
import Modal from "@/components/modal/Modal"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"

interface DisplayOtherAttachmentsProps {
  files: FileUpload[]
  targetId: string
  removeFileFromTarget: (dto: BaseRemoveFileFromTarget) => Promise<Either<ServiceError, void>>
}

const DisplayOtherAttachments = ({
  files,
  removeFileFromTarget,
  targetId,
}: DisplayOtherAttachmentsProps) => {
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

  const otherFiles = files.filter(f => f.fileType === "other")

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
      <div className="font-semibold text-base mb-2 flex items-center gap-2">
        <PaperClipIcon className="w-5 h-5 text-gray-500" />
        Other Files ({otherFiles.length})
      </div>
      {otherFiles.map(file => (
        <div key={file.id} className={`bg-white rounded-lg border border-border p-3 flex ${isMobile ? "flex-col items-start" : "items-center"} justify-between mb-2`}>
          <div className="w-full">
            <div className={`font-medium text-sm ${isMobile ? "break-words whitespace-normal" : ""}`}>
              {file.fileName}
            </div>
            <div className="text-xs text-muted-foreground">{file.fileSize}</div>
            {isMobile && (
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-transparent text-gray-700 p-0 flex items-center justify-center"
                  aria-label="Download"
                  onClick={() => {
                    const url = file.urlPath
                    const link = document.createElement("a")
                    link.href = url
                    link.download = file.fileName
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
                <button
                  className="bg-transparent text-red-400 p-0 flex items-center justify-center"
                  aria-label="Delete"
                  onClick={() => handleDeleteClick(file)}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          {!isMobile && (
            <div className="flex gap-2">
              <button
                className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs hover:bg-muted/70 flex items-center gap-1"
                onClick={() => {
                  const url = file.urlPath
                  const link = document.createElement("a")
                  link.href = url
                  link.download = file.fileName
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                Download
              </button>
              <button
                className="px-2 py-1 rounded bg-red-50 text-red-600 text-xs hover:bg-red-100 flex items-center gap-1"
                onClick={() => handleDeleteClick(file)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
      {otherFiles.length === 0 && (
        <div className="text-muted-foreground text-sm mt-4">No other files found.</div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingFile(null)
        }}
        title="Delete File"
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

export default DisplayOtherAttachments