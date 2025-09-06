import { useSaleContext } from "@/context/store/SaleStore"
import formatDate from "@/utility/utility"
import { Skeleton } from "@/components/ui/skeleton"
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import Modal from "@/components/modal/Modal"
import CreateSaleForm from "@/components/form/sale/CreateSaleForm"
import UpdateSaleForm from "@/components/form/sale/UpdateSaleForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { SaleService } from "@/service/sale/SaleService"
import { isLeft } from "@/implementation/Either"
import { useRouter } from "next/navigation"

const SaleTable = () => {
  const { sales, loading, refreshSales } = useSaleContext()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editSale, setEditSale] = useState<any | null>(null)
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleEdit = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId)
    if (sale) {
      setEditSale(sale)
      setEditId(saleId)
      setIsEditModalOpen(true)
    }
  }

  const handleDelete = (saleId: string) => {
    setDeleteId(saleId)
    setIsDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    setDeleteError("")
    const result = await SaleService.instance.deleteSale(deleteId)
    setIsDeleting(false)
    if (result && "isLeft" in result && isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete sale")
      return
    }
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    await refreshSales()
    await refreshSales() // Refresh twice to ensure consistency
  }

  const handleCloseCreate = () => setIsCreateModalOpen(false)
  const handleCloseEdit = () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditSale(null)
  }
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    setDeleteError("")
  }

  const handleOpenCreate = () => setIsCreateModalOpen(true)
  const handleCreateSuccess = async () => {
    setIsCreateModalOpen(false)
    await refreshSales()
  }
  const handleEditSuccess = async () => {
    setIsEditModalOpen(false)
    setEditId(null)
    setEditSale(null)
    await refreshSales()
  }

  // Handle row/card click to navigate to sale detail
  const handleRowClick = (saleId: string) => {
    setIsNavigating(true)
    setTimeout(() => {
      router.push(`/service/sale/${saleId}`)
    }, 400)
  }

  // Filter sales by search (property, contact, id)
  const filteredSales = sales.filter(sale => {
    const q = search.toLowerCase()
    return (
      sale.property?.toLowerCase().includes(q) ||
      sale.contact?.toLowerCase().includes(q) ||
      sale.id?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground mt-1">Manage your sales records</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Create Sale
        </button>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-sm">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by property, contact, or ID"
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card/60 backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Property</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Property of</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Purchase price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Updated At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-2/3" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/3" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8" /></td>
                  </tr>
                ))
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(sale.id)}
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {sale.id.slice(0, 6)}
                      {sale.files && sale.files.length > 0 && (
                        <span className="ml-2 text-xs text-accent bg-accent/10 px-2 py-1 rounded">
                          {sale.files.length} file{sale.files.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{sale.property}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{sale.contact}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{sale.price?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(sale.createdAt?.toString())}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(sale.updatedAt?.toString())}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        <button
                          className="p-2 rounded hover:bg-muted transition-colors"
                          title="Edit"
                          onClick={e => {
                            e.stopPropagation()
                            handleEdit(sale.id)
                          }}
                        >
                          <PencilIcon className="h-5 w-5 text-primary" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-muted transition-colors"
                          title="Delete"
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(sale.id)
                          }}
                        >
                          <TrashIcon className="h-5 w-5 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    No sales found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-card/60 border border-border rounded-xl p-4 shadow-lg">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))
        ) : filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-card/60 border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200 flex flex-col cursor-pointer"
              onClick={() => handleRowClick(sale.id)}
            >
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground text-lg">
                  {sale.property}
                </h3>
                <p className="text-muted-foreground text-sm">
                  Property of: <span className="font-medium text-foreground">{sale.contact}</span>
                </p>
                <p className="text-muted-foreground text-sm">
                  Purchase price: {sale.price?.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Created: {formatDate(sale.createdAt?.toString())}
                </p>
                <p className="text-muted-foreground text-xs">
                  Updated: {formatDate(sale.updatedAt?.toString())}
                </p>
              </div>
              {/* Action buttons at the bottom */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  className="p-1 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  onClick={e => {
                    e.stopPropagation()
                    handleEdit(sale.id)
                  }}
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  onClick={e => {
                    e.stopPropagation()
                    handleDelete(sale.id)
                  }}
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card/60 border border-border rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground">No sales found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Sale Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        title="Create Sale"
        maxWidth="md"
      >
        <CreateSaleForm
          onSubmit={handleCreateSuccess}
          onCancel={handleCloseCreate}
        />
      </Modal>

      {/* Edit Sale Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        title="Edit Sale"
        maxWidth="md"
      >
        {editSale && (
          <UpdateSaleForm
            saleId={editSale.id}
            propertyId={editSale.propertyId || ""}
            contactId={editSale.contactId || ""}
            price={editSale.price}
            note={editSale.note || ""}
            createdAt={editSale.createdAt ? editSale.createdAt.toString() : ""}
            onCancel={handleCloseEdit}
            onSuccess={handleEditSuccess}
          />
        )}
      </Modal>

      {/* Delete Sale Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Sale"
        maxWidth="sm"
      >
        {deleteId && (
          <CommonDeleteForm
            description={`Delete sale: "${sales.find(s => s.id === deleteId)?.property}"? This action cannot be undone.`}
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
            <span className="text-lg text-accent font-semibold">Loading sale...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SaleTable