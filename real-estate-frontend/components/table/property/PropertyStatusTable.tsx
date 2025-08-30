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
import CreatePropertyStatusForm from "@/components/form/property/propertyStatus/CreatePropertyStatusForm"
import UpdatePropertyStatusForm from "@/components/form/property/propertyStatus/UpdatePropertyStatusForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { usePropertyStatusContext } from "@/context/store/PropertyStatusStore"
import formatDate from "@/utility/utility"
import { PropertyStatusService } from "@/service/property/PropertyStatusService"
import { ResEntryPropertyStatusDto } from "@/domain/property/propertyStatus/ResEntryPropertyStatusDto"
import { isLeft } from "@/implementation/Either"
import { Skeleton } from "@/components/ui/skeleton"

const PropertyStatusTable = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof ResEntryPropertyStatusDto>("detail")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editDetail, setEditDetail] = useState<string>("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const { propertyStatuses, refreshPropertyStatuses, loading } = usePropertyStatusContext()

  const filteredStatuses = propertyStatuses.filter((status) =>
    status.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedStatuses = [...filteredStatuses].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedStatuses.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedStatuses = sortedStatuses.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (column: keyof ResEntryPropertyStatusDto) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // CREATE
  const handleCreateStatus = async () => {
    await refreshPropertyStatuses()
    setIsCreateModalOpen(false)
  }

  // EDIT
  const handleEditClick = (id: string) => {
    const status = propertyStatuses.find(e => e.id === id)
    if (status) {
      setEditId(id)
      setEditDetail(status.detail)
      setIsEditModalOpen(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditDetail("")
  }

  const handleUpdateStatus = async () => {
    await refreshPropertyStatuses()
    setIsEditModalOpen(false)
    setEditId(null)
    setEditDetail("")
  }

  // DELETE
  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    setDeleteError("")
    const result = await PropertyStatusService.instance.deletePropertyStatus(deleteId)
    setIsDeleting(false)
    if (result && isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete property status")
      return
    }
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    await refreshPropertyStatuses()
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    setDeleteError("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Property Status</h1>
          <p className="text-muted-foreground mt-1">Manage property status options and workflows</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Status
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search property status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card/60 backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          {loading ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                  <th className="px-6 py-4"><Skeleton className="h-4 w-24" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 backdrop-blur-sm border-b border-border">
                  {[
                    { key: "id", label: "ID" },
                    { key: "detail", label: "Detail" },
                    { key: "createdAt", label: "Created At" },
                    { key: "updatedAt", label: "Updated At" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key as keyof ResEntryPropertyStatusDto)}
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
                {paginatedStatuses.length > 0 ? (
                  paginatedStatuses.map((status, index) => (
                    <tr
                      key={status.id}
                      className={`border-b border-border hover:bg-muted/30 transition-colors ${
                        index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{status.id.slice(0,6)}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{status.detail}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(status.createdAt)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(status.updatedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1 text-muted-foreground hover:text-accent transition-colors"
                            onClick={() => handleEditClick(status.id)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => handleDeleteClick(status.id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <MagnifyingGlassIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No property status found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {paginatedStatuses.length > 0 && (
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedStatuses.length)} of{" "}
                {sortedStatuses.length}
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
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-card/60 border border-border rounded-xl p-4 shadow-lg">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : (
          paginatedStatuses.length > 0 ? (
            paginatedStatuses.map((status) => (
              <div
                key={status.id}
                className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-foreground text-lg">{status.detail}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {status.id.slice(0,6)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">Created: {formatDate(status.createdAt)}</p>
                    <p className="text-muted-foreground text-sm">Updated: {formatDate(status.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      onClick={() => handleEditClick(status.id)}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      onClick={() => handleDeleteClick(status.id)}
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
                <p className="text-foreground">No property status found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Create Property Status Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Property Status"
        maxWidth="sm"
      >
        <CreatePropertyStatusForm
          onCancel={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateStatus}
        />
      </Modal>

      {/* Update Property Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Property Status"
        maxWidth="sm"
      >
        {editId && (
          <UpdatePropertyStatusForm
            initialData={{ id: editId, detail: editDetail }}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateStatus}
          />
        )}
      </Modal>

      {/* Delete Property Status Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Property Status"
        maxWidth="sm"
      >
        {deleteId && (
          <CommonDeleteForm
            description={`Delete property status: "${propertyStatuses.find(e => e.id === deleteId)?.detail}"? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isSubmitting={isDeleting}
            error={deleteError}
          />
        )}
      </Modal>
    </div>
  )
}

export default PropertyStatusTable
