import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

import ResEntryInvestmentDto from "@/domain/investment/response/ResEntryInvestmentDto"
import ResEntryInvestmentItemDto from "@/domain/investment/response/ResEntryInvestmentItemDto"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { InvestmentService } from "@/service/investment/InvestmentService"
import { isLeft, isRight } from "@/implementation/Either"
import formatDate from "@/utility/utility"

interface ViewPropertyInvestmentTableProps {
  propertyId: string
}

const ViewPropertyInvestmentTable = ({ propertyId }: ViewPropertyInvestmentTableProps) => {
  const [investments, setInvestments] = useState<ResEntryInvestmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchInvestments = async () => {
      setLoading(true)
      setError("")
      const result = await InvestmentService.instance.fetchAllInvestmentByPropertyId(propertyId)
      if (isRight(result) && Array.isArray(result.value)) {
        setInvestments(result.value)
      } else if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch investments")
      } else {
        setError("Failed to fetch investments")
      }
      setLoading(false)
    }
    if (propertyId) fetchInvestments()
  }, [propertyId])

  // Calculate grand total
  const grandTotal = investments.reduce((sum, investment) => sum + (investment.getTotalInvestedAmount() || 0), 0)

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

  if (!investments.length) {
    return <div className="text-muted-foreground">No investments found for this property.</div>
  }

  return (
    <div className="space-y-6">
      {/* Grand Total */}
      <div className="bg-violet-100 rounded px-4 py-2 flex flex-wrap items-center gap-4 shadow w-fit mb-2">
        <span className="bg-violet-200 text-violet-700 rounded-full px-2 py-1 text-base font-bold">$</span>
        <span className="text-violet-900 text-base font-bold">Grand Total</span>
        <span className="text-violet-900 text-lg font-bold">
          ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs font-normal ml-2">{investments.length} investment{investments.length > 1 ? "s" : ""}</span>
      </div>
      <Accordion type="multiple" className="w-full">
        {investments.map(investment => (
          <AccordionItem key={investment.getId()} value={investment.getId()}>
            <AccordionTrigger>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {investment.getCreatedAt() ? formatDate(investment.getCreatedAt().toString()) : ""}
                  </span>
                  <span className="font-semibold text-foreground">Investment #{investment.getId().slice(0, 6)}</span>
                  <span className="ml-2 text-muted-foreground">{investment.getNote()}</span>
                  <button
                    type="button"
                    className="ml-2 p-1 rounded hover:bg-muted transition-colors"
                    title="View Investment"
                    onClick={e => {
                      e.stopPropagation()
                      router.push(`/service/investment/${investment.getId()}`)
                    }}
                  >
                    <Eye className="w-4 h-4 text-violet-700" />
                  </button>
                </div>
                <div className="mt-2 md:mt-0 text-sm font-bold text-violet-700">
                  Total: ${investment.getTotalInvestedAmount().toLocaleString()}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Responsive Table/Card */}
              <div className="overflow-x-auto mt-2 hidden md:block">
                <table className="min-w-full border border-border rounded-lg">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Contact</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Percent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investment.getItems().map((item: ResEntryInvestmentItemDto) => (
                      <tr key={item.getId()} className="border-b border-border">
                        <td className="px-4 py-2 text-sm text-foreground">{item.getContact()}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.getAmount()}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.getPercent()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View */}
              <div className="md:hidden mt-2 space-y-2">
                {investment.getItems().map((item: ResEntryInvestmentItemDto) => (
                  <div key={item.getId()} className="bg-muted rounded p-3 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Contact:</span>
                      <span>{item.getContact()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span>${item.getAmount()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Percent:</span>
                      <span>{item.getPercent()}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default ViewPropertyInvestmentTable