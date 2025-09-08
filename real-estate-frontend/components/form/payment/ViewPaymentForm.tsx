"use client"
import { useEffect, useState } from "react"
import ResEntryPaymentDto from "@/domain/payment/response/ResEntryPaymentDto"
import { PaymentService } from "@/service/payment/paymentService"
import { isLeft } from "@/implementation/Either"
import formatDate from "@/utility/utility"
import { MoreVertical, Edit3, Trash2 } from "lucide-react"
import Modal from "@/components/modal/Modal"
import UpdatePaymentForm from "@/components/form/payment/UpdatePaymentForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface ViewPaymentFormProps {
  paymentId: string
}

const ViewPaymentForm = ({ paymentId }: ViewPaymentFormProps) => {
  const [payment, setPayment] = useState<ResEntryPaymentDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const router = useRouter()

  // Fetch payment data
  useEffect(() => {
    const fetchPayment = async () => {
      setLoading(true)
      const result = await PaymentService.instance.fetchByPaymentId(paymentId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch payment")
        setPayment(null)
      } else {
        setPayment(result.value)
      }
      setLoading(false)
    }
    fetchPayment()
  }, [paymentId])

  // Edit handlers
  const handleEdit = () => {
    setIsEditModalOpen(true)
    setMenuOpen(false)
  }
  const handleCancelEdit = () => setIsEditModalOpen(false)
  const handleUpdatePayment = async () => {
    setIsEditModalOpen(false)
    setLoading(true)
    const result = await PaymentService.instance.fetchByPaymentId(paymentId)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to fetch payment")
      setPayment(null)
    } else {
      setPayment(result.value)
    }
    setLoading(false)
  }

  // Delete handlers
  const handleDelete = () => {
    setIsDeleteModalOpen(true)
    setMenuOpen(false)
  }
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteError("")
  }
  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")
    const result = await PaymentService.instance.deletePayment(paymentId)
    setIsDeleting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete payment")
      return
    }
    setIsDeleteModalOpen(false)
    setPayment(null)
    router.push("/service/payment")
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
  if (!payment) return <div className="text-muted-foreground">Payment not found.</div>

  return (
    <div className="w-full">
      {/* Menu container */}
      <div className="relative w-full">
        <div className="absolute top-0 right-0 z-50">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center shadow-sm"
              aria-label="Payment actions"
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
                    Edit Payment
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
                <div className="text-xl font-bold text-gray-900">{payment.property}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Contact</div>
                <div className="text-base text-gray-800">{payment.contact}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Note</div>
                <div className="text-base text-gray-800">{payment.note}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Transaction Type</div>
                <div className="text-base text-gray-800">{payment.transaction}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Total Amount</div>
                <div className="text-base text-gray-800">{payment.totalAmount?.toLocaleString()}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Created At</div>
                <div className="text-base text-gray-800">
                  {payment.created ? formatDate(payment.created.toISOString()) : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Updated At</div>
                <div className="text-base text-gray-800">
                  {payment.updated ? formatDate(payment.updated.toISOString()) : "-"}
                </div>
              </div>
            </div>
          </div>
          {/* Payment Items Table */}
          <div className="mt-8">
            <div className="text-lg font-bold mb-2">Payment Items</div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Expense</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Quantity</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.items.map(item => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="px-4 py-2 text-sm text-foreground">{item.expense}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.amount}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.price?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-right font-semibold">{item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Payment"
        maxWidth="md"
      >
        {payment && (
          <UpdatePaymentForm
            payment={payment}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdatePayment}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Payment"
        maxWidth="sm"
      >
        <CommonDeleteForm
          description={`Delete payment for property: "${payment?.property}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isSubmitting={isDeleting}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default ViewPaymentForm