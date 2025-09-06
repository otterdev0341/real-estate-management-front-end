"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SaleTable from "@/components/table/sale/SaleTable"
import Modal from "@/components/modal/Modal"
import CreateSaleForm from "@/components/form/sale/CreateSaleForm"
import { useSaleContext } from "@/context/store/SaleStore"

const page = () => {
  const [activeTab, setActiveTab] = useState("sales")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { refreshSales } = useSaleContext()

  const handleOpenCreate = () => setIsCreateModalOpen(true)
  const handleCloseCreate = () => setIsCreateModalOpen(false)
  const handleCreateSuccess = async () => {
    setIsCreateModalOpen(false)
    await refreshSales()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sale Management</h1>
            <p className="text-muted-foreground">
              Manage, review, and track all your property sales records efficiently.
            </p>
          </div>
          {/* Removed Create Sale button */}
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">Sales</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-1 lg:w-[150px]">
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SaleTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Sale Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        title="Create Sale"
        maxWidth="md"
      >
        <CreateSaleForm
          onSubmit={handleCreateSuccess}
          onCancel={handleCloseCreate}
        />
      </Modal>
    </div>
  )
}
export default page