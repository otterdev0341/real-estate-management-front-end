"use client"

import { useState, useRef } from "react"
import { Paperclip } from "lucide-react"
import { useMemoTypeContext } from "@/context/store/MemoTypeStore"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import ReqCreateMemoDto from "@/domain/memo/ReqCreateMemoDto"

interface CreateMemoFormProps {
  onSubmit?: (memoData: any) => void
  onCancel?: () => void
}

const initialState: ReqCreateMemoDto = {
  name: "",
  detail: "",
  memoType: "",
  files: [] as File[],
  memoDate: new Date(), // Date type is correct
}

const CreateMemoForm = ({ onSubmit, onCancel }: CreateMemoFormProps) => {
  const { memoTypes, loading } = useMemoTypeContext()
  const [formData, setFormData] = useState(initialState)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const memoTypeOptions: CommonSelectItem[] = memoTypes.map(type => ({
    id: type.id,
    value: type.id,
    label: type.detail,
  }))

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.name.trim()) errors.name = "Memo name is required"
    if (!formData.memoType.trim()) errors.memoType = "Memo type is required"
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

  const handleMemoTypeSelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, memoType: item.value })
    setValidationErrors({ ...validationErrors, memoType: "" })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) }) // <-- Store as File[]
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, memoDate: date ?? new Date() }) // fallback to current date if undefined
    setDatePickerOpen(false)
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    const submitData: ReqCreateMemoDto = {
      ...formData,
      memoDate: formData.memoDate instanceof Date
        ? formData.memoDate
        : new Date(formData.memoDate ?? Date.now()), // ensure it's a Date
    }
    if (onSubmit) onSubmit(submitData)
  }

  const getAttachmentText = () => {
    const count = (formData.files ?? []).length
    if (count === 0) return "attachment"
    if (count === 1) return "1 attachment"
    return `${count} attachments`
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memo Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Project Proposal Memo"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.name ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Detail</label>
          <textarea
            name="detail"
            value={formData.detail}
            onChange={handleChange}
            placeholder="This memo outlines the scope and requirements for the Q4 marketing campaign."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memo Type *</label>
          <CommonSelect
            items={memoTypeOptions}
            defaultValue={formData.memoType}
            onSelect={handleMemoTypeSelect}
            placeholder="Select or search memo type"
            disabled={loading}
          />
          {validationErrors.memoType && <p className="text-red-500 text-xs mt-1">{validationErrors.memoType}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Files</label>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {/* Custom attachment button */}
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="flex items-center gap-2 px-3 py-2 bg-input border border-border rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{getAttachmentText()}</span>
          </button>
          {/* File list */}
          {(formData.files?.length ?? 0) > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground">
              {(formData.files ?? []).map((file, idx) => (
                <li key={idx}>{file.name} ({file.type}, {file.size} bytes)</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Label htmlFor="memoDate" className="block text-sm font-medium text-foreground mb-2">
            Created At
          </Label>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="memoDate"
                className="w-48 justify-between font-normal"
                type="button"
              >
                {formData.memoDate ? formData.memoDate.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.memoDate instanceof Date ? formData.memoDate : new Date(formData.memoDate ?? Date.now())}
                captionLayout="dropdown"
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover>
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
            !formData.name.trim() ||
            !formData.memoType.trim()
          }
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          Create Memo
        </button>
      </div>
    </>
  )
}

export default CreateMemoForm