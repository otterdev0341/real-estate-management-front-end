"use client"

import { useState, useRef } from "react"
import { Paperclip } from "lucide-react"
import BaseAttachFileToTarget from "@/domain/utility/BaseAttachFileToTarget"
import { ServiceError } from "@/implementation/ServiceError"
import Either, { isLeft } from "@/implementation/Either"



interface FileUpload {
  name: string
  size: number
  type: string
  file: File
}

interface AttachFileToTargetFormProps {
  attachFile: (dto: BaseAttachFileToTarget) => Promise<Either<ServiceError, void>>
  id: string
  serviceName: string
  onCancel?: () => void
  onSuccess?: () => void
}

const AttachFileToTargetForm = ({
  attachFile,
  id,
  serviceName,
  onCancel,
  onSuccess,
}: AttachFileToTargetFormProps) => {
  const [files, setFiles] = useState<File>(null as any);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files[0])
      setError("")
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async () => {
    if (files === null) {
      setError("Please select a file to upload.")
      return
    }
    setLoading(true)
    setError("")
    // Prepare DTO
    const dto: BaseAttachFileToTarget = {
      targetId: id,
      file: files
    }
    const result = await attachFile(dto)
    setLoading(false)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to upload file.")
    } else {
      setFiles(null as any)
      if (onSuccess) onSuccess()
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{serviceName} ID</label>
        <input
          type="text"
          value={id}
          readOnly
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm opacity-70"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Files</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleAttachmentClick}
          className="flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {!files ? "Select file to upload" : files.name}
          </span>
        </button>
        {files && (
          <ul className="mt-2 text-xs text-muted-foreground">
            <li key={files.name}>{files.name} ({files.type}, {files.size} bytes)</li>
          </ul>
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !files}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  )
}

export default AttachFileToTargetForm