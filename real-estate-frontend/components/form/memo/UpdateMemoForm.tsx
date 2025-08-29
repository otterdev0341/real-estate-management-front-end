"use client"

import { useState } from "react"
import { MemoService } from "@/service/memo/MemoService"
import { isLeft } from "@/implementation/Either"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { useMemoTypeContext } from "@/context/store/MemoTypeStore"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import ReqUpdateMemoDto from "@/domain/memo/ReqUpdateMemoDto"

interface UpdateMemoFormProps {
  id: string
  name: string
  detail?: string
  memoType?: string
  createdAt?: string
  updatedAt?: string
  onCancel: () => void
  onSuccess: () => void
}

const UpdateMemoForm = ({
  id,
  name,
  detail = "",
  memoType = "",
  createdAt = "",
  updatedAt = "",
  onCancel,
  onSuccess,
}: UpdateMemoFormProps) => {
  const { memoTypes } = useMemoTypeContext()
  const [formData, setFormData] = useState<ReqUpdateMemoDto>({
    id,
    name,
    detail,
    memoType
  })
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [errorLabel, setErrorLabel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const memoTypeOptions: CommonSelectItem[] = memoTypes.map(type => ({
    id: type.id,
    value: type.detail,
    label: type.detail,
  }))

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.name.trim()) errors.name = "Memo name is required"
    if (!formData.memoType?.trim()) errors.memoType = "Memo type is required"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" })
    }
    setErrorLabel("")
  }

  const handleMemoTypeSelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, memoType: item.value })
    setValidationErrors({ ...validationErrors, memoType: "" })
    setErrorLabel("")
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
      onSuccess()
    }, 300)
  }

  const handleSubmit = async () => {
    setErrorLabel("")
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      // Exclude createdAt and updatedAt from update payload
      const { id, name, detail, memoType } = formData
      const updatePayload = { id, name, detail, memoType }
      const result = await MemoService.instance.updateMemo(updatePayload)
      if (isLeft(result)) {
        setErrorLabel(result.value.message || "Failed to update memo")
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
              <p className="text-sm text-gray-600">Memo has been updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && !isSuccess && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Updating memo...</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className={`space-y-4 transition-opacity duration-200 ${isSuccess ? 'opacity-30' : 'opacity-100'}`}>
        {/* Memo ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memo ID</label>
          <input
            type="text"
            value={formData.id}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-muted-foreground text-sm sm:text-base opacity-70"
            disabled
          />
        </div>
        {/* Memo Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memo Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Memo Name"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.name ? "border-red-500" : "border-border"
            }`}
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
          )}
        </div>
        {/* Detail */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Detail</label>
          <textarea
            name="detail"
            value={formData.detail || ""}
            onChange={handleChange}
            placeholder="Detail"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
            rows={2}
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Memo Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memo Type *</label>
          <CommonSelect
            items={memoTypeOptions}
            defaultValue={formData.memoType}
            onSelect={handleMemoTypeSelect}
            placeholder="Select or search memo type"
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.memoType && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.memoType}</p>
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
          disabled={
            !formData.name.trim() ||
            !formData.memoType?.trim() ||
            isSubmitting ||
            isSuccess
          }
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

export default UpdateMemoForm