"use client"

import { useState, useRef } from "react"
import { Paperclip } from "lucide-react"
import { usePropertyStatusContext } from "@/context/store/PropertyStatusStore"
import { useContactContext } from "@/context/store/ContactStore"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { Switch } from "@/components/ui/switch"
import extractLatLng from "@/utility/extractLatLng"
import { isRight } from "@/implementation/Either"

interface FileUpload {
  name: string
  size: number
  type: string
}

interface CreatePropertyFormProps {
  onSubmit?: (propertyData: any) => void
  onCancel?: () => void
}

const initialState = {
  name: "",
  description: "",
  specific: "",
  highlight: "",
  area: "",
  price: "",
  fsp: "",
  budget: "",
  propertyStatus: "",
  ownerBy: "",
  mapUrl: "",
  lat: "",
  lng: "",
  files: [] as File[], // <-- Correct type for blob upload
}

const CreatePropertyForm = ({ onSubmit, onCancel }: CreatePropertyFormProps) => {
  const { propertyStatuses, loading: statusLoading } = usePropertyStatusContext()
  const { contacts, loading: contactLoading } = useContactContext()
  const [formData, setFormData] = useState(initialState)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [extractSwitch, setExtractSwitch] = useState(false)
  const [extractError, setExtractError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const propertyStatusOptions: CommonSelectItem[] = propertyStatuses.map(status => ({
    id: status.id,
    value: status.id,
    label: status.detail,
  }))

  const ownerOptions: CommonSelectItem[] = contacts.map(contact => ({
    id: contact.id,
    value: contact.id,
    label: contact.businessName,
  }))

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.name.trim()) errors.name = "Property name is required"
    if (!formData.ownerBy.trim()) errors.ownerBy = "Owner is required"
    if (!formData.propertyStatus.trim()) errors.propertyStatus = "Status is required"
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

  const handleStatusSelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, propertyStatus: item.value })
    setValidationErrors({ ...validationErrors, propertyStatus: "" })
  }

  const handleOwnerSelect = (item: CommonSelectItem) => {
    setFormData({ ...formData, ownerBy: item.value })
    setValidationErrors({ ...validationErrors, ownerBy: "" })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) }) // <-- Store as File[]
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    if (onSubmit) onSubmit(formData)
  }

  const handleExtractSwitch = (checked: boolean) => {
    if (checked) {
      const result = extractLatLng(formData.mapUrl)
      if (isRight(result)) {
        setFormData({
          ...formData,
          lat: result.value.lat || "",
          lng: result.value.lng || "",
        })
        setExtractSwitch(true)
        setExtractError("")
      } else {
        setFormData({
          ...formData,
          lat: "",
          lng: "",
        })
        setExtractSwitch(false)
        setExtractError("Failed to extract latitude/longitude from the provided map URL.")
      }
    } else {
      setExtractSwitch(false)
      setExtractError("")
    }
  }

  const getAttachmentText = () => {
    const count = formData.files.length
    if (count === 0) return "attachment"
    if (count === 1) return "1 attachment"
    return `${count} attachments`
  }

  return (
    <>
      <div
        className="space-y-4 max-h-[70vh] overflow-y-auto"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
        }}
      >
        {/* Property Name on first line */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Property Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Example Property Name"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.name ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
        </div>
        {/* Owner and Property Status on second line */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Owner *</label>
            <CommonSelect
              items={ownerOptions}
              defaultValue={formData.ownerBy}
              onSelect={handleOwnerSelect}
              placeholder="Select owner"
              disabled={contactLoading}
            />
            {validationErrors.ownerBy && <p className="text-red-500 text-xs mt-1">{validationErrors.ownerBy}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Property Status *</label>
            <CommonSelect
              items={propertyStatusOptions}
              defaultValue={formData.propertyStatus}
              onSelect={handleStatusSelect}
              placeholder="Select status"
              disabled={statusLoading}
            />
            {validationErrors.propertyStatus && <p className="text-red-500 text-xs mt-1">{validationErrors.propertyStatus}</p>}
          </div>
        </div>
        {/* Other fields, flex as needed */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Price</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g., 500000 USD"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">FSP</label>
            <input
              type="text"
              name="fsp"
              value={formData.fsp}
              onChange={handleChange}
              placeholder="Further specific property information."
              className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            />
          </div>
        </div>
        {/* Maximum Budget on new line */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Maximum Budget</label>
          <input
            type="text"
            name="maximumBudget"
            value={formData.budget ?? ""}
            onChange={handleChange}
            placeholder="e.g., 600000 USD"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A detailed description of the property."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
            rows={2}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Specific</label>
            <textarea
              name="specific"
              value={formData.specific}
              onChange={handleChange}
              placeholder="Any specific details about the property."
              className="w-full px-3 py-2 bg-input border border-border rounded-lg resize-none"
              rows={2}
            />
          </div>
        </div>
        {/* Highlight on new line as textarea */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Highlight</label>
          <textarea
            name="highlight"
            value={formData.highlight}
            onChange={handleChange}
            placeholder="Key highlights or selling points."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg resize-none"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Map URL</label>
          <input
            type="text"
            name="mapUrl"
            value={formData.mapUrl}
            onChange={handleChange}
            placeholder="URL to a map location"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        {/* Switch for extracting lat/lng */}
        <div className="flex items-center gap-2 mb-2">
          <Switch
            checked={extractSwitch}
            onCheckedChange={handleExtractSwitch}
            id="extract-latlng-switch"
          />
          <label htmlFor="extract-latlng-switch" className="text-sm text-foreground">
            Extract lat long
          </label>
        </div>
        {extractError && (
          <div className="text-xs text-red-500 mb-2">{extractError}</div>
        )}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Latitude</label>
            <input
              type="text"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              placeholder="Latitude coordinate"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Longitude</label>
            <input
              type="text"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              placeholder="Longitude coordinate"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            />
          </div>
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
          {formData.files.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground">
              {formData.files.map((file, idx) => (
                <li key={idx}>{file.name} ({file.type}, {file.size} bytes)</li>
              ))}
            </ul>
          )}
        </div>
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
            !formData.name.trim() ||
            !formData.ownerBy.trim() ||
            !formData.propertyStatus.trim()
          }
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
        >
          Create Property
        </button>
      </div>
    </>
  )
}

export default CreatePropertyForm