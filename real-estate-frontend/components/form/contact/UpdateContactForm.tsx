"use client"

import { useEffect, useState } from "react"
import { ContactService } from "@/service/contact/ContactService"
import { isLeft } from "@/implementation/Either"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { useContactTypeContext } from "@/context/store/ContactTypeStore"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { ReqUpdateContactDto } from "@/domain/contact/contact/ReqUpdateContactDto"

interface UpdateContactFormProps {
  id: string
  businessName: string
  internalName?: string
  detail?: string
  note?: string
  contactType: string
  address?: string
  phone?: string
  mobilePhone?: string
  line?: string
  email?: string
  onCancel: () => void
  onSuccess: () => void
}

const UpdateContactForm = ({
  id,
  businessName,
  internalName = "",
  detail = "",
  note = "",
  contactType,
  address = "",
  phone = "",
  mobilePhone = "",
  line = "",
  email = "",
  onCancel,
  onSuccess,
}: UpdateContactFormProps) => {
  const { contactTypes } = useContactTypeContext()
  // Find the contact type id from detail string (if contactType is not an id)
  const getContactTypeId = (contactTypeDetail: string) => {
    const found = contactTypes.find(type => type.detail === contactTypeDetail)
    return found ? found.id : contactTypeDetail // fallback to original if not found
  }

  // Initialize formData with correct contactType id
  const [formData, setFormData] = useState<ReqUpdateContactDto>({
    id,
    businessName,
    internalName,
    detail,
    note,
    contactType: getContactTypeId(contactType),
    address,
    phone,
    mobilePhone,
    line,
    email,
  })

  // When contactTypes or contactType prop changes, update formData.contactType to correct id
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      contactType: getContactTypeId(contactType),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactTypes, contactType])

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [errorLabel, setErrorLabel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const contactTypeOptions: CommonSelectItem[] = contactTypes.map(type => ({
    id: type.id,
    value: type.detail,
    label: type.detail,
  }))

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.businessName.trim()) errors.businessName = "Business name is required"
    if (!formData.contactType.trim()) errors.contactType = "Contact type is required"
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

  const handleContactTypeSelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, contactType: item.id })
    setValidationErrors({ ...validationErrors, contactType: "" })
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
      const result = await ContactService.instance.updateContact(formData)
      if (isLeft(result)) {
        setErrorLabel(result.value.message || "Failed to update contact")
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
              <p className="text-sm text-gray-600">Contact has been updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && !isSuccess && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Updating contact...</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className={`space-y-4 transition-opacity duration-200 ${isSuccess ? 'opacity-30' : 'opacity-100'}`}>
        {/* Contact ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contact ID</label>
          <input
            type="text"
            value={formData.id}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-muted-foreground text-sm sm:text-base opacity-70"
            disabled
          />
        </div>
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Business Name"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.businessName ? "border-red-500" : "border-border"
            }`}
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.businessName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.businessName}</p>
          )}
        </div>
        {/* Internal Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Internal Name</label>
          <input
            type="text"
            name="internalName"
            value={formData.internalName || ""}
            onChange={handleChange}
            placeholder="Internal Name"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
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
        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Note</label>
          <input
            type="text"
            name="note"
            value={formData.note || ""}
            onChange={handleChange}
            placeholder="Note"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Contact Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contact Type *</label>
          <CommonSelect
            items={contactTypeOptions}
            defaultValue={formData.contactType}
            onSelect={handleContactTypeSelect}
            placeholder="Select or search contact type"
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.contactType && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.contactType}</p>
          )}
        </div>
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            placeholder="Address"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Mobile Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Mobile Phone</label>
          <input
            type="text"
            name="mobilePhone"
            value={formData.mobilePhone || ""}
            onChange={handleChange}
            placeholder="Mobile Phone"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Line */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Line</label>
          <input
            type="text"
            name="line"
            value={formData.line || ""}
            onChange={handleChange}
            placeholder="Line"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
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
            !formData.businessName.trim() ||
            !formData.contactType.trim() ||
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

export default UpdateContactForm