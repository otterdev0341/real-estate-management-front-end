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
            <th className="px-4 py-2 text-right">ROI</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) =>
            inv.getItems().map((item) => {
              const percent = item.getPercent() ?? 0
              const roi = ((getProfit(propertyDetail) ?? 0) * percent) / 100
              return (
                <tr key={item.getId()} className="border-t">
                  <td className="px-4 py-2">{item.getContact()}</td>
                  <td className="px-4 py-2 text-right">{item.getAmount().toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{percent.toFixed(2)}</td>
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