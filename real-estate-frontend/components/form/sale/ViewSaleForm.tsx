"use client"
import { useEffect, useState } from "react"
import ResEntrySaleDto from "@/domain/sale/ResEntrySaleDto"
import { SaleService } from "@/service/sale/SaleService"
import { isLeft } from "@/implementation/Either"
import formatDate from "@/utility/utility"
import { MoreVertical, Edit3, Trash2, Paperclip } from "lucide-react"
import Modal from "@/components/modal/Modal"
import UpdateSaleForm from "@/components/form/sale/UpdateSaleForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface ViewSaleFormProps {
  saleId: string
}

const ViewSaleForm = ({ saleId }: ViewSaleFormProps) => {
  const [sale, setSale] = useState<ResEntrySaleDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const router = useRouter()

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true)
      const result = await SaleService.instance.fetchBySaleId(saleId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch sale")
        setSale(null)
      } else {
        setSale(result.value)
      }
      setLoading(false)
    }
    fetchSale()
  }, [saleId])

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

  const handleUpdateSale = async () => {
    setIsEditModalOpen(false)
    setLoading(true)
    const result = await SaleService.instance.fetchBySaleId(saleId)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to fetch sale")
      setSale(null)
    } else {
      setSale(result.value)
    }
    setLoading(false)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")
    const result = await SaleService.instance.deleteSale(saleId)
    setIsDeleting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete sale")
      return
    }
    setIsDeleteModalOpen(false)
    setSale(null)
    router.push("/service/sale")
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
  if (!sale) return <div className="text-muted-foreground">Sale not found.</div>

  return (
    <div className="w-full">
      {/* Menu container */}
      <div className="relative w-full">
        <div className="absolute top-0 right-0 z-50">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center shadow-sm"
              aria-label="Sale actions"
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
                    Edit Sale
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
                <div className="text-sm font-semibold text-gray-600 mb-2">Property</div>
                <div className="text-xl font-bold text-gray-900">{sale.property}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Contact</div>
                <div className="text-base text-gray-800">{sale.contact}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Price</div>
                <div className="text-base text-gray-800">{sale.price?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Note</div>
                <div className="text-base text-gray-800">{sale.note}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Created By</div>
                <div className="text-base text-gray-800">{sale.createdBy}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Transaction Type</div>
                <div className="text-base text-gray-800">{sale.transactionType}</div>
              </div>
              <div>
                
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Created At</div>
                <div className="text-base text-gray-800">
                  {sale.saleDate ? formatDate(sale.saleDate.toISOString()) : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Updated At</div>
                <div className="text-base text-gray-800">
                  {sale.updatedAt ? formatDate(sale.updatedAt.toISOString()) : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Sale"
        maxWidth="md"
      >
        {sale && (
          <UpdateSaleForm
            saleId={sale.id}
            propertyId={sale.property}
            contactId={sale.contact}
            price={sale.price}
            note={sale.note}
            saleDate={sale.saleDate ? sale.saleDate.toString() : ""}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateSale}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Sale"
        maxWidth="sm"
      >
        <CommonDeleteForm
          description={`Delete sale: "${sale?.property}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isSubmitting={isDeleting}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default ViewSaleForm