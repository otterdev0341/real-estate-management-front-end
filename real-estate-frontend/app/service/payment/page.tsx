"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaymentTable from "@/components/table/payment/PaymentTable"


import { usePaymentContext } from "@/context/store/PaymentStore"
import Modal from "@/components/modal/Modal"
import CreatePaymentForm from "@/components/form/payment/CreatePaymentForm"

const page = () => {
  const [activeTab, setActiveTab] = useState("payments")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { refreshPayments } = usePaymentContext()

  const handleOpenCreate = () => setIsCreateModalOpen(true)
  const handleCloseCreate = () => setIsCreateModalOpen(false)
  const handleCreateSuccess = async () => {
    setIsCreateModalOpen(false)
    await refreshPayments()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
            <p className="text-muted-foreground">
              Manage, review, and track all your payment records efficiently.
            </p>
          </div>
          {/* Removed Create Payment button */}
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payments">Payments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-1 lg:w-[150px]">
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <PaymentTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Payment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        title="Create Payment"
        maxWidth="md"
      >
        <CreatePaymentForm
          onSubmit={handleCreateSuccess}
          onCancel={handleCloseCreate}
        />
      </Modal>
    </div>
  )
}
export default page