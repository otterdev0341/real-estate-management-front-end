"use client"

import { useState, useEffect, useRef } from "react"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { useContactContext } from "@/context/store/ContactStore"
import { useExpenseContext } from "@/context/store/ExpenseStore"
import ReqUpdatePaymentDto from "@/domain/payment/update/ReqUpdatePaymentDto"
import ReqUpdatePaymentItemDto from "@/domain/payment/update/ReqUpdatePaymentItemDto"
import { PaymentService } from "@/service/payment/paymentService"
import { isLeft } from "@/implementation/Either"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon, PlusIcon, Trash2, Loader2, CheckCircle, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import ResEntryPaymentDto from "@/domain/payment/response/ResEntryPaymentDto"

interface UpdatePaymentFormProps {
  payment: ResEntryPaymentDto
  onCancel: () => void
  onSuccess: () => void
}

const UpdatePaymentForm = ({
  payment,
  onCancel,
  onSuccess,
}: UpdatePaymentFormProps) => {
  const { properties } = usePropertyContext()
  const { contacts } = useContactContext()
  const { expenses } = useExpenseContext()

  const [formData, setFormData] = useState({
    propertyId: payment.property || "",
    contactId: payment.contact || "",
    note: payment.note || "",
    createdAt: payment.created ? new Date(payment.created) : undefined,
    files: [] as File[],
  })
  const [itemInputs, setItemInputs] = useState(
    payment.items?.map(item => ({
      id: item.id,
      expense: item.expense,
      amount: item.amount.toString(),
      price: item.price.toString(),
    })) || [{ expense: "", amount: "", price: "" }]
  )
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Property options
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

  // Expense options
  const expenseOptions: CommonSelectItem[] = expenses.map(expense => ({
    id: expense.id,
    value: expense.expense,
    label: expense.expense,
  }))

  // Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.propertyId.trim()) errors.propertyId = "Property is required"
    if (!formData.contactId.trim()) errors.contactId = "Contact is required"
    if (!formData.note.trim()) errors.note = "Note is required"
    if (!formData.createdAt) errors.createdAt = "Created date is required"
    if (itemInputs.length === 0) errors.items = "At least one payment item is required"
    itemInputs.forEach((item, idx) => {
      if (!item.expense.trim()) errors[`item-expense-${idx}`] = "Expense is required"
      if (!item.amount || isNaN(Number(item.amount))) errors[`item-amount-${idx}`] = "Amount is required"
      if (!item.price || isNaN(Number(item.price))) errors[`item-price-${idx}`] = "Price is required"
    })
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

  const handlePropertySelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, propertyId: item.id })
    setValidationErrors({ ...validationErrors, propertyId: "" })
  }

  const handleContactSelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, contactId: item.id })
    setValidationErrors({ ...validationErrors, contactId: "" })
  }

  // Payment items handlers
  const handleExpenseSelect = (idx: number, selected: CommonSelectItem) => {
    const newInputs = [...itemInputs]
    newInputs[idx].expense = selected.id
    setItemInputs(newInputs)
    setValidationErrors((prev) => ({ ...prev, [`item-expense-${idx}`]: "" }))
  }

  const handleItemChange = (
    idx: number,
    field: "expense" | "amount" | "price",
    value: string
  ) => {
    const newInputs = [...itemInputs]
    newInputs[idx][field] = value
    setItemInputs(newInputs)
    setValidationErrors((prev) => ({ ...prev, [`item-${field}-${idx}`]: "" }))
  }

  const handleAddItem = () => {
    setItemInputs([...itemInputs, { id: "", expense: "", amount: "", price: "" }])
  }

  const handleRemoveItem = (idx: number) => {
    setItemInputs(itemInputs.filter((_, i) => i !== idx))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) })
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
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
      const items = itemInputs.map(
        item =>
          new ReqUpdatePaymentItemDto(
            item.id || null,
            item.expense,
            Number(item.amount),
            Number(item.price)
          )
      )
      const dto = new ReqUpdatePaymentDto(
        payment.id,
        formData.createdAt ? formData.createdAt.toISOString() : "",
        formData.note,
        formData.contactId,
        formData.propertyId,
        items,
        formData.files
      )
      const result = await PaymentService.instance.updatePayment(dto)
      if (isLeft(result)) {
        setSubmitError(result.value.message || "Failed to update payment")
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

  // Calculate grand total
  const grandTotal = itemInputs.reduce(
    (sum, item) => sum + ((Number(item.amount) || 0) * (Number(item.price) || 0)),
    0
  )

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
              <p className="text-sm text-gray-600">Payment has been updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && !isSuccess && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Updating payment...</span>
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
            onSelect={handlePropertySelect}
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
            onSelect={handleContactSelect}
            placeholder="Select contact"
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.contactId && <p className="text-red-500 text-xs mt-1">{validationErrors.contactId}</p>}
        </div>
        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Note *</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Payment note or description"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.note ? "border-red-500" : "border-border"
            }`}
            rows={2}
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.note && <p className="text-red-500 text-xs mt-1">{validationErrors.note}</p>}
        </div>
        {/* Files */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Attachments</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isSubmitting || isSuccess}
          />
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isSubmitting || isSuccess}
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formData.files.length === 0
                ? "Click to attach files"
                : `${formData.files.length} file${formData.files.length > 1 ? "s" : ""} attached`}
            </span>
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
                  ? format(formData.createdAt, "yyyy-MM-dd")
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
        {/* Payment Items */}
        <div>
          <label className="block text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="inline-block bg-violet-300 text-violet-900 rounded px-2 py-1 text-xs font-bold">Payment Items</span>
            <span className="text-destructive">*</span>
          </label>
          <div className="bg-muted/40 rounded-lg p-4">
            <div className="hidden md:grid grid-cols-[220px_110px_110px_110px_40px] gap-2 mb-2 text-xs font-semibold text-muted-foreground">
              <div>Expense Category</div>
              <div>Quantity</div>
              <div>Unit Price</div>
              <div>Total</div>
              <div></div>
            </div>
            {itemInputs.map((item, idx) => {
              const amountNum = Number(item.amount) || 0
              const priceNum = Number(item.price) || 0
              const total = amountNum * priceNum

              return (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-[220px_110px_110px_110px_40px] gap-2 items-center mb-2"
                >
                  <div>
                    <CommonSelect
                      items={expenseOptions}
                      defaultValue={item.expense}
                      onSelect={selected => handleExpenseSelect(idx, selected)}
                      placeholder="Select expense type"
                      disabled={isSubmitting || isSuccess}
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={item.amount}
                    onChange={e => handleItemChange(idx, "amount", e.target.value)}
                    className={`px-2 py-1 border rounded w-full text-sm text-center ${
                      validationErrors[`item-amount-${idx}`] ? "border-red-500" : "border-border"
                    }`}
                    min={0}
                    disabled={isSubmitting || isSuccess}
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={item.price}
                    onChange={e => handleItemChange(idx, "price", e.target.value)}
                    className={`px-2 py-1 border rounded w-full text-sm text-center ${
                      validationErrors[`item-price-${idx}`] ? "border-red-500" : "border-border"
                    }`}
                    min={0}
                    step="0.01"
                    disabled={isSubmitting || isSuccess}
                  />
                  <div className="text-sm font-semibold text-green-700 px-2 py-1 bg-green-100 rounded w-full text-center">
                    {`$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    title="Remove"
                    disabled={itemInputs.length === 1 || isSubmitting || isSuccess}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 bg-violet-300 text-violet-900 rounded font-semibold hover:bg-violet-400 transition-colors text-xs mt-2"
              disabled={isSubmitting || isSuccess}
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
            !formData.note.trim() ||
            !formData.createdAt ||
            itemInputs.length === 0 ||
            isSubmitting ||
            isSuccess
          }
          className="px-4 py-2 bg-violet-200 text-violet-900 rounded-lg hover:bg-violet-300 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>Update Payment</>
          )}
        </button>
      </div>
    </div>
  )
}

export default UpdatePaymentForm