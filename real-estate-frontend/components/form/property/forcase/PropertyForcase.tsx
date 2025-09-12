import { useEffect, useState } from "react"
import {
  PropertyForcaseDto,
  getTotalExpense,
  getBudgetUsedPercent,
  getProfit,
} from "./dto/PropertyForcaseDto"
import { PropertyService } from "@/service/property/PropertyService"
import { PaymentService } from "@/service/payment/paymentService"
import { isLeft, isRight } from "@/implementation/Either"
import ForcaseForm from "./ForcaseForm"
import PropertyRoi from "./PropertyRoi"

export interface PropertyForcaseProps {
  propertyId: string;
}

const PropertyForcase = ({ propertyId }: PropertyForcaseProps) => {
  const [propertyForcase, setPropertyForcase] = useState<PropertyForcaseDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const propertyResult = await PropertyService.instance.fetchPropertyById(propertyId)
      if (isLeft(propertyResult)) {
        setLoading(false)
        return
      }
      const property = propertyResult.value

      const paymentResult = await PaymentService.instance.fetchAllPaymentByPropertyId(propertyId)
      let totalExpense = 0
      if (isRight(paymentResult)) {
        const payments = paymentResult.value
        totalExpense = payments.reduce((sum, payment) => {
          if (Array.isArray(payment.items)) {
            return sum + payment.items.reduce((itemSum, item) => itemSum + (item.total ?? 0), 0)
          }
          return sum
        }, 0)
      }

      const dto: PropertyForcaseDto = {
        propertyId: property.id,
        propertyName: property.name,
        fsp: Number(property.fsp) ?? 0,
        newFsp: 0,
        currentExpense: totalExpense,
        additionalExpense: 0,
        budget: Number(property.budget) ?? 0,
      }
      setPropertyForcase(dto)
      setLoading(false)
    }

    if (propertyId) {
      fetchData()
    }
  }, [propertyId])

  // Handler for controlled fields
  const handleChange = (field: keyof PropertyForcaseDto, value: number) => {
    if (!propertyForcase) return
    setPropertyForcase({ ...propertyForcase, [field]: value })
  }

  if (loading) return <div>Loading...</div>
  if (!propertyForcase) return <div>No data found.</div>

  return (
    <div>
      <ForcaseForm
        data={propertyForcase}
        onChange={handleChange}
      />
      <div className="mt-2">
        <PropertyRoi propertyId={propertyId} propertyDetail={propertyForcase} />
      </div>
    </div>
  )
}

export default PropertyForcase