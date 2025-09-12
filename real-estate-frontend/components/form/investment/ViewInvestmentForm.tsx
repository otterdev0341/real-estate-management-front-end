"use client"
import { useEffect, useState } from "react"
import ResEntryInvestmentDto from "@/domain/investment/response/ResEntryInvestmentDto"
import { InvestmentService } from "@/service/investment/InvestmentService"
import { isLeft } from "@/implementation/Either"
import formatDate from "@/utility/utility"
import { MoreVertical, Edit3, Trash2, Eye } from "lucide-react"
import Modal from "@/components/modal/Modal"
import UpdateInvestmentForm from "@/components/form/investment/UpdateInvestmentForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { usePropertyContext } from "@/context/store/PropertyStore"

interface ViewInvestmentFormProps {
  investmentId: string
}

const ViewInvestmentForm = ({ investmentId }: ViewInvestmentFormProps) => {
  const [investment, setInvestment] = useState<ResEntryInvestmentDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const router = useRouter()
  const { properties } = usePropertyContext()

  // Fetch investment data
  useEffect(() => {
    const fetchInvestment = async () => {
      setLoading(true)
      const result = await InvestmentService.instance.fetchByInvestmentId(investmentId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch investment")
        setInvestment(null)
      } else {
        setInvestment(result.value)
      }
      setLoading(false)
    }
    fetchInvestment()
  }, [investmentId])

  // Edit handlers
  const handleEdit = () => {
    setIsEditModalOpen(true)
    setMenuOpen(false)
  }
  const handleCancelEdit = () => setIsEditModalOpen(false)
  const handleUpdateInvestment = async () => {
    setIsEditModalOpen(false)
    setLoading(true)
    const result = await InvestmentService.instance.fetchByInvestmentId(investmentId)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to fetch investment")
      setInvestment(null)
    } else {
      setInvestment(result.value)
    }
    setLoading(false)
  }

  // Delete handlers
  const handleDelete = () => {
    setIsDeleteModalOpen(true)
    setMenuOpen(false)
  }
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteError("")
  }
  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")
    const result = await InvestmentService.instance.deleteInvestment(investmentId)
    setIsDeleting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete investment")
      return
    }
    setIsDeleteModalOpen(false)
    setInvestment(null)
    router.push("/service/investment")
  }

  // Helper to get propertyId from property name
  const getPropertyId = () => {
    if (!investment) return ""
    const propertyName = investment.getProperty()
    const property = properties.find(p => p.name === propertyName)
    return property ? property.id : propertyName
  }

  if (loading) return (
    <div className="w-full">
      <Skeleton className="h-8 w-1/2 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-20 w-full mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-6 w-1/3 mt-2" />
    </div>
  )
  if (error) return <div className="text-red-500">{error}</div>
  if (!investment) return <div className="text-muted-foreground">Investment not found.</div>

  return (
    <div className="w-full">
      {/* Menu container */}
      <div className="relative w-full">
        <div className="absolute top-0 right-0 z-50">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center shadow-sm"
              aria-label="Investment actions"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-700 hover:bg-blue-50 transition-colors border-b border-gray-100"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Investment
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Main content */}
        <div className="pr-16 min-h-[200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Property</div>
                <div className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {investment.getProperty()}
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="View Property"
                    onClick={() => router.push(`/service/property/${getPropertyId()}`)}
                  >
                    <Eye className="w-5 h-5 text-violet-700" />
                  </button>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Note</div>
                <div className="text-base text-gray-800">{investment.getNote()}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Transaction</div>
                <div className="text-base text-gray-800">{investment.getTransaction()}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Total Invested</div>
                <div className="text-base text-gray-800">{investment.getTotalInvestedAmount()?.toLocaleString()}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Created At</div>
                <div className="text-base text-gray-800">
                  {investment.getInvestmentDate() ? formatDate(investment.getInvestmentDate().toISOString()) : "-"}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Updated At</div>
                <div className="text-base text-gray-800">
                  {investment.getUpdatedAt() ? formatDate(investment.getUpdatedAt().toISOString()) : "-"}
                </div>
              </div>
            </div>
          </div>
          {/* Investment Items Table */}
          <div className="mt-8">
            <div className="text-lg font-bold mb-2">Investment Items</div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground">Contact</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground">Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {investment.getItems().map(item => (
                    <tr key={item.getId()} className="border-b border-border">
                      <td className="px-4 py-2 text-sm text-foreground">{item.getContact()}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.getAmount()}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.getPercent()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Investment"
        maxWidth="md"
      >
        {investment && (
          <UpdateInvestmentForm
            investment={investment}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateInvestment}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Investment"
        maxWidth="sm"
      >
        <CommonDeleteForm
          description={`Delete investment for property: "${investment?.getProperty()}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isSubmitting={isDeleting}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default ViewInvestmentForm