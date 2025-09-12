"use client"

import { useState, useRef } from "react"
import { Paperclip, PlusIcon, Trash2 } from "lucide-react"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { useContactContext } from "@/context/store/ContactStore"
import ReqCreateInvestmentDto from "@/domain/investment/create/ReqCreateInvestmentDto"
import ReqCreateInvestmentItemDto from "@/domain/investment/create/ReqCreateInvestmentItemDto"
import { InvestmentService } from "@/service/investment/InvestmentService"
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

interface CreateInvestmentFormProps {
  onSubmit?: () => void
  onCancel?: () => void
}

const initialState = {
  investmentDate: new Date(),
  note: "",
  propertyId: "",
  contactId: "",
  files: [] as FileUpload[],
  items: [] as ReqCreateInvestmentItemDto[],
}

const CreateInvestmentForm = ({ onSubmit, onCancel }: CreateInvestmentFormProps) => {
  const { properties, loading: propertyLoading } = usePropertyContext()
  const { contacts, loading: contactLoading } = useContactContext()
  const [formData, setFormData] = useState(initialState)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState("")
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Investment items state
  const [itemInputs, setItemInputs] = useState([
    { contact: "", amount: "", percent: "" }
  ])

  const propertyOptions: CommonSelectItem[] = properties.map(property => ({
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
    if (!formData.note.trim()) errors.note = "Note is required"
    if (!formData.investmentDate) errors.createdAt = "Created date is required"
    if (itemInputs.length === 0) errors.items = "At least one investment item is required"
    itemInputs.forEach((item, idx) => {
      if (!item.contact.trim()) errors[`item-contact-${idx}`] = "Contact is required"
      if (
        item.amount === "" ||
        isNaN(Number(item.amount)) ||
        Number(item.amount) < 0
      ) {
        errors[`item-amount-${idx}`] = "Amount must be 0 or positive"
      }
      if (!item.percent || isNaN(Number(item.percent))) errors[`item-percent-${idx}`] = "Percent is required"
    })
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
    if (count === 0) return "Click to attach files"
    if (count === 1) return "1 file attached"
    return `${count} files attached`
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, investmentDate: date ?? new Date() })
    setDatePickerOpen(false)
  }

  // Investment items handlers
  const handleContactSelect = (idx: number, selected: CommonSelectItem) => {
    const newInputs = [...itemInputs]
    newInputs[idx].contact = selected.id
    setItemInputs(newInputs)
    setValidationErrors((prev) => ({ ...prev, [`item-contact-${idx}`]: "" }))
  }

  const handleItemChange = (
    idx: number,
    field: "contact" | "amount" | "percent",
    value: string
  ) => {
    const newInputs = [...itemInputs]
    newInputs[idx][field] = value
    setItemInputs(newInputs)
    setValidationErrors((prev) => ({ ...prev, [`item-${field}-${idx}`]: "" }))
  }

  const handleAddItem = () => {
    setItemInputs([...itemInputs, { contact: "", amount: "", percent: "" }])
  }

  const handleRemoveItem = (idx: number) => {
    setItemInputs(itemInputs.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    setSubmitError("")
    if (!validateForm()) return
    setIsSubmitting(true)
    try {
      // Prepare investment items
      const items = itemInputs.map(
        item =>
          new ReqCreateInvestmentItemDto(
            item.contact,
            Number(item.amount),
            Number(item.percent)
          )
      )
      // Prepare DTO
      const dto = new ReqCreateInvestmentDto(
        formData.investmentDate instanceof Date
          ? formData.investmentDate.toISOString()
          : formData.investmentDate,
        formData.note,
        formData.propertyId,
        items,
        formData.files.map(f => f.file!).filter((file): file is File => file instanceof File)
      )
      // Call InvestmentService
      const result = await InvestmentService.instance.createInvestment(dto)
      if (isLeft(result)) {
        setSubmitError(result.value.message || "Failed to create investment")
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

  // Calculate grand total
  const grandTotal = itemInputs.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  )

  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">Create Investment</h2>
      <p className="mb-6 text-muted-foreground">Fill in the details to create a new investment record</p>

      {/* Property */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">Property <span className="text-destructive">*</span></label>
        <CommonSelect
          items={propertyOptions}
          defaultValue={formData.propertyId}
          onSelect={handlePropertySelect}
          placeholder="Select a property"
          disabled={propertyLoading}
        />
        {validationErrors.propertyId && <p className="text-red-500 text-xs mt-1">{validationErrors.propertyId}</p>}
      </div>

      {/* Note */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">Investment Note <span className="text-destructive">*</span></label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Enter investment description or notes..."
          className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
            validationErrors.note ? "border-red-500" : "border-border"
          }`}
          rows={2}
        />
        {validationErrors.note && <p className="text-red-500 text-xs mt-1">{validationErrors.note}</p>}
      </div>

      {/* Files */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">Attachments</label>
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
        {formData.files.length > 0 && (
          <ul className="mt-2 text-xs text-muted-foreground">
            {formData.files.map((file, idx) => (
              <li key={idx}>{file.name} ({file.type}, {file.size} bytes)</li>
            ))}
          </ul>
        )}
      </div>

      {/* Date Picker */}
      <div className="mb-4">
        <Label htmlFor="createdAt" className="block text-sm font-medium text-foreground mb-2">
          Created At <span className="text-destructive">*</span>
        </Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="createdAt"
              className="w-48 justify-between font-normal"
              type="button"
            >
              {formData.investmentDate
                ? formData.investmentDate instanceof Date
                  ? format(formData.investmentDate, "yyyy-MM-dd")
                  : formData.investmentDate
                : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.investmentDate instanceof Date ? formData.investmentDate : new Date(formData.investmentDate)}
              captionLayout="dropdown"
              onSelect={date => handleDateChange(date)}
            />
          </PopoverContent>
        </Popover>
        {validationErrors.createdAt && <p className="text-red-500 text-xs mt-1">{validationErrors.createdAt}</p>}
      </div>

      {/* Investment Items */}
      <div className="mb-4">
        <label className= "text-base font-semibold text-foreground mb-2 flex items-center gap-2">
          <span className="inline-block bg-violet-300 text-violet-900 rounded px-2 py-1 text-xs font-bold">Investment Items</span>
          <span className="text-destructive">*</span>
        </label>
        <div className="bg-muted/40 rounded-lg p-4">
          <div className="hidden md:grid grid-cols-[220px_110px_110px_40px] gap-2 mb-2 text-xs font-semibold text-muted-foreground">
            <div>Contact</div>
            <div>Amount</div>
            <div>Yield Percent</div>
            <div></div>
          </div>
          {itemInputs.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-[220px_110px_110px_40px] gap-2 items-center mb-2"
            >
              <div>
                <CommonSelect
                  items={contactOptions}
                  defaultValue={item.contact}
                  onSelect={selected => handleContactSelect(idx, selected)}
                  placeholder="Select contact"
                  disabled={contactLoading}
                />
              </div>
              <input
                type="number"
                placeholder="0"
                value={item.amount}
                onChange={e => {
                  const val = e.target.value
                  // Only allow 0 or positive numbers
                  if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    handleItemChange(idx, "amount", val)
                  }
                }}
                className={`px-2 py-1 border rounded w-full text-sm text-center ${
                  validationErrors[`item-amount-${idx}`] ? "border-red-500" : "border-border"
                }`}
                min={0}
              />
              <input
                type="number"
                placeholder="0"
                value={item.percent}
                onChange={e => handleItemChange(idx, "percent", e.target.value)}
                className={`px-2 py-1 border rounded w-full text-sm text-center ${
                  validationErrors[`item-percent-${idx}`] ? "border-red-500" : "border-border"
                }`}
                min={0}
                max={100}
                step="0.01"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                title="Remove"
                disabled={itemInputs.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 bg-violet-300 text-violet-900 rounded font-semibold hover:bg-violet-400 transition-colors text-xs mt-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Another Item
          </button>
        </div>
        {validationErrors.items && <p className="text-red-500 text-xs mt-1">{validationErrors.items}</p>}
      </div>

      {/* Grand Total */}
      <div className="mt-6 flex justify-end">
        <div className="bg-violet-100 rounded px-4 py-2 flex items-center gap-4 shadow w-fit">
          <div className="flex items-center gap-2">
            <span className="bg-violet-200 text-violet-700 rounded-full px-2 py-1 text-base font-bold">$</span>
            <span className="text-violet-900 text-base font-bold">Grand Total</span>
          </div>
          <div className="text-violet-900 text-lg font-bold">
            ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-normal ml-2">{itemInputs.length} item{itemInputs.length > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="text-xs text-red-500 mb-2 mt-4">{submitError}</div>
      )}

      {/* Form Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-6">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1 text-muted-foreground hover:text-foreground transition-colors order-2 sm:order-1 text-sm"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={
            !formData.propertyId.trim() ||
            !formData.note.trim() ||
            !formData.investmentDate ||
            itemInputs.length === 0 ||
            isSubmitting
          }
          className="px-4 py-2 bg-violet-200 text-violet-900 rounded-lg hover:bg-violet-300 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create investment (${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </span>
        </button>
      </div>
    </>
  )
}

export default CreateInvestmentForm