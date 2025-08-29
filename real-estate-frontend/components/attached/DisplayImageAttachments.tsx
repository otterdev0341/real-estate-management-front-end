"use client"
import FileUpload from "@/domain/uploadFile/FileUpload"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import BaseRemoveFileFromTarget from "@/domain/utility/BaseRemoveFileFromTarget"
import { MemoService } from "@/service/memo/MemoService"
import Either, { isRight } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"
import correctFilePathUrl from "@/utility/correctFilePath"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { PhotoIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useRef, useState } from "react"
import Modal from "@/components/modal/Modal"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"

interface DisplayImageAttachmentsProps {
  tabSelected: string
  files: FileUpload[]
  removeFileFromTarget: (dto: BaseRemoveFileFromTarget) => Promise<Either<ServiceError, void>>
  targetId: string
  onRefresh?: () => void
}

const DisplayImageAttachments = ({
  tabSelected,
  files,
  removeFileFromTarget,
  targetId,
  onRefresh,
}: DisplayImageAttachmentsProps) => {
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
  let displayFiles: FileUpload[] = imageFiles

  if (imageFiles.length >= 4) {
    displayFiles = imageFiles.slice(0, 3)
  }

  const handleDownload = (file: FileUpload) => {
    const url = correctFilePathUrl(file.urlPath)
    const link = document.createElement("a")
    link.href = url
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // DaisyUI Carousel logic
  const [current, setCurrent] = useState(0)
  const total = displayFiles.length

  const goPrev = () => setCurrent(current === 0 ? total - 1 : current - 1)
  const goNext = () => setCurrent(current === total - 1 ? 0 : current + 1)

  return (
    <div>
      <div className="font-semibold text-violet-700 mb-2 flex items-center gap-2">
        <PhotoIcon className="w-5 h-5 text-violet-400" />
        Images ({imageFiles.length})
      </div>
      {tabSelected === "image" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {imageFiles.map(file => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={correctFilePathUrl(file.urlPath)}
                  alt={file.fileName}
                  className="w-full h-64 object-cover"
                />
              </CardContent>
              <CardFooter className="flex flex-col items-start p-4">
                <div className="flex items-center gap-2 mb-1">
                  <PhotoIcon className="w-4 h-4 text-violet-400" />
                  <span className="font-medium text-sm break-words">{file.fileName}</span>
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
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="carousel w-full relative">
            {displayFiles.map((file, idx) => (
              <div
                key={file.id}
                className={`carousel-item w-full ${idx === current ? "block" : "hidden"}`}
              >
                <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-white">
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
                        onClick={handleConfirmDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* DaisyUI Carousel Controls */}
            {total > 1 && (
              <>
                <button
                  className="btn btn-circle absolute left-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={goPrev}
                  aria-label="Previous"
                >
                  &#8592;
                </button>
                <button
                  className="btn btn-circle absolute right-2 top-1/2 -translate-y-1/2 z-10"
                  onClick={goNext}
                  aria-label="Next"
                >
                  &#8594;
                </button>
              </>
            )}
          </div>
          {/* Carousel indicators */}
          {total > 1 && (
            <div className="flex justify-center mt-2 gap-2">
              {displayFiles.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === current ? "bg-violet-500" : "bg-gray-300"}`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
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

export default DisplayImageAttachments