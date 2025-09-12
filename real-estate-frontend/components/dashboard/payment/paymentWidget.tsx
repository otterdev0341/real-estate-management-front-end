"use client"

import { usePaymentContext } from "@/context/store/PaymentStore"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

const ITEM_HEIGHT = 110 // px, adjust if your card height changes

const PaymentWidget = () => {
  const { payments, loading } = usePaymentContext()
  const router = useRouter()

  // Sort payments by latest paymentDate
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
  }, [payments])

  return (
    <div className="bg-card/80 border border-border rounded-xl shadow-xl p-4 w-full flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-foreground">Payments</h2>
      <div
        className="overflow-y-auto flex flex-col gap-3 scrollbar-hide"
        style={{
          maxHeight: `${ITEM_HEIGHT * 3 + 16}px`, // 3 items + gap
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {loading ? (
          <div className="text-muted-foreground text-center py-8">Loading payments...</div>
        ) : sortedPayments.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No payments found.</div>
        ) : (
          sortedPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-background border border-border rounded-lg shadow p-4 flex flex-col gap-2 relative"
              style={{ minHeight: `${ITEM_HEIGHT}px` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {payment.id.slice(0, 6)}
                  </span>
                </div>
                <button
                  className="p-1 rounded hover:bg-muted transition"
                  title="View Payment"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/service/payment/${payment.id}`)
                  }}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="font-bold text-lg text-foreground">{payment.property}</div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>
                  <span className="font-semibold">Contact:</span> {payment.contact}
                </span>
                <span>
                  <span className="font-semibold">Total:</span> {payment.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-xs px-2 py-1 rounded  text-blue-700 mt-1">
                {payment.paymentDate.toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PaymentWidget
