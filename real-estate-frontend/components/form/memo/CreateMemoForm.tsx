"use client"

import { useState } from "react"


interface CreateMemoFormProps {
  onSubmit?: (memoData: any) => void
  onCancel?: () => void
}

const initialState = {
  name: "",
  detail: "",
  memoType: "",
  files: [] as FileUpload[],
}

const CreateMemoForm = ({ onSubmit, onCancel }: CreateMemoFormProps) => {
  const [formData, setFormData] = useState(initialState)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.name.trim()) errors.name = "Memo name is required"
    if (!formData.memoType.trim()) errors.memoType = "Memo type is required"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr: FileUpload[] = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }))
      setFormData({ ...formData, files: filesArr })
    }
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    if (onSubmit) onSubmit(formData)
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memo Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Project Proposal Memo"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.name ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Detail</label>
          <textarea
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            placeholder="This memo outlines the scope and requirements for the Q4 marketing campaign."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memo Type *</label>
          <input
            type="text"
            name="memoType"
            value={formData.memoType}
            onChange={handleChange}
            placeholder="Memo type UUID"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.memoType ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.memoType && <p className="text-red-500 text-xs mt-1">{validationErrors.memoType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Files</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
          {formData.files.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground">
              {formData.files.map((file, idx) => (
                <li key={idx}>{file.name} ({file.type}, {file.size} bytes)</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Form Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={
            !formData.name.trim() ||
            !formData.memoType.trim()
          }
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          Create Memo
        </button>
      </div>
    </>
  )
}

export default CreateMemoForm