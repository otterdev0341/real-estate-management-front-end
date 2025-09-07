import { usePaymentContext } from "@/context/store/PaymentStore"
import formatDate from "@/utility/utility"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import Modal from "@/components/modal/Modal"
import CreatePaymentForm from "@/components/form/payment/CreatePaymentForm"

const PaymentTable = () => {
  const { payments, loading, refreshPayments } = usePaymentContext()
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleOpenCreate = () => setIsCreateModalOpen(true)
  const handleCloseCreate = () => setIsCreateModalOpen(false)
  const handleCreateSuccess = async () => {
    setIsCreateModalOpen(false)
    await refreshPayments()
  }

  // Filter payments by search (property, contact, id)
  const filteredPayments = payments.filter(payment => {
    const q = search.toLowerCase()
    return (
      payment.property?.toLowerCase().includes(q) ||
      payment.contact?.toLowerCase().includes(q) ||
      payment.id?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your payment records</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Create Payment
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Note</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-2/3" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/3" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                  </tr>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground">{payment.id.slice(0, 6)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{payment.property}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{payment.contact || "-"}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {payment.note.length > 20
                        ? payment.note.slice(0, 20) + "..."
                        : payment.note}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{payment.totalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(payment.created?.toString())}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    No payments found.
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
            </div>
          ))
        ) : filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-card/60 border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200 flex flex-col cursor-pointer"
            >
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground text-lg">
                  {payment.property}
                </h3>
                <p className="text-muted-foreground text-sm">
                  Contact: <span className="font-medium text-foreground">{payment.contact}</span>
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Created: {formatDate(payment.created?.toString())}
                </p>
                <p className="text-muted-foreground text-xs">
                  Total: {payment.totalAmount?.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card/60 border border-border rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground">No payments found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        title="Create Payment"
        maxWidth="md"
      >
        <CreatePaymentForm
          onSubmit={handleCreateSuccess}
          onCancel={handleCloseCreate}
        />
      </Modal>
    </div>
  )
}

export default PaymentTable