"use client"

import { useState } from "react"

interface ContactData {
  businessName: string
  internalName: string
  detail: string
  note: string
  contactType: string
  address: string
  phone: string
  mobilePhone: string
  line: string
  email: string
}

interface CreateContactFormProps {
  onSubmit?: (contactData: ContactData) => void
  onCancel?: () => void
}

const initialState = {
  businessName: "",
  internalName: "",
  detail: "",
  note: "",
  contactType: "",
  address: "",
  phone: "",
  mobilePhone: "",
  line: "",
  email: "",
}

const CreateContactForm = ({ onSubmit, onCancel }: CreateContactFormProps) => {
  const [formData, setFormData] = useState(initialState)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.businessName.trim()) errors.businessName = "Business name is required"
    if (!formData.contactType.trim()) errors.contactType = "Contact type is required"
    if (!formData.email.trim()) errors.email = "Email is required"
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

  const handleSubmit = () => {
    if (!validateForm()) return
    if (onSubmit) onSubmit(formData)
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Acme Inc."
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.businessName ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.businessName && <p className="text-red-500 text-xs mt-1">{validationErrors.businessName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Internal Name</label>
          <input
            type="text"
            name="internalName"
            value={formData.internalName}
            onChange={handleChange}
            placeholder="ACME"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Detail</label>
          <textarea
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            placeholder="Long-term client for software services."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Note</label>
          <input
            type="text"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Initial contact made via LinkedIn."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contact Type *</label>
          <input
            type="text"
            name="contactType"
            value={formData.contactType}
            onChange={handleChange}
            placeholder="Contact type UUID"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.contactType ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.contactType && <p className="text-red-500 text-xs mt-1">{validationErrors.contactType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main Street, Anytown, USA 12345"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="555-123-4567"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Mobile Phone</label>
          <input
            type="text"
            name="mobilePhone"
            value={formData.mobilePhone}
            onChange={handleChange}
            placeholder="555-987-6543"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Line</label>
          <input
            type="text"
            name="line"
            value={formData.line}
            onChange={handleChange}
            placeholder="acme_line_id"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@acme.com"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.email ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
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
            !formData.businessName.trim() ||
            !formData.contactType.trim() ||
            !formData.email.trim()
          }
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          Create Contact
        </button>
      </div>
    </>
  )
}

export default CreateContactForm