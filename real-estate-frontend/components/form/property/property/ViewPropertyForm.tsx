"use client"
import { useEffect, useState } from "react"
import ResEntryPropertyDto from "@/domain/property/property/ResEntryPropertyDto"
import { PropertyService } from "@/service/property/PropertyService"
import { isLeft } from "@/implementation/Either"
import formatDate from "@/utility/utility"
import { MoreVertical, Edit3, Trash2, Tag } from "lucide-react"
import Modal from "@/components/modal/Modal"
import UpdatePropertyForm from "@/components/form/property/property/UpdatePropertyForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface ViewPropertyFormProps {
  propertyId: string
}

const ViewPropertyForm = ({ propertyId }: ViewPropertyFormProps) => {
  const [property, setProperty] = useState<ResEntryPropertyDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const router = useRouter()

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true)
      const result = await PropertyService.instance.fetchPropertyById(propertyId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch property")
        setProperty(null)
      } else {
        setProperty(result.value)
      }
      setLoading(false)
    }
    fetchProperty()
  }, [propertyId])

  const handleEdit = () => {
    setIsEditModalOpen(true)
    setMenuOpen(false)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
    setMenuOpen(false)
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
  }

  const handleUpdateProperty = async () => {
    setIsEditModalOpen(false)
    setLoading(true)
    const result = await PropertyService.instance.fetchPropertyById(propertyId)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to fetch property")
      setProperty(null)
    } else {
      setProperty(result.value)
    }
    setLoading(false)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")
    const result = await PropertyService.instance.deleteProperty(propertyId)
    setIsDeleting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete property")
      return
    }
    setIsDeleteModalOpen(false)
    setProperty(null)
    router.push("/service/property")
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteError("")
  }

  if (loading) return (
    <div className="w-full">
      <Skeleton className="h-8 w-1/2 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-20 w-full mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-6 w-1/3 mt-2" />
    </div>
  )
  if (error) return <div className="text-red-500">{error}</div>
  if (!property) return <div className="text-muted-foreground">Property not found.</div>

  return (
    <div className="w-full">
      {/* Menu container */}
      <div className="relative w-full">
        <div className="absolute top-0 right-0 z-50">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center shadow-sm"
              aria-label="Property actions"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Property
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Main content */}
        <div className="pr-16 min-h-[200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Property Name</div>
                <div className="text-xl font-bold text-gray-900">{property.name}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Description</div>
                <div className="text-base text-gray-800 leading-relaxed">{property.description}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Owner</div>
                <div className="text-base text-gray-800">{property.ownerBy}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Status</div>
                <div className="text-base text-gray-800">{property.propertyStatus}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Price</div>
                <div className="text-base text-gray-800">{property.price}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Maximum Budget</div>
                <div className="text-base text-gray-800">
                  {property.maximumBudget !== undefined && property.maximumBudget !== null && property.maximumBudget !== ""
                    ? property.maximumBudget
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">FSP</div>
                <div className="text-base text-gray-800">
                  {property.fsp !== undefined && property.fsp !== null && property.fsp !== ""
                    ? property.fsp
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Area</div>
                <div className="text-base text-gray-800">
                  {property.area !== undefined && property.area !== null && property.area !== ""
                    ? property.area
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Highlight</div>
                <div className="text-base text-gray-800">
                  {property.highlight !== undefined && property.highlight !== null && property.highlight !== ""
                    ? property.highlight
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Specific</div>
                <div className="text-base text-gray-800">
                  {property.specific !== undefined && property.specific !== null && property.specific !== ""
                    ? property.specific
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Map URL</div>
                <div className="text-base text-gray-800 break-all">
                  {property.mapUrl !== undefined && property.mapUrl !== null && property.mapUrl !== ""
                    ? property.mapUrl
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Latitude / Longitude</div>
                <div className="text-base text-gray-800">
                  {(property.lat !== undefined && property.lat !== null && property.lat !== "" &&
                    property.lng !== undefined && property.lng !== null && property.lng !== "")
                    ? `${property.lat}, ${property.lng}`
                    : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Sale</div>
                <div>
                  {property.sold === true ? (
                    <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 font-semibold">
                      Case Close
                    </span>
                  ) : property.sold === false ? (
                    <span className="inline-block px-3 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 font-semibold">
                      Avaliable
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 text-gray-500 font-semibold">
                      -
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Budget Used (%)</div>
                <div className="text-base text-gray-800">{property.budgetUsedPercent ?? "-"}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Created At</div>
                <div className="text-base text-gray-800">{formatDate(property.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Updated At</div>
                <div className="text-base text-gray-800">{formatDate(property.updatedAt)}</div>
              </div>
              {/* You can add file list or other info here */}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Property"
        maxWidth="md"
      >
        {property && (
          <UpdatePropertyForm
            id={property.id}
            name={property.name}
            description={property.description}
            specific={property.specific}
            highlight={property.highlight}
            area={property.area}
            price={Number(property.price)}
            fsp={Number(property.fsp)}
            maximumBudget={Number(property.maximumBudget)}
            propertyStatus={property.propertyStatus}
            ownerBy={property.ownerBy}
            mapUrl={property.mapUrl}
            lat={property.lat}
            lng={property.lng}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateProperty}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Property"
        maxWidth="sm"
      >
        <CommonDeleteForm
          description={`Delete property: "${property?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isSubmitting={isDeleting}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default ViewPropertyForm