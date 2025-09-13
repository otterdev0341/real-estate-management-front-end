import { useEffect, useState } from "react"
import { InvestmentService } from "@/service/investment/InvestmentService"
import { isRight } from "@/implementation/Either"
import ResEntryInvestmentDto from "@/domain/investment/response/ResEntryInvestmentDto"
import { getProfit, PropertyForcaseDto } from "./dto/PropertyForcaseDto";


export interface PropertyRoiProps {
    propertyId: string;
    propertyDetail: PropertyForcaseDto;
}

const PropertyRoi = ({ propertyId, propertyDetail }: PropertyRoiProps) => {
  const [investments, setInvestments] = useState<ResEntryInvestmentDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvestments = async () => {
      setLoading(true)
      const result = await InvestmentService.instance.fetchAllInvestmentByPropertyId(propertyId)
      if (isRight(result)) {
        setInvestments(result.value)
      }
      setLoading(false)
    }
    if (propertyId) fetchInvestments()
  }, [propertyId])

  if (loading) return <div>Loading...</div>
  if (!investments.length) return <div>No investment data found.</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-border rounded-lg">
        <thead>
          <tr className="bg-muted/40">
            <th className="px-4 py-2 text-left">Contact</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">Percent (%)</th>
            <th className="px-4 py-2 text-right">Profit</th>
            <th className="px-4 py-2 text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) =>
            inv.getItems().map((item) => {
              const percent = item.getPercent() ?? 0
              const profit = ((getProfit(propertyDetail) ?? 0) * percent) / 100
              const amount = item.getAmount() ?? 0
              // ROI = (profit / amount) * 100
              const roi = amount > 0 ? (profit / amount) * 100 : 0
              return (
                <tr key={item.getId()} className="border-t">
                  <td className="px-4 py-2">{item.getContact()}</td>
                  <td className="px-4 py-2 text-right">{amount.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{percent.toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2 text-right">{roi.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default PropertyRoi