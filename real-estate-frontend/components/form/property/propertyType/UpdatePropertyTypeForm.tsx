"use client"

import { useState } from "react"
import { PropertyTypeService } from "@/service/property/PropertyTypeService"
import { isLeft } from "@/implementation/Either"
import ReqUpdatePropertyTypeDto from "@/domain/property/propertyType/ReqUpdatePropertyTypeDto"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"

interface UpdatePropertyTypeFormProps {
  id: string
  detail: string
  onSuccess: (updated?: { id: string; detail: string }) => void
  onCancel: () => void
}

const UpdatePropertyTypeForm = ({ id, detail, onSuccess, onCancel }: UpdatePropertyTypeFormProps) => {
  const [formData, setFormData] = useState({ id, detail })
  const [validationErrors, setValidationErrors] = useState({ detail: "" })
  const [errorLabel, setErrorLabel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const validateForm = () => {
    const errors = { detail: "" }
    if (!formData.detail.trim()) {
      errors.detail = "Property type detail is required"
    } else if (formData.detail.trim().length < 2) {
      errors.detail = "Property type detail must be at least 2 characters"
    }
    setValidationErrors(errors)
    return !errors.detail
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onCancel()
    }, 300)
  }

  const handleSuccessClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onSuccess(formData)
    }, 300)
  }

  const handleSubmit = async () => {
    setErrorLabel("")
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const result = await PropertyTypeService.instance.updatePropertyType({
        id: formData.id,
        detail: formData.detail,
      } as ReqUpdatePropertyTypeDto)

      if (isLeft(result)) {
        setErrorLabel(result.value.message || "Failed to update property type")
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        handleSuccessClose()
      }, 1500)
    } catch (error) {
      setErrorLabel("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`relative transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Success Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 animate-in zoom-in duration-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Success!</h3>
              <p className="text-sm text-gray-600">Property type has been updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && !isSuccess && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Updating property type...</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className={`space-y-4 transition-opacity duration-200 ${isSuccess ? 'opacity-30' : 'opacity-100'}`}>
        {/* Property Type ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Property Type ID</label>
          <input
            type="text"
            value={formData.id}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-muted-foreground text-sm sm:text-base opacity-70"
            disabled
          />
        </div>
        {/* Property Type Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Property Type Name *</label>
          <input
            type="text"
            value={formData.detail}
            onChange={(e) => {
              setFormData({ ...formData, detail: e.target.value })
              if (validationErrors.detail) {
                setValidationErrors({ ...validationErrors, detail: "" })
              }
              setErrorLabel("")
            }}
            placeholder="e.g., Condominium"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base transition-colors ${
              validationErrors.detail ? "border-red-500" : "border-border"
            } ${isSubmitting || isSuccess ? "opacity-50" : ""}`}
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.detail && (
            <p className="flex items-center text-red-500 text-xs mt-1">
              <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
              {validationErrors.detail}
            </p>
          )}
        </div>
        {errorLabel && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
              {errorLabel}
            </p>
          </div>
        )}
      </div>

      {/* Form Footer */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 transition-opacity duration-200 ${isSuccess ? 'opacity-30' : 'opacity-100'}`}>
        <button
          onClick={handleClose}
          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1 disabled:opacity-50"
          disabled={isSubmitting || isSuccess}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.detail.trim() || isSubmitting || isSuccess}
          className="px-4 py-2 bg-yellow-200 text-yellow-900 rounded-lg hover:bg-yellow-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 flex items-center justify-center min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </button>
      </div>
    </div>
  )
}

export default UpdatePropertyTypeForm