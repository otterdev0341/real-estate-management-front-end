"use client"
import FileUpload from "@/domain/uploadFile/FileUpload"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import Either, { isRight } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"
import correctFilePathUrl from "@/utility/correctFilePath"
import { PhotoIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import Modal from "@/components/modal/Modal"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"

interface DisplayImageMobileAttachmentsProps {
  files: FileUpload[]
  removeFileFromTarget: (dto: BaseRemoveFileFromTarget) => Promise<Either<ServiceError, void>>
  targetId: string
  tabSelected: string
  onRefresh?: () => void
}

const DisplayImageMobileAttachments = ({
  files,
  removeFileFromTarget,
  targetId,
  onRefresh,
  tabSelected,
}: DisplayImageMobileAttachmentsProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingFile, setDeletingFile] = useState<FileUpload | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const handleDeleteClick = (file: FileUpload) => {
    setDeletingFile(file)
    setDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deletingFile) return
    setIsSubmitting(true)
    setDeleteError("")
    const result = await removeFileFromTarget({ targetId, fileId: deletingFile.id })
    setIsSubmitting(false)
    if (isRight(result)) {
      setDeleteModalOpen(false)
      setDeletingFile(null)
      if (onRefresh) onRefresh()
    } else {
      setDeleteError(result.value.message || "Failed to delete image.")
    }
  }

  const imageFiles: FileUpload[] = files.filter(file => file.fileType === "image")

  const handleDownload = (file: FileUpload) => {
    const url = correctFilePathUrl(file.urlPath)
    const link = document.createElement("a")
    link.href = url
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <div className="font-semibold text-violet-700 mb-2 flex items-center gap-2">
        <PhotoIcon className="w-5 h-5 text-violet-400" />
        Images ({imageFiles.length})
      </div>
      <div className="flex flex-col gap-4">
        {imageFiles.map(file => (
          <div key={file.id} className="rounded-xl border border-border shadow-sm overflow-hidden bg-white">
            <img
              src={correctFilePathUrl(file.urlPath)}
              alt={file.fileName}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <PhotoIcon className="w-4 h-4 text-violet-400" />
                <span className="font-medium text-sm">{file.fileName}</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{file.fileSize}</div>
              <div className="flex gap-2">
                <a
                  href={correctFilePathUrl(file.urlPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                >
                  View
                </a>
                <button
                  onClick={() => handleDownload(file)}
                  className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Download
                </button>
                <button
                  className="px-2 py-1 text-xs rounded bg-red-50 text-red-400 hover:bg-red-100"
                  onClick={() => handleDeleteClick(file)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {imageFiles.length === 0 && (
        <div className="text-muted-foreground text-sm mt-4">No images found.</div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingFile(null)
        }}
        title="Delete Image"
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

export default DisplayImageMobileAttachments