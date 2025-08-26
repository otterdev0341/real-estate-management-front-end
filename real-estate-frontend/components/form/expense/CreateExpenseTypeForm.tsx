"use client"

import { useState } from "react"

interface CreateExpenseTypeFormProps {
  onSubmit: (expenseTypeData: { detail: string }) => void
  onCancel: () => void
}

const CreateExpenseTypeForm = ({ onSubmit, onCancel }: CreateExpenseTypeFormProps) => {
  const [formData, setFormData] = useState({ detail: "" })
  const [validationErrors, setValidationErrors] = useState({ detail: "" })

  const validateForm = () => {
    const errors = { detail: "" }
    if (!formData.detail.trim()) {
      errors.detail = "Expense type detail is required"
    } else if (formData.detail.trim().length < 2) {
      errors.detail = "Expense type detail must be at least 2 characters"
    }
    setValidationErrors(errors)
    return !errors.detail
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    onSubmit(formData)
  }

  return (
    <>
      {/* Form Content */}
      <div className="space-y-4">
        {/* Expense Type Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Expense Type Name *</label>
          <input
            type="text"
            value={formData.detail}
            onChange={(e) => {
              setFormData({ ...formData, detail: e.target.value })
              if (validationErrors.detail) {
                setValidationErrors({ ...validationErrors, detail: "" })
              }
            }}
            placeholder="e.g., Utilities"
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
          Create Expense Type
        </button>
      </div>
    </>
  )
}

export default CreateExpenseTypeForm