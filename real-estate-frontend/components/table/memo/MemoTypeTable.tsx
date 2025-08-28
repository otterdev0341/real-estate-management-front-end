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
import CreateMemoTypeForm from "@/components/form/memo/CreateMemoTypeForm"
import UpdateMemoTypeForm from "@/components/form/memo/UpdateMemoTypeForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { useMemoTypeContext } from "@/context/store/MemoTypeStore"
import { MemoTypeService } from "@/service/memo/MemoTypeService"
import formatDate from "@/utility/utility"
import { isLeft } from "@/implementation/Either"

const MemoTypeTable = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const [editId, setEditId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editDetail, setEditDetail] = useState<string>("")

  const { memoTypes, refreshMemoTypes } = useMemoTypeContext()

  const filteredMemoTypes = memoTypes.filter((type) =>
    type.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedMemoTypes = [...filteredMemoTypes].sort((a, b) => {
    if (a.detail < b.detail) return -1
    if (a.detail > b.detail) return 1
    return 0
  })

  const totalPages = Math.ceil(sortedMemoTypes.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedMemoTypes = sortedMemoTypes.slice(startIndex, startIndex + rowsPerPage)

  const handleCreateMemoType = async (memoTypeData: { detail: string }) => {
    await MemoTypeService.instance.createNewMemoType(memoTypeData)
    await refreshMemoTypes()
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
    const result = await MemoTypeService.instance.deleteMemoType(deleteId)
    setIsDeleting(false)
    if (result && "isLeft" in result && isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete memo type")
      return
    }
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    await refreshMemoTypes()
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    setDeleteError("")
  }

  const handleEditClick = (id: string) => {
    const memoType = memoTypes.find(e => e.id === id)
    if (memoType) {
      setEditId(id)
      setEditDetail(memoType.detail)
      setIsEditModalOpen(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditDetail("")
  }

  const handleUpdateMemoType = async () => {
    await refreshMemoTypes()
    setIsEditModalOpen(false)
    setEditId(null)
    setEditDetail("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Memo Types</h1>
          <p className="text-muted-foreground mt-1">Manage memo type categories</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Memo Type
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search memo types..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Detail</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Updated At</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMemoTypes.length > 0 ? (
                paginatedMemoTypes.map((type, index) => (
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
                        {/* Edit button (not implemented) */}
                        <button
                          className="p-1 text-muted-foreground hover:text-accent transition-colors"
                          onClick={() => handleEditClick(type.id)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {/* Delete button */}
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
                      <p className="text-muted-foreground">No memo types found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedMemoTypes.length > 0 && (
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedMemoTypes.length)} of{" "}
                {sortedMemoTypes.length}
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
        {paginatedMemoTypes.length > 0 ? (
          paginatedMemoTypes.map((type) => (
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
                  {/* Edit button (not implemented) */}
                  <button
                    className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                    onClick={() => handleEditClick(type.id)}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  {/* Delete button */}
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
              <p className="text-foreground">No memo types found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Memo Type Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Memo Type">
        <CreateMemoTypeForm onSubmit={handleCreateMemoType} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      {/* Delete Memo Type Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Memo Type"
        maxWidth="sm"
      >
        {deleteId && (
          <CommonDeleteForm
            description={`Delete memo type: "${memoTypes.find(e => e.id === deleteId)?.detail}"? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isSubmitting={isDeleting}
            error={deleteError}
          />
        )}
      </Modal>

      {/* Update Memo Type Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Memo Type"
        maxWidth="sm"
      >
        {editId && (
          <UpdateMemoTypeForm
            id={editId}
            detail={editDetail}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateMemoType}
          />
        )}
      </Modal>
    </div>
  )
}

export default MemoTypeTable