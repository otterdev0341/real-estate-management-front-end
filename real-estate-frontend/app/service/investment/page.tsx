"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InvestmentTable from "@/components/table/investment/InvestmentTable"
import { useInvestmentContext } from "@/context/store/InvestmentStore"
import Modal from "@/components/modal/Modal"
import CreateInvestmentForm from "@/components/form/investment/CreateInvestmentForm"

const page = () => {
  const [activeTab, setActiveTab] = useState("investments")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { refreshInvestments } = useInvestmentContext()

  const handleOpenCreate = () => setIsCreateModalOpen(true)
  const handleCloseCreate = () => setIsCreateModalOpen(false)
  const handleCreateSuccess = async () => {
    setIsCreateModalOpen(false)
    await refreshInvestments()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Management</h1>
            <p className="text-muted-foreground">
              Manage, review, and track all your investment records efficiently.
            </p>
          </div>
          {/* Removed Create Investment button */}
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="investments">Investments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden md:grid w-full grid-cols-1 lg:w-[150px]">
            <TabsTrigger value="investments">Investments</TabsTrigger>
          </TabsList>

          <TabsContent value="investments">
            <InvestmentTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Investment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        title="Create Investment"
        maxWidth="md"
      >
        <CreateInvestmentForm
          onSubmit={handleCreateSuccess}
          onCancel={handleCloseCreate}
        />
      </Modal>
    </div>
  )
}
export default page