import ChangeUserInfoForm from "@/components/form/ChangeUserInfoForm"
import { RealEstateDescription } from "@/components/real-estate/RealEstateDescription"

const page = () => {
  return (
    <div className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row items-center justify-center min-h-screen gap-8">
            {/* RegisterForm: first on mobile, second on desktop */}
            <div className="w-full max-w-md px-4 order-1 md:order-2">
              <ChangeUserInfoForm />
            </div>
          </div>
        </div>
  )
}
export default page