import { useEffect, useState } from "react"
import { InvestmentService } from "@/service/investment/InvestmentService"
import { isLeft, isRight } from "@/implementation/Either"
import ResEntryInvestmentDto from "@/domain/investment/response/ResEntryInvestmentDto"
import ResEntryInvestmentItemDto from "@/domain/investment/response/ResEntryInvestmentItemDto"
import { Skeleton } from "@/components/ui/skeleton"

interface ViewPropertyInvestmentSummaryProps {
  propertyId: string
}

// Simple Pie Chart using SVG
const SimplePieChart = ({ data }: { data: { label: string; value: number; percent: number }[] }) => {
  const totalPercent = data.reduce((sum, d) => sum + d.percent, 0)
  let cumulative = 0
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" className="mx-auto my-4">
      {data.map((d, idx) => {
        const startAngle = (cumulative / 100) * 2 * Math.PI
        const endAngle = ((cumulative + d.percent) / 100) * 2 * Math.PI
        cumulative += d.percent
        const x1 = 90 + 80 * Math.cos(startAngle)
        const y1 = 90 + 80 * Math.sin(startAngle)
        const x2 = 90 + 80 * Math.cos(endAngle)
        const y2 = 90 + 80 * Math.sin(endAngle)
        const largeArcFlag = d.percent > 50 ? 1 : 0
        const color = `hsl(${(idx * 60) % 360}, 70%, 60%)`
        return (
          <path
            key={d.label}
            d={`M90,90 L${x1},${y1} A80,80 0 ${largeArcFlag},1 ${x2},${y2} Z`}
            fill={color}
            stroke="#fff"
            strokeWidth={2}
          >
            <title>{`${d.label}: ${d.value.toLocaleString()} (${d.percent.toFixed(2)}%)`}</title>
          </path>
        )
      })}
      {/* Center text */}
      <text x="90" y="95" textAnchor="middle" fontSize="1.2em" fill="#333" fontWeight="bold">
        Total
      </text>
      <text x="90" y="115" textAnchor="middle" fontSize="1em" fill="#333">
        {totalPercent.toFixed(2)}%
      </text>
    </svg>
  )
}

const ViewPropertyInvestmentSummary = ({ propertyId }: ViewPropertyInvestmentSummaryProps) => {
  const [investments, setInvestments] = useState<ResEntryInvestmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  // Aggregate investment amount and percent by contact using percent from service
  const contactMap: Record<string, { value: number; percent: number }> = {}
  investments.forEach(investment =>
    investment.getItems().forEach(item => {
      const contact = item.getContact()
      if (!contactMap[contact]) {
        contactMap[contact] = { value: 0, percent: 0 }
      }
      contactMap[contact].value += item.getAmount()
      contactMap[contact].percent += item.getPercent()
    })
  )

  const grandTotal = Object.values(contactMap).reduce((sum, v) => sum + v.value, 0)

  // Prepare data for pie chart using percent from service
  const pieData = Object.entries(contactMap).map(([label, { value, percent }]) => ({
    label,
    value,
    percent,
  }))

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!pieData.length) {
    return <div className="text-muted-foreground">No investments found for this property.</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-violet-100 rounded px-4 py-2 flex items-center gap-4 shadow w-fit mb-2">
        <span className="bg-violet-200 text-violet-700 rounded-full px-2 py-1 text-base font-bold">$</span>
        <span className="text-violet-900 text-base font-bold">Grand Total</span>
        <span className="text-violet-900 text-lg font-bold">
          ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Investment Distribution by Contact</h3>
        <SimplePieChart data={pieData} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {pieData.map(({ label, value, percent }) => (
            <div key={label} className="bg-muted rounded p-3 flex justify-between items-center">
              <span className="font-medium">{label}</span>
              <span className="font-bold text-violet-700">
                ${value.toLocaleString()} ({percent.toFixed(2)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ViewPropertyInvestmentSummary