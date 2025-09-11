import ViewUserInfoForm from "@/components/form/user/ViewUserInfoForm"

const page = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-foreground">User Information</h1>
      <ViewUserInfoForm />
    </div>
  )
}
export default page