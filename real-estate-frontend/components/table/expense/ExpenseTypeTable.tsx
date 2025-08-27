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
import CreateExpenseTypeForm from "@/components/form/expense/CreateExpenseTypeForm"
import UpdateExpenseTypeForm from "@/components/form/expense/UpdateExpenseTypeForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { useExpenseTypeContext } from "@/context/store/ExpenseTypeStore"
import formatDate from "@/utility/utility"
import { ExpenseTypeService } from "@/service/expense/ExpenseTypeService"
import ResEntryExpenseTypeDto from "@/domain/expense/ResEntryExpenseTypeDto"
import Either, { isLeft } from "@/implementation/Either"
import { ServiceError } from "@/implementation/ServiceError"


const ExpenseTypeTable = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof ResEntryExpenseTypeDto>("detail")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editDetail, setEditDetail] = useState<string>("")
  const [editError, setEditError] = useState("")

  const { expenseTypes, refreshExpenseTypes } = useExpenseTypeContext()

  const filteredExpenseTypes = expenseTypes.filter((type) =>
    type.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedExpenseTypes = [...filteredExpenseTypes].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedExpenseTypes.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedExpenseTypes = sortedExpenseTypes.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (column: keyof ResEntryExpenseTypeDto) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCreateExpenseType = async (expenseTypeData: { detail: string }) => {
    await ExpenseTypeService.instance.createNewExpenseType(expenseTypeData)
    await refreshExpenseTypes()
    setIsCreateModalOpen(false)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    setDeleteError("")
    const result = await ExpenseTypeService.instance.deleteExpenseType(deleteId)
    setIsDeleting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete expense type")
      return
    }
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    await refreshExpenseTypes()
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    setDeleteError("")
  }

  const handleEditClick = (id: string) => {
    const expenseType = expenseTypes.find(e => e.id === id)
    if (expenseType) {
      setEditId(id)
      setEditDetail(expenseType.detail)
      setIsEditModalOpen(true)
    }
  }

  // Only refresh and close modal after update, move API logic to UpdateExpenseTypeForm
  const handleUpdateExpenseType = async () => {
    await refreshExpenseTypes()
    setIsEditModalOpen(false)
    setEditId(null)
    setEditDetail("")
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditDetail("")
    setEditError("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expense Types</h1>
          <p className="text-muted-foreground mt-1">Manage expense type categories</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Expense Type
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search expense types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card/60 backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
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
                    onClick={() => handleSort(column.key as keyof ResEntryExpenseTypeDto)}
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
              {paginatedExpenseTypes.length > 0 ? (
                paginatedExpenseTypes.map((type, index) => (
                  <tr
                    key={type.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{type.id.slice(0,6)}</td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{type.detail}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(type.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(type.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1 text-muted-foreground hover:text-accent transition-colors"
                          onClick={() => handleEditClick(type.id)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDeleteClick(type.id)}
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
                      <p className="text-muted-foreground">No expense types found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedExpenseTypes.length > 0 && (
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedExpenseTypes.length)} of{" "}
                {sortedExpenseTypes.length}
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
        {paginatedExpenseTypes.length > 0 ? (
          paginatedExpenseTypes.map((type) => (
            <div
              key={type.id}
              className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">{type.detail}</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {type.id.slice(0,6)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">Created: {formatDate(type.createdAt)}</p>
                  <p className="text-muted-foreground text-sm">Updated: {formatDate(type.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    onClick={() => handleEditClick(type.id)}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    onClick={() => handleDeleteClick(type.id)}
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
              <p className="text-foreground">No expense types found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Expense Type Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Expense Type">
        <CreateExpenseTypeForm onSubmit={handleCreateExpenseType} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      {/* Update Expense Type Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Expense Type"
        maxWidth="sm"
      >
        {editId && (
          <UpdateExpenseTypeForm
            id={editId}
            detail={editDetail}
            onSubmit={handleUpdateExpenseType}
            onCancel={handleCancelEdit}
          />
        )}
      </Modal>

      {/* Delete Expense Type Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Expense Type"
        maxWidth="sm"
      >
        {deleteId && (
          <CommonDeleteForm
            description={`Delete expense type: "${expenseTypes.find(e => e.id === deleteId)?.detail}"? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isSubmitting={isDeleting}
          />
        )}
        {deleteError && (
          <div className="mt-4 text-red-500 text-sm text-center">{deleteError}</div>
        )}
      </Modal>
    </div>
  )
}

export default ExpenseTypeTable