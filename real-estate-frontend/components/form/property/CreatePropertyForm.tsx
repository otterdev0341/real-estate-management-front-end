"use client"

import { useState } from "react"


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
  propertyStatus: "",
  ownerBy: "",
  mapUrl: "",
  lat: "",
  lng: "",
  files: [] as FileUpload[],
}

const CreatePropertyForm = ({ onSubmit, onCancel }: CreatePropertyFormProps) => {
  const [formData, setFormData] = useState(initialState)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.name.trim()) errors.name = "Property name is required"
    if (!formData.ownerBy.trim()) errors.ownerBy = "Owner is required"
    if (!formData.propertyStatus.trim()) errors.propertyStatus = "Status is required"
    if (!formData.price.trim()) errors.price = "Price is required"
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr: FileUpload[] = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }))
      setFormData({ ...formData, files: filesArr })
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Specific</label>
          <input
            type="text"
            name="specific"
            value={formData.specific}
            onChange={handleChange}
            placeholder="Any specific details about the property."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Highlight</label>
          <input
            type="text"
            name="highlight"
            value={formData.highlight}
            onChange={handleChange}
            placeholder="Key highlights or selling points."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Area</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g., 100 sqm"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Price *</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., 500000 USD"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.price ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.price && <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>}
        </div>
        <div>
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Property Status *</label>
          <input
            type="text"
            name="propertyStatus"
            value={formData.propertyStatus}
            onChange={handleChange}
            placeholder="e.g., Available"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.propertyStatus ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.propertyStatus && <p className="text-red-500 text-xs mt-1">{validationErrors.propertyStatus}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Owner *</label>
          <input
            type="text"
            name="ownerBy"
            value={formData.ownerBy}
            onChange={handleChange}
            placeholder="Owner's UUID or identifier"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              validationErrors.ownerBy ? "border-red-500" : "border-border"
            }`}
          />
          {validationErrors.ownerBy && <p className="text-red-500 text-xs mt-1">{validationErrors.ownerBy}</p>}
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
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
          />
          {formData.files.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground">
              {formData.files.map((file, idx) => (
                <li key={idx}>{file.name} ({file.type}, {file.size} bytes)</li>
              ))}
            </ul>
          )}
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
            !formData.ownerBy.trim() ||
            !formData.propertyStatus.trim() ||
            !formData.price.trim()
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