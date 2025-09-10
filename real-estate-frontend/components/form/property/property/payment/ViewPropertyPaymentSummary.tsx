"use client"
import { useEffect, useState } from "react"
import { PropertyService } from "@/service/property/PropertyService"
import { PaymentService } from "@/service/payment/paymentService"
import { isLeft, isRight } from "@/implementation/Either"
import ResEntryPropertyDto from "@/domain/property/property/ResEntryPropertyDto"
import ResEntryPaymentDto from "@/domain/payment/response/ResEntryPaymentDto"
import ResEntryPaymentItemDto from "@/domain/payment/response/ResEntryPaymentItemDto"
import { useExpenseContext } from "@/context/store/ExpenseStore"
import { useExpenseTypeContext } from "@/context/store/ExpenseTypeStore"
import { Skeleton } from "@/components/ui/skeleton"

// Simple Pie Chart using SVG
const SimplePieChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulative = 0
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" className="mx-auto my-4">
      {data.map((d, idx) => {
        const startAngle = (cumulative / total) * 2 * Math.PI
        const endAngle = ((cumulative + d.value) / total) * 2 * Math.PI
        cumulative += d.value
        const x1 = 90 + 80 * Math.cos(startAngle)
        const y1 = 90 + 80 * Math.sin(startAngle)
        const x2 = 90 + 80 * Math.cos(endAngle)
        const y2 = 90 + 80 * Math.sin(endAngle)
        const largeArcFlag = d.value / total > 0.5 ? 1 : 0
        const color = `hsl(${(idx * 60) % 360}, 70%, 60%)`
        return (
          <path
            key={d.label}
            d={`M90,90 L${x1},${y1} A80,80 0 ${largeArcFlag},1 ${x2},${y2} Z`}
            fill={color}
            stroke="#fff"
            strokeWidth={2}
          >
            <title>{`${d.label}: ${d.value.toLocaleString()}`}</title>
          </path>
        )
      })}
      {/* Center text */}
      <text x="90" y="95" textAnchor="middle" fontSize="1.2em" fill="#333" fontWeight="bold">
        Total
      </text>
      <text x="90" y="115" textAnchor="middle" fontSize="1em" fill="#333">
        {total.toLocaleString()}
      </text>
    </svg>
  )
}

// Simple Bar Chart
const SimpleBarChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex gap-4 items-end h-40 mt-4 overflow-x-auto">
      {data.map((d, idx) => (
        <div key={d.label} className="flex flex-col items-center min-w-[48px]">
          <div
            className="bg-violet-400 rounded w-8 transition-all"
            style={{
              height: `${(d.value / maxValue) * 120 + 8}px`,
              minHeight: "8px",
              maxHeight: "120px",
            }}
            title={d.value.toLocaleString()}
          />
          <span className="text-xs mt-1 break-words text-center max-w-[48px]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

interface ViewPropertyPaymentSummaryProps {
  propertyId: string
}

const ViewPropertyPaymentSummary = ({ propertyId }: ViewPropertyPaymentSummaryProps) => {
  const [property, setProperty] = useState<ResEntryPropertyDto | null>(null)
  const [payments, setPayments] = useState<ResEntryPaymentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { expenses } = useExpenseContext()
  const { expenseTypes } = useExpenseTypeContext()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      const propResult = await PropertyService.instance.fetchPropertyById(propertyId)
      if (isRight(propResult)) {
        setProperty(propResult.value)
      }
      const payResult = await PaymentService.instance.fetchAllPaymentByPropertyId(propertyId)
      if (isRight(payResult) && Array.isArray(payResult.value)) {
        setPayments(payResult.value)
      } else if (isLeft(payResult)) {
        setError(payResult.value.message || "Failed to fetch payments")
      }
      setLoading(false)
    }
    if (propertyId) fetchData()
  }, [propertyId])

  // Group and sum by expense type for pie chart
  // 1. For each payment item, find its expense in expenseStore
  // 2. Get the expenseType from that expense
  // 3. Group by expenseType and sum total
  const expenseTypeTotals: Record<string, number> = {}
  payments.forEach(payment =>
    payment.items.forEach(item => {
      // Find expense in expenseStore
      const expenseObj = expenses.find(exp => exp.expense === item.expense)
      let typeLabel = "Other"
      if (expenseObj) {
        // Try to find expenseType by id
        const expenseTypeObj = expenseTypes.find(type => type.id === expenseObj.expenseType)
        if (expenseTypeObj) {
          typeLabel = expenseTypeObj.detail
        } else {
          // Try to match by name (detail)
          const fallbackType = expenseTypes.find(type => type.detail === item.expense)
          if (fallbackType) {
            typeLabel = fallbackType.detail
          } else {
            // Use expense name as label
            typeLabel = item.expense
          }
        }
      } else {
        // Try to match by name (detail)
        const fallbackType = expenseTypes.find(type => type.detail === item.expense)
        if (fallbackType) {
          typeLabel = fallbackType.detail
        } else {
          // Use expense name as label
          typeLabel = item.expense
        }
      }
      expenseTypeTotals[typeLabel] = (expenseTypeTotals[typeLabel] || 0) + item.total
    })
  )

  // Sum by expense name for bar chart
  const expenseTotals: Record<string, number> = {}
  payments.forEach(payment =>
    payment.items.forEach(item => {
      expenseTotals[item.expense] = (expenseTotals[item.expense] || 0) + item.total
    })
  )

  // Grand total
  const grandTotal = payments.reduce((sum, payment) => sum + (payment.totalAmount || 0), 0)
  const budget = property?.maximumBudget ? Number(property.maximumBudget) : undefined

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="bg-violet-100 rounded px-4 py-2 flex items-center gap-4 shadow w-fit">
          <span className="bg-violet-200 text-violet-700 rounded-full px-2 py-1 text-base font-bold">$</span>
          <span className="text-violet-900 text-base font-bold">Grand Total</span>
          <span className="text-violet-900 text-lg font-bold">
            ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        {budget !== undefined && (
          <div className="bg-green-100 rounded px-4 py-2 flex items-center gap-2 shadow w-fit">
            <span className="text-green-700 font-bold">Budget:</span>
            <span className="text-green-900 font-bold">${budget.toLocaleString()}</span>
            <span className="ml-2 text-xs text-green-700">
              Used: {((grandTotal / budget) * 100).toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Expense Type Pie Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Payments by Expense Type</h3>
        <SimplePieChart
          data={Object.entries(expenseTypeTotals).map(([label, value]) => ({
            label,
            value: Math.round(value),
          }))}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(expenseTypeTotals).map(([type, total]) => (
            <div key={type} className="bg-muted rounded p-3 flex justify-between items-center">
              <span className="font-medium">{type}</span>
              <span className="font-bold text-violet-700">${total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Bar Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Payments by Expense</h3>
        <SimpleBarChart
          data={Object.entries(expenseTotals).map(([label, value]) => ({
            label,
            value: Math.round(value),
          }))}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(expenseTotals).map(([expense, total]) => (
            <div key={expense} className="bg-muted rounded p-3 flex justify-between items-center">
              <span className="font-medium">{expense}</span>
              <span className="font-bold text-violet-700">${total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ViewPropertyPaymentSummary