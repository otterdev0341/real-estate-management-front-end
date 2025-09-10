import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

import ResEntryPaymentDto from "@/domain/payment/response/ResEntryPaymentDto"
import ResEntryPaymentItemDto from "@/domain/payment/response/ResEntryPaymentItemDto"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { PaymentService } from "@/service/payment/paymentService"
import { isLeft, isRight } from "@/implementation/Either"
import formatDate from "@/utility/utility"

interface ViewPropertyPaymentTableProps {
  propertyId: string
}

const ViewPropertyPaymentTable = ({ propertyId }: ViewPropertyPaymentTableProps) => {
  const [payments, setPayments] = useState<ResEntryPaymentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      setError("")
      const result = await PaymentService.instance.fetchAllPaymentByPropertyId(propertyId)
      if (isRight(result) && Array.isArray(result.value)) {
        setPayments(result.value)
      } else if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch payments")
      } else {
        setError("Failed to fetch payments")
      }
      setLoading(false)
    }
    if (propertyId) fetchPayments()
  }, [propertyId])

  // Calculate grand total
  const grandTotal = payments.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0)

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!payments.length) {
    return <div className="text-muted-foreground">No payments found for this property.</div>
  }

  return (
    <div className="space-y-6">
      {/* Grand Total */}
      <div className="bg-violet-100 rounded px-4 py-2 flex items-center gap-4 shadow w-fit mb-2">
        <span className="bg-violet-200 text-violet-700 rounded-full px-2 py-1 text-base font-bold">$</span>
        <span className="text-violet-900 text-base font-bold">Grand Total</span>
        <span className="text-violet-900 text-lg font-bold">
          ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs font-normal ml-2">{payments.length} payment{payments.length > 1 ? "s" : ""}</span>
      </div>
      <Accordion type="multiple" className="w-full">
        {payments.map(payment => (
          <AccordionItem key={payment.id} value={payment.id}>
            <AccordionTrigger>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {payment.created ? formatDate(payment.created.toString()) : ""}
                  </span>
                  <span className="font-semibold text-foreground">Payment #{payment.id.slice(0, 6)}</span>
                  <span className="ml-2 text-muted-foreground">{payment.note}</span>
                  <button
                    type="button"
                    className="ml-2 p-1 rounded hover:bg-muted transition-colors"
                    title="View Payment"
                    onClick={e => {
                      e.stopPropagation()
                      router.push(`/service/payment/${payment.id}`)
                    }}
                  >
                    <Eye className="w-4 h-4 text-violet-700" />
                  </button>
                </div>
                <div className="mt-2 md:mt-0 text-sm font-bold text-violet-700">
                  Total: ${payment.totalAmount.toLocaleString()}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Expense</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.items.map((item: ResEntryPaymentItemDto) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="px-4 py-2 text-sm text-foreground">{item.expense}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.amount}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.price}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default ViewPropertyPaymentTable