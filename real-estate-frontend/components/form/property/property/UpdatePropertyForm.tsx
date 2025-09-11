"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { usePropertyStatusContext } from "@/context/store/PropertyStatusStore"
import { useContactContext } from "@/context/store/ContactStore"
import CommonSelect, { CommonSelectItem } from "@/components/options/CommonSelect"
import { PropertyService } from "@/service/property/PropertyService"
import { isLeft, isRight } from "@/implementation/Either"
import ReqUpdatePropertyDto from "@/domain/property/property/ReqUpdatePropertyDto"
import extractLatLng from "@/utility/extractLatLng"
import { Switch } from "@/components/ui/switch"

interface UpdatePropertyFormProps extends ReqUpdatePropertyDto {
  onCancel: () => void
  onSuccess: () => void
}

const UpdatePropertyForm = ({
  id,
  name,
  description,
  specific,
  highlight,
  area,
  price,
  fsp,
  budget,
  propertyStatus,
  ownerBy,
  mapUrl,
  lat,
  lng,
  onCancel,
  onSuccess,
}: UpdatePropertyFormProps) => {
  const { propertyStatuses, loading: statusLoading } = usePropertyStatusContext()
  const { contacts, loading: contactLoading } = useContactContext()

  // Helper to get correct id from value (string)
  const getOwnerId = (ownerValue: string) => {
    const found = contacts.find(contact => contact.businessName === ownerValue || contact.id === ownerValue)
    return found ? found.id : ownerValue
  }
  const getStatusId = (statusValue: string) => {
    const found = propertyStatuses.find(status => status.detail === statusValue || status.id === statusValue)
    return found ? found.id : statusValue
  }

  // Initialize formData with correct ids
  const [formData, setFormData] = useState<ReqUpdatePropertyDto>({
    id,
    name,
    description,
    specific,
    highlight,
    area,
    price,
    fsp,
    budget,
    propertyStatus: getStatusId(propertyStatus),
    ownerBy: getOwnerId(ownerBy),
    mapUrl,
    lat,
    lng,
  })

  // Update formData when contacts or propertyStatuses change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ownerBy: getOwnerId(ownerBy),
      propertyStatus: getStatusId(propertyStatus),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, propertyStatuses, ownerBy, propertyStatus])

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const [errorLabel, setErrorLabel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [extractSwitch, setExtractSwitch] = useState(false)
  const [extractError, setExtractError] = useState<string>("")

  const propertyStatusOptions: CommonSelectItem[] = propertyStatuses.map(status => ({
    id: status.id,
    value: status.detail, 
    label: status.detail,
  }))

  const ownerOptions: CommonSelectItem[] = contacts.map(contact => ({
    id: contact.id,
    value: contact.businessName, 
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
      const result = await PropertyService.instance.updateProperty(formData)
      if (isLeft(result)) {
        setErrorLabel(result.value.message || "Failed to update property")
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

  return (
    <div
      className={`relative transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
    >
      {/* Success Overlay */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-20">
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 animate-in zoom-in duration-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Success!</h3>
              <p className="text-sm text-gray-600">Property has been updated</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && !isSuccess && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Updating property...</span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div
        className={`space-y-4 transition-opacity duration-200 max-h-[70vh] overflow-y-auto ${isSuccess ? 'opacity-30' : 'opacity-100'}`}
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
        }}
      >
        {/* Property ID */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Property ID</label>
          <input
            type="text"
            value={formData.id}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-border rounded-lg text-muted-foreground text-sm sm:text-base opacity-70"
            disabled
          />
        </div>
        {/* Property Name */}
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
            disabled={isSubmitting || isSuccess}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
          )}
        </div>
        {/* Owner and Property Status */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Owner *</label>
            <CommonSelect
              items={ownerOptions}
              defaultValue={formData.ownerBy}
              onSelect={item => {
                setFormData({ ...formData, ownerBy: item.id })
                setValidationErrors({ ...validationErrors, ownerBy: "" })
                setErrorLabel("")
              }}
              placeholder="Select owner"
              disabled={contactLoading || isSubmitting || isSuccess}
            />
            {validationErrors.ownerBy && <p className="text-red-500 text-xs mt-1">{validationErrors.ownerBy}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Property Status *</label>
            <CommonSelect
              items={propertyStatusOptions}
              defaultValue={formData.propertyStatus}
              onSelect={item => {
                setFormData({ ...formData, propertyStatus: item.id })
                setValidationErrors({ ...validationErrors, propertyStatus: "" })
                setErrorLabel("")
              }}
              placeholder="Select status"
              disabled={statusLoading || isSubmitting || isSuccess}
            />
            {validationErrors.propertyStatus && <p className="text-red-500 text-xs mt-1">{validationErrors.propertyStatus}</p>}
          </div>
        </div>
        {/* Price, FSP */}
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
              disabled={isSubmitting || isSuccess}
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
              disabled={isSubmitting || isSuccess}
            />
          </div>
        </div>
        {/* Maximum Budget */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Maximum Budget</label>
          <input
            type="text"
            name="maximumBudget"
            value={formData.budget ?? ""}
            onChange={handleChange}
            placeholder="e.g., 600000 USD"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A detailed description of the property."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base"
            rows={2}
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Specific */}
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
              disabled={isSubmitting || isSuccess}
            />
          </div>
        </div>
        {/* Highlight */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Highlight</label>
          <textarea
            name="highlight"
            value={formData.highlight}
            onChange={handleChange}
            placeholder="Key highlights or selling points."
            className="w-full px-3 py-2 bg-input border border-border rounded-lg resize-none"
            rows={2}
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Area</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g., 100 sqm"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        {/* Map URL */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Map URL</label>
          <input
            type="text"
            name="mapUrl"
            value={formData.mapUrl}
            onChange={handleChange}
            placeholder="URL to a map location"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg"
            disabled={isSubmitting || isSuccess}
          />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Switch
            checked={extractSwitch}
            onCheckedChange={handleExtractSwitch}
            id="extract-latlng-switch"
            disabled={isSubmitting || isSuccess}
          />
          <label htmlFor="extract-latlng-switch" className="text-sm text-foreground">
            Extract lat long
          </label>
        </div>
        {extractError && (
          <div className="text-xs text-red-500 mb-2">{extractError}</div>
        )}
        {/* Latitude & Longitude */}
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
              disabled={isSubmitting || isSuccess}
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
              disabled={isSubmitting || isSuccess}
            />
          </div>
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
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
            !formData.ownerBy.trim() ||
            !formData.propertyStatus.trim() ||
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

export default UpdatePropertyForm