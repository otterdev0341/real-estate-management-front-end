import MapDisplay from "@/components/dashboard/mapSection/MapDisplay"
import MemoWidget from "@/components/dashboard/memo/MemoWidget"
import PaymentWidget from "@/components/dashboard/payment/paymentWidget"
import PropertyStatusWidget from "@/components/dashboard/property/PropertyStatusWidget"

const page = () => {
  return (
    <>
      <div className="mt-6 mb-6 flex">
        <MapDisplay />
      </div>
      {/* Responsive layout: column on mobile/tablet, row on desktop */}
      <div className="mt-6 flex flex-col md:flex-row gap-6 w-full">
        <div className="w-full md:w-[38%]">
          <PaymentWidget />
        </div>
        <div className="w-full md:w-[38%]">
          <MemoWidget />
        </div>
        <div className="w-full md:w-[24%]">
          <PropertyStatusWidget />
        </div>
      </div>
    </>
  )
}
export default page