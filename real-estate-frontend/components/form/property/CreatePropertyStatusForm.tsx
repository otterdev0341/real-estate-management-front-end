"use client"

import { useState } from "react"

interface CreatePropertyStatusFormProps {
  onSubmit: (statusData: {
    detail: string
  }) => void
  onCancel: () => void
}

const statusColors = {
  green: "bg-green-100 text-green-800 border-green-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  gray: "bg-gray-100 text-gray-800 border-gray-200",
  red: "bg-red-100 text-red-800 border-red-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
}

export default function CreatePropertyStatusForm({ onSubmit, onCancel }: CreatePropertyStatusFormProps) {
  const [formData, setFormData] = useState({
    detail: ""
    
  })
  const [validationErrors, setValidationErrors] = useState({
    detail: "",
  })

  const validateForm = () => {
    const errors = {
      detail: "",
    }

    if (!formData.detail.trim()) {
      errors.detail = "Status detail is required"
    } else if (formData.detail.trim().length < 2) {
      errors.detail = "Status detail must be at least 2 characters"
    }

  

    setValidationErrors(errors)
    return !errors.detail;
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      return
    }
    onSubmit(formData)
  }

  return (
    <>
      {/* Form Content */}
      <div className="space-y-4">
        {/* Status Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Status Name *</label>
          <input
            type="text"
            value={formData.detail}
            onChange={(e) => {
              setFormData({ ...formData, detail: e.target.value })
              if (validationErrors.detail) {
                setValidationErrors({ ...validationErrors, detail: "" })
              }
            }}
            placeholder="e.g., Pending Review"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.detail ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.detail && <p className="text-red-500 text-xs mt-1">{validationErrors.detail}</p>}
        </div>

        

    

    
      </div>

      {/* Form Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.detail.trim()}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          Create Status
        </button>
      </div>
    </>
  )
}
