"use client"

import { useState, useRef } from "react"
import { Paperclip } from "lucide-react"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { useContactContext } from "@/context/store/ContactStore"
import ReqCreateSaleDto from "@/domain/sale/ReqCreateSaleDto"
import { SaleService } from "@/service/sale/SaleService"
import { isLeft } from "@/implementation/Either"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface FileUpload {
  name: string
  size: number
  type: string
  file?: Blob
}

interface CreateSaleFormProps {
  onSubmit?: () => void
  onCancel?: () => void
}

const initialState = {
  saleDate: new Date(),
  note: "",
  propertyId: "",
  contactId: "",
  price: "",
  files: [] as FileUpload[],
}

const CreateSaleForm = ({ onSubmit, onCancel }: CreateSaleFormProps) => {
  const { properties, loading: propertyLoading, refreshProperties } = usePropertyContext()
  const { contacts, loading: contactLoading } = useContactContext()
  const [formData, setFormData] = useState(initialState)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState("")
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const propertyOptions: CommonSelectItem[] = properties
  .filter(property => property.sold !== true)
  .map(property => ({
    id: property.id,
    value: property.name,
    label: property.name,
  }))

  const contactOptions: CommonSelectItem[] = contacts.map(contact => ({
    id: contact.id,
    value: contact.businessName,
    label: contact.businessName,
  }))

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.propertyId.trim()) errors.propertyId = "Property is required"
    if (!formData.contactId.trim()) errors.contactId = "Contact is required"
    if (!formData.price || isNaN(Number(formData.price))) errors.price = "Price is required"
    if (!formData.note.trim()) errors.note = "Note is required"
    if (!formData.saleDate) errors.createdAt = "Created date is required"
    // files are NOT required
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

  const handlePropertySelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, propertyId: item.id })
    setValidationErrors({ ...validationErrors, propertyId: "" })
  }

  const handleContactSelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, contactId: item.id })
    setValidationErrors({ ...validationErrors, contactId: "" })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr: FileUpload[] = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }))
      setFormData({ ...formData, files: filesArr })
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const getAttachmentText = () => {
    const count = formData.files.length
    if (count === 0) return "attachment"
    if (count === 1) return "1 attachment"
    return `${count} attachments`
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, saleDate: date ?? new Date() })
    setDatePickerOpen(false)
    
  }

  const handleSubmit = async () => {
    setSubmitError("")
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      const dto = new ReqCreateSaleDto(
        formData.saleDate,
        formData.note,
        formData.propertyId,
        formData.contactId,
        Number(formData.price),
        formData.files.map(f => f.file!).filter(Boolean)
      )
      const result = await SaleService.instance.createSale(dto)
      if (isLeft(result)) {
        setSubmitError(result.value.message || "Failed to create sale")
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
      if (onSubmit) onSubmit()
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div
        className="space-y-4 max-h-[70vh] overflow-y-auto"
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
            onSelect={handlePropertySelect}
            placeholder="Select property"
            disabled={propertyLoading}
          />
          {validationErrors.propertyId && <p className="text-red-500 text-xs mt-1">{validationErrors.propertyId}</p>}
        </div>
        {/* Contact Select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contact *</label>
          <CommonSelect
            items={contactOptions}
            defaultValue={formData.contactId}
            onSelect={handleContactSelect}
            placeholder="Select contact"
            disabled={contactLoading}
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
          />
          {validationErrors.note && <p className="text-red-500 text-xs mt-1">{validationErrors.note}</p>}
        </div>
        {/* Files */}
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
            <span className="text-sm text-muted-foreground">{getAttachmentText()}</span>
          </button>
          {/* No validation error for files */}
          {formData.files.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground">
              {formData.files.map((file, idx) => (
                <li key={idx}>{file.name} ({file.type}, {file.size} bytes)</li>
              ))}
            </ul>
          )}
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
              >
                {formData.saleDate
                  ? formData.saleDate.toLocaleDateString()
                  : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.saleDate}
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
            !formData.propertyId.trim() ||
            !formData.contactId.trim() ||
            !formData.price ||
            !formData.note.trim() ||
            !formData.saleDate ||
            isSubmitting
          }
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          {isSubmitting ? "Creating..." : "Create Sale"}
        </button>
      </div>
    </>
  )
}

export default CreateSaleForm

/**
 * base on CreatePropertyForm complete CreateSaleForm
 * - use ReqCreateSaleDto 
 * propertyId use id from PropertyStore
 * contact value use id of contact from ContactStore
 * 
 * important: ReqCreateSaleDto is class not interface
 */