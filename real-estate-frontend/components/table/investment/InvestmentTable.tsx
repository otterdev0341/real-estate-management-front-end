import { useInvestmentContext } from "@/context/store/InvestmentStore"
import formatDate from "@/utility/utility"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline"
import Modal from "@/components/modal/Modal"
import CreateInvestmentForm from "@/components/form/investment/CreateInvestmentForm"
import UpdateInvestmentForm from "@/components/form/investment/UpdateInvestmentForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { useRouter } from "next/navigation"
import { InvestmentService } from "@/service/investment/InvestmentService"
import { isLeft } from "@/implementation/Either"

const InvestmentTable = () => {
  const { investments, loading, refreshInvestments } = useInvestmentContext()
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updateId, setUpdateId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const router = useRouter()

  const handleOpenCreate = () => setIsCreateModalOpen(true)
  const handleCloseCreate = () => setIsCreateModalOpen(false)
  const handleCreateSuccess = async () => {
    setIsCreateModalOpen(false)
    await refreshInvestments()
  }

  const handleOpenUpdate = (id: string) => setUpdateId(id)
  const handleCloseUpdate = () => setUpdateId(null)
  const handleUpdateSuccess = async () => {
    setUpdateId(null)
    await refreshInvestments()
  }

  const handleOpenDelete = (id: string) => {
    setDeleteId(id)
    setDeleteError("")
  }
  const handleCloseDelete = () => {
    setDeleteId(null)
    setDeleteError("")
    setIsDeleting(false)
  }
  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    setDeleteError("")
    const result = await InvestmentService.instance.deleteInvestment(deleteId)
    setIsDeleting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete investment")
      return
    }
    setDeleteId(null)
    await refreshInvestments()
  }

  // Filter investments by search (property, note, id)
  const filteredInvestments = investments.filter(investment => {
    const q = search.toLowerCase()
    return (
      investment.getProperty()?.toLowerCase().includes(q) ||
      investment.getNote()?.toLowerCase().includes(q) ||
      investment.getId()?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investments</h1>
          <p className="text-muted-foreground mt-1">Manage your investment records</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Create Investment
        </button>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-sm">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by property, note, or ID"
          className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card/60 backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Property</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Note</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Investment capital</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Investors</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-2/3" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/3" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/3" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-1/2" /></td>
                  </tr>
                ))
              ) : filteredInvestments.length > 0 ? (
                filteredInvestments.map((investment) => (
                  <tr
                    key={investment.getId()}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/service/investment/${investment.getId()}`)}
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground">{investment.getId().slice(0, 6)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{investment.getProperty()}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {investment.getNote().length > 20
                        ? investment.getNote().slice(0, 20) + "..."
                        : investment.getNote()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{investment.getTotalInvestedAmount()?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{investment.getInvestorCount()}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(investment.getInvestmentDate()?.toString())}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        type="button"
                        className="p-2 rounded hover:bg-muted transition-colors"
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenUpdate(investment.getId())
                        }}
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5 text-primary" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded hover:bg-muted transition-colors"
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenDelete(investment.getId())
                        }}
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5 text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    No investments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-card/60 border border-border rounded-xl p-4 shadow-lg">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
            </div>
          ))
        ) : filteredInvestments.length > 0 ? (
          filteredInvestments.map((investment) => (
            <div
              key={investment.getId()}
              className="bg-card/60 border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200 flex flex-col cursor-pointer"
              onClick={() => router.push(`/service/investment/${investment.getId()}`)}
            >
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground text-lg">
                  {investment.getProperty()}
                </h3>
                <p className="text-muted-foreground text-sm">
                  Note: <span className="font-medium text-foreground">{investment.getNote()}</span>
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Created: {formatDate(investment.getInvestmentDate()?.toString())}
                </p>
                <p className="text-muted-foreground text-xs">
                  Investment capital: {investment.getTotalInvestedAmount()?.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  className="p-2 rounded hover:bg-muted transition-colors"
                  onClick={e => {
                    e.stopPropagation()
                    handleOpenUpdate(investment.getId())
                  }}
                  title="Edit"
                >
                  <PencilSquareIcon className="w-5 h-5 text-accent" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-muted transition-colors"
                  onClick={e => {
                    e.stopPropagation()
                    handleOpenDelete(investment.getId())
                  }}
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5 text-destructive" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card/60 border border-border rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground">No investments found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
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

      {/* Update Investment Modal */}
      <Modal
        isOpen={!!updateId}
        onClose={handleCloseUpdate}
        title="Update Investment"
        maxWidth="md"
      >
        {updateId && (
          <UpdateInvestmentForm
            investment={investments.find(i => i.getId() === updateId)!}
            onCancel={handleCloseUpdate}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </Modal>

      {/* Delete Investment Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={handleCloseDelete}
        title="Delete Investment"
        maxWidth="sm"
      >
        <CommonDeleteForm
          description={`Are you sure you want to delete this investment? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDelete}
          isSubmitting={isDeleting}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default InvestmentTable