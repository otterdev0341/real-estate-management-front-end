"use client"

import { useState } from "react"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import Modal from "@/components/modal/Modal"
import CreatePropertyForm from "@/components/form/property/property/CreatePropertyForm"
import UpdatePropertyForm from "@/components/form/property/property/UpdatePropertyForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { PropertyService } from "@/service/property/PropertyService"
import { isLeft, isRight } from "@/implementation/Either"
import ResEntryPropertyDto from "@/domain/property/property/ResEntryPropertyDto"
import formatDate from "@/utility/utility"
import { useRouter } from "next/navigation"

const PropertyTable = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof ResEntryPropertyDto>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [errorLabel, setErrorLabel] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingProperty, setDeletingProperty] = useState<ResEntryPropertyDto | null>(null)
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editPropertyData, setEditPropertyData] = useState<Partial<ResEntryPropertyDto>>({})

  const { properties, loading, refreshProperties } = usePropertyContext()
  const router = useRouter()

  // Filter and sort
  const filteredProperties = properties.filter((property) =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (property.ownerBy ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedProperties.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedProperties = sortedProperties.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (column: keyof ResEntryPropertyDto) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // CREATE
  const handleCreateProperty = async (formData: any) => {
    setErrorLabel("")
    const result = await PropertyService.instance.createNewProperty(formData)
    if (isLeft(result)) {
      setErrorLabel(result.value.message || "Failed to create property")
      return
    }
    setIsCreateModalOpen(false)
    await refreshProperties()
  }

  // EDIT
  const handleEditClick = (property: ResEntryPropertyDto) => {
    setEditId(property.id)
    setEditPropertyData(property)
    setIsEditModalOpen(true)
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditPropertyData({})
  }

  const handleUpdateProperty = async () => {
    await refreshProperties()
    setIsEditModalOpen(false)
    setEditId(null)
    setEditPropertyData({})
  }

  // DELETE
  const handleDeleteClick = (property: ResEntryPropertyDto) => {
    setDeletingProperty(property)
    setIsDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deletingProperty) return
    setIsSubmittingDelete(true)
    setDeleteError("")
    const result = await PropertyService.instance.deleteProperty(deletingProperty.id)
    setIsSubmittingDelete(false)
    if (isRight(result)) {
      setIsDeleteModalOpen(false)
      setDeletingProperty(null)
      await refreshProperties()
    } else {
      setDeleteError(result.value.message || "Failed to delete property")
    }
  }

  // Add this handler for row click
  const handleRowClick = (propertyId: string) => {
    router.push(`/service/property/${propertyId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your real estate portfolio</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Property
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Error Label */}
      {errorLabel && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
          <p className="text-red-600 text-sm">{errorLabel}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card/60 backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 backdrop-blur-sm border-b border-border">
                {[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "price", label: "Price" },
                  { key: "propertyStatus", label: "Property Status" },
                  { key: "ownerBy", label: "Owner" },
                  { key: "budgetUsedPercent", label: "Budget Used (%)" },
                  { key: "updatedAt", label: "Updated At" },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof ResEntryPropertyDto)}
                    className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-accent transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {sortColumn === column.key && (
                        <span className="text-accent">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center animate-pulse" />
                      <p className="text-muted-foreground">Loading properties...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProperties.length > 0 ? (
                paginatedProperties.map((property, index) => (
                  <tr
                    key={property.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                    }`}
                    onClick={() => handleRowClick(property.id)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{property.id.slice(0, 6)}</td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{property.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {property.price !== undefined && property.price !== null
                        ? new Intl.NumberFormat().format(Number(property.price))
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{property.propertyStatus ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{property.ownerBy ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {property.budgetUsedPercent !== undefined
                        ? `${property.budgetUsedPercent}%`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(property.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1 text-muted-foreground hover:text-accent transition-colors"
                          onClick={e => {
                            e.stopPropagation()
                            handleEditClick(property)
                          }}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteClick(property)
                          }}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No properties found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedProperties.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-muted/30 backdrop-blur-sm border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedProperties.length)} of{" "}
                {sortedProperties.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-card/60 border border-border rounded-xl p-8 text-center animate-pulse">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center" />
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          </div>
        ) : paginatedProperties.length > 0 ? (
          paginatedProperties.map((property) => (
            <div
              key={property.id}
              className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200 cursor-pointer"
              onClick={() => handleRowClick(property.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">{property.name}</h3>
                  <p className="text-muted-foreground text-sm">Owner: {property.ownerBy ?? "-"}</p>
                  <p className="text-muted-foreground text-sm">
                    Price: {property.price !== undefined && property.price !== null
                      ? new Intl.NumberFormat().format(Number(property.price))
                      : "-"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Status: {property.propertyStatus ?? "-"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Budget Used: {property.budgetUsedPercent !== undefined
                      ? `${property.budgetUsedPercent}%`
                      : "-"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Updated: {formatDate(property.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    onClick={e => {
                      e.stopPropagation()
                      handleEditClick(property)
                    }}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteClick(property)
                    }}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground">No properties found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Property Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Property"
        maxWidth="md"
      >
        <CreatePropertyForm
          onSubmit={handleCreateProperty}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Update Property Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Property"
        maxWidth="md"
      >
        {editId && (
          <UpdatePropertyForm
            id={editPropertyData.id ?? ""}
            name={editPropertyData.name ?? ""}
            description={editPropertyData.description ?? ""}
            specific={editPropertyData.specific ?? ""}
            highlight={editPropertyData.highlight ?? ""}
            area={editPropertyData.area ?? ""}
            price={typeof editPropertyData.price === "number" ? editPropertyData.price : Number(editPropertyData.price) || 0.0}
            fsp={typeof editPropertyData.fsp === "number" ? editPropertyData.fsp : Number(editPropertyData.fsp) || 0.0}
            budget={typeof editPropertyData.budget === "number" ? editPropertyData.budget : Number(editPropertyData.budget) || 0.0}
            propertyStatus={editPropertyData.propertyStatus ?? ""}
            ownerBy={editPropertyData.ownerBy ?? ""}
            mapUrl={editPropertyData.mapUrl ?? ""}
            lat={editPropertyData.lat ?? ""}
            lng={editPropertyData.lng ?? ""}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateProperty}
          />
        )}
      </Modal>

      {/* Delete Property Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingProperty(null)
        }}
        title="Delete Property"
        maxWidth="sm"
        footer={null}
      >
        <CommonDeleteForm
          description={`Are you sure you want to delete "${deletingProperty?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false)
            setDeletingProperty(null)
          }}
          isSubmitting={isSubmittingDelete}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default PropertyTable
