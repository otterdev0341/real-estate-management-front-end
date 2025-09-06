"use client"

import { useState, useEffect, useRef } from "react"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { useContactContext } from "@/context/store/ContactStore"
import ReqUpdateSaleDto from "@/domain/sale/ReqUpdateSaleDto"
import { SaleService } from "@/service/sale/SaleService"
import { isLeft } from "@/implementation/Either"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Loader2, CheckCircle, AlertCircle, Paperclip } from "lucide-react"


interface UpdateSaleFormProps {
  saleId: string
  propertyId: string
  contactId: string
  price: number
  note: string
  createdAt?: string
  onCancel: () => void
  onSuccess: () => void
}

const UpdateSaleForm = ({
  saleId,
  propertyId,
  contactId,
  price,
  note,
  createdAt,
  onCancel,
  onSuccess,
}: UpdateSaleFormProps) => {
  const { properties } = usePropertyContext()
  const { contacts } = useContactContext()

  const [formData, setFormData] = useState({
    propertyId: propertyId || "",
    contactId: contactId || "",
    price: price || 0,
    note: note || "",
    createdAt: createdAt ? new Date(createdAt) : undefined,
  })
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [submitError, setSubmitError] = useState("")


  // Property options (show all, or filter as needed)
  const propertyOptions: CommonSelectItem[] = properties.map(property => ({
    id: property.id,
    value: property.name,
    label: property.name,
  }))

  // Contact options
  const contactOptions: CommonSelectItem[] = contacts.map(contact => ({
    id: contact.id,
    value: contact.businessName,
    label: contact.businessName,
  }))

  // Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.propertyId.trim()) errors.propertyId = "Property is required"
    if (!formData.contactId.trim()) errors.contactId = "Contact is required"
    if (!formData.price || isNaN(Number(formData.price))) errors.price = "Price is required"
    if (!formData.note.trim()) errors.note = "Note is required"
    if (!formData.createdAt) errors.createdAt = "Created date is required"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" })
    }
    setSubmitError("")
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, createdAt: date })
    setDatePickerOpen(false)
    setValidationErrors({ ...validationErrors, createdAt: "" })
    setSubmitError("")
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
    setSubmitError("")
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const prePersistSaleDto = ReqUpdateSaleDto.createEmpty();
      prePersistSaleDto.setSaleId(saleId);
      prePersistSaleDto.setPropertyId(formData.propertyId);
      prePersistSaleDto.setContactId(formData.contactId);
      prePersistSaleDto.setPrice(Number(formData.price));
      prePersistSaleDto.setNote(formData.note);
      prePersistSaleDto.setCreatedAt(formData.createdAt!);
      // console.log("Prepared ReqUpdateSaleDto:", prePersistSaleDto);
      const result = await SaleService.instance.updateSale(prePersistSaleDto);
      if (isLeft(result)) {
        setSubmitError(result.value.message || "Failed to update sale")
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
      setIsSuccess(true)
      setTimeout(() => {
        handleSuccessClose()
      }, 1500)
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.")
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
              <p className="text-sm text-gray-600">Sale has been updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && !isSuccess && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Updating sale...</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div
        className={`space-y-4 max-h-[70vh] overflow-y-auto transition-opacity duration-200 ${isSuccess ? 'opacity-30' : 'opacity-100'}`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Property Select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Property *</label>
          <CommonSelect
            items={propertyOptions}
            defaultValue={formData.propertyId}
            onSelect={(item) => {
              setFormData({ ...formData, propertyId: item.id});
            }}
            placeholder="Select property"
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.propertyId && <p className="text-red-500 text-xs mt-1">{validationErrors.propertyId}</p>}
        </div>
        {/* Contact Select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contact *</label>
          <CommonSelect
            items={contactOptions}
            defaultValue={formData.contactId}
            onSelect={(item) => {
              setFormData({ ...formData, contactId: item.id});
            }}
            placeholder="Select contact"
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.contactId && <p className="text-red-500 text-xs mt-1">{validationErrors.contactId}</p>}
        </div>
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 500000"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.price ? "border-red-500" : "border-border"
            }`}
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.price && <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>}
        </div>
        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Note *</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Sale note or description"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.note ? "border-red-500" : "border-border"
            }`}
            rows={2}
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.note && <p className="text-red-500 text-xs mt-1">{validationErrors.note}</p>}
        </div>
        {/* Date Picker */}
        <div>
          <Label htmlFor="createdAt" className="block text-sm font-medium text-foreground mb-2">
            Created At *
          </Label>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="createdAt"
                className="w-48 justify-between font-normal"
                type="button"
                disabled={isSubmitting || isSuccess}
              >
                {formData.createdAt
                  ? formData.createdAt.toLocaleDateString()
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.createdAt}
                captionLayout="dropdown"
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover>
          {validationErrors.createdAt && <p className="text-red-500 text-xs mt-1">{validationErrors.createdAt}</p>}
        </div>
        {submitError && (
          <div className="text-xs text-red-500 mb-2">{submitError}</div>
        )}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Form Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6 transition-opacity duration-200">
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
            !formData.propertyId.trim() ||
            !formData.contactId.trim() ||
            !formData.price ||
            !formData.note.trim() ||
            !formData.createdAt ||
            isSubmitting ||
            isSuccess
          }
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Sale"
          )}
        </button>
      </div>
    </div>
  )
}

export default UpdateSaleForm