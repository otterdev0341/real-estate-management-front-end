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

interface MemoType {
  id: string
  detail: string
  createdAt: string
  updatedAt: string
}

const mockMemoTypes: MemoType[] = [
  {
    id: "MT001",
    detail: "General Note",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "MT002",
    detail: "Legal Memo",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-16",
  },
  {
    id: "MT003",
    detail: "Finance Memo",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-17",
  },
  {
    id: "MT004",
    detail: "Maintenance Memo",
    createdAt: "2024-01-04",
    updatedAt: "2024-01-18",
  },
]

const MemoTypeTable = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof MemoType>("detail")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredMemoTypes = mockMemoTypes.filter((type) =>
    type.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedMemoTypes = [...filteredMemoTypes].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedMemoTypes.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedMemoTypes = sortedMemoTypes.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (column: keyof MemoType) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCreateMemoType = (memoTypeData: { detail: string }) => {
    // Add logic to update your data here
    console.log("Creating new memo type:", memoTypeData)
    setIsCreateModalOpen(false)
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
                {[
                  { key: "id", label: "ID" },
                  { key: "detail", label: "Detail" },
                  { key: "createdAt", label: "Created At" },
                  { key: "updatedAt", label: "Updated At" },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof MemoType)}
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
              {paginatedMemoTypes.length > 0 ? (
                paginatedMemoTypes.map((type, index) => (
                  <tr
                    key={type.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{type.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{type.detail}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{type.createdAt}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{type.updatedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-muted-foreground hover:text-accent transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-destructive transition-colors">
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
                      {type.id}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">Created: {type.createdAt}</p>
                  <p className="text-muted-foreground text-sm">Updated: {type.updatedAt}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
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
    </div>
  )
}

export default MemoTypeTable