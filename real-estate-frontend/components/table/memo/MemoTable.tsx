"use client"

import { useState } from "react"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PaperClipIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline"
import Modal from "@/components/modal/Modal"
import CreateMemoForm from "@/components/form/memo/CreateMemoForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { useMemoContext } from "@/context/store/MemoStore"
import { MemoService } from "@/service/memo/MemoService"
import formatDate from "@/utility/utility"
import { isLeft } from "@/implementation/Either"
import ResEntryMemoDto from "@/domain/memo/ResEntryMemoDto"
import UpdateMemoForm from "@/components/form/memo/UpdateMemoForm"
import FileUpload from "@/domain/uploadFile/FileUpload"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const MemoTable = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof ResEntryMemoDto>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editMemoData, setEditMemoData] = useState<Partial<ResEntryMemoDto>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const { memos, refreshMemos } = useMemoContext()
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  // Filter and sort
  const filteredMemos = memos.filter((memo) =>
    memo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (memo.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedMemos = [...filteredMemos].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedMemos.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedMemos = sortedMemos.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (column: keyof ResEntryMemoDto) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Helper to count file types
  const getFileTypeCounts = (files: FileUpload[]) => {
    const counts = { image: 0, pdf: 0, other: 0 }
    files.forEach(file => {
      if (file.fileType === "image") counts.image++
      else if (file.fileType === "pdf") counts.pdf++
      else counts.other++
    })
    return counts
  }

  // Edit
  const handleEditClick = (memo: ResEntryMemoDto) => {
    setEditId(memo.id)
    setEditMemoData(memo)
    setIsEditModalOpen(true)
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditMemoData({})
  }

  const handleUpdateMemo = async () => {
    await refreshMemos()
    setIsEditModalOpen(false)
    setEditId(null)
    setEditMemoData({})
  }

  // Delete
  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    setDeleteError("")
    const result = await MemoService.instance.deleteMemo(deleteId)
    setIsDeleting(false)
    if (result && "isLeft" in result && isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete memo")
      return
    }
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    await refreshMemos()
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    setDeleteError("")
  }

  // Add this handler
  const handleRowClick = (memoId: string) => {
    setIsNavigating(true)
    // Optional: add a small delay for UX
    setTimeout(() => {
      router.push(`/service/memo/${memoId}`)
    }, 400)
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Memos</h1>
          <p className="text-muted-foreground mt-1">Manage your memos</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Memo
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search memos..."
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
                  { key: "name", label: "Name" },
                  { key: "detail", label: "Detail" },
                  { key: "memoType", label: "Memo Type" },
                  { key: "attachment", label: "Attachment" },
                  { key: "createdAt", label: "Created At" }, // <-- changed here
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={column.key !== "attachment" ? () => handleSort(column.key as keyof ResEntryMemoDto) : undefined}
                    className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-accent transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {sortColumn === column.key && column.key.toString() !== "attachment" && (
                        <span className="text-accent">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMemos.length > 0 ? (
                paginatedMemos.map((memo, index) => {
                  const counts = getFileTypeCounts(memo.files)
                  return (
                    <tr
                      key={memo.id}
                      className={`border-b border-border hover:bg-muted/30 transition-colors cursor-pointer ${
                        index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                      }`}
                      onClick={() => handleRowClick(memo.id)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{memo.id.slice(0,6)}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {memo.name && memo.name.length > 40
                          ? memo.name.slice(0, 40) + "..."
                          : memo.name || "-"}
                      </td>
                      {/* Detail column */}
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {memo.detail && memo.detail.length > 40
                          ? memo.detail.slice(0, 40) + "..."
                          : memo.detail || "-"}
                      </td>
                      {/* Memo Type column */}
                      <td className="px-6 py-4 text-sm text-foreground">
                        {memo.memoType || "-"}
                      </td>
                      {/* Attachment column */}
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-3">
                          {counts.image > 0 && (
                            <span className="inline-flex items-center gap-1 text-blue-600">
                              <PhotoIcon className="w-4 h-4" />
                              {counts.image}
                            </span>
                          )}
                          {counts.pdf > 0 && (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <DocumentIcon className="w-4 h-4" />
                              {counts.pdf}
                            </span>
                          )}
                          {counts.other > 0 && (
                            <span className="inline-flex items-center gap-1 text-gray-600">
                              <PaperClipIcon className="w-4 h-4" />
                              {counts.other}
                            </span>
                          )}
                          {(counts.image === 0 && counts.pdf === 0 && counts.other === 0) && (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(memo.memoDate)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1 text-muted-foreground hover:text-accent transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(memo)
                            }}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(memo.id)
                            }}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No memos found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedMemos.length > 0 && (
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
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedMemos.length)} of{" "}
                {sortedMemos.length}
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
        {paginatedMemos.length > 0 ? (
          paginatedMemos.map((memo) => {
            const counts = getFileTypeCounts(memo.files)
            const totalFiles = counts.image + counts.pdf + counts.other
            return (
              <div
                key={memo.id}
                className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200 cursor-pointer"
                onClick={() => handleRowClick(memo.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-foreground text-lg">
                      {memo.name && memo.name.length > 80
                        ? memo.name.slice(0, 80) + "..."
                        : memo.name || "-"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {memo.detail && memo.detail.length > 80
                        ? memo.detail.slice(0, 80) + "..."
                        : memo.detail || "-"}
                    </p>
                    {/* Memo Type */}
                    <p className="text-foreground text-sm font-medium">
                      {memo.memoType || "-"}
                    </p>
                    {/* Attachment icon and count (only if totalFiles > 0) */}
                    {totalFiles > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <PaperClipIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">{totalFiles}</span>
                      </div>
                    )}
                    {/* Updated At (smaller font) */}
                    <p className="text-muted-foreground text-xs mt-1">
                      Created: {formatDate(memo.memoDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(memo)
                      }}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(memo.id)
                      }}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground">No memos found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Memo Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Memo">
        <CreateMemoForm
          onSubmit={async (formData) => {
            await MemoService.instance.createNewMemo(formData)
            setIsCreateModalOpen(false)
            await refreshMemos()
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Update Memo Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Memo"
        maxWidth="sm"
      >
        {editId && (
          <UpdateMemoForm
            id={editMemoData.id ?? ""}
            name={editMemoData.name ?? ""}
            detail={editMemoData.detail ?? ""}
            memoType={editMemoData.memoType ?? ""}
            memoDate={editMemoData.memoDate ?? ""}
            updatedAt={editMemoData.updatedAt ?? ""}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateMemo}
          />
        )}
      </Modal>

      {/* Delete Memo Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Memo"
        maxWidth="sm"
      >
        {deleteId && (
          <CommonDeleteForm
            description={`Delete memo: "${memos.find(m => m.id === deleteId)?.name}"? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isSubmitting={isDeleting}
            error={deleteError}
          />
        )}
      </Modal>

      {/* Navigation loading overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 animate-spin text-accent" />
            <span className="text-lg text-accent font-semibold">Loading memo...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemoTable