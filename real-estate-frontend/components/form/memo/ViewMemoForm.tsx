"use client"
import { useEffect, useState } from "react"
import ResEntryMemoDto from "@/domain/memo/ResEntryMemoDto"
import { MemoService } from "@/service/memo/MemoService"
import { isLeft } from "@/implementation/Either"
import { MoreVertical, Edit3, Trash2, Tag } from "lucide-react"
import formatDate from "@/utility/utility"
import Modal from "@/components/modal/Modal"
import UpdateMemoForm from "@/components/form/memo/UpdateMemoForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface ViewMemoFormProps {
  memoId: string
}

const ViewMemoForm = ({ memoId }: ViewMemoFormProps) => {
  const [memo, setMemo] = useState<ResEntryMemoDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const memoIdParam = typeof memoId === "string" ? memoId : ""
  const router = useRouter()

  useEffect(() => {
    const fetchMemo = async () => {
      setLoading(true)
      const result = await MemoService.instance.fetchMemoById(memoId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch memo")
        setMemo(null)
      } else {
        setMemo(result.value)
      }
      setLoading(false)
    }
    fetchMemo()
  }, [memoId])

  const handleEdit = () => {
    setIsEditModalOpen(true)
    setMenuOpen(false)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
    setMenuOpen(false)
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
  }

  const handleUpdateMemo = async () => {
    // Refresh memo after update
    setIsEditModalOpen(false)
    setLoading(true)
    const result = await MemoService.instance.fetchMemoById(memoId)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to fetch memo")
      setMemo(null)
    } else {
      setMemo(result.value)
    }
    setLoading(false)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setDeleteError("")
    const result = await MemoService.instance.deleteMemo(memoId)
    setIsDeleting(false)
    if (isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete memo")
      return
    }
    setIsDeleteModalOpen(false)
    setMemo(null)
    // Redirect to memo list after successful delete
    router.push("/service/memo")
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteError("")
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
  if (!memo) return <div className="text-muted-foreground">Memo not found.</div>

  return (
    <div className="w-full">
      {/* Menu container with proper isolation */}
      <div className="relative w-full">
        <div className="absolute top-0 right-0 z-50">
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center shadow-sm"
              aria-label="Memo actions"
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
                    Edit Memo
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
        {/* Main content with proper spacing to avoid menu overlap */}
        <div className="pr-16 min-h-[200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Memo Name</div>
                <div className="text-xl font-bold text-gray-900">{memo.name}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Detail</div>
                <div className="text-base text-gray-800 leading-relaxed">{memo.detail}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-2">Memo Type</div>
                <div className="flex items-center gap-2 text-base text-gray-800">
                  <Tag className="w-5 h-5 text-gray-500" />
                  {memo.memoType}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Created:</span>
              <span>{formatDate(memo.memoDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Updated:</span>
              <span>{formatDate(memo.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCancelEdit}
        title="Update Memo"
        maxWidth="sm"
      >
        {memo && (
          <UpdateMemoForm
            id={memo.id}
            name={memo.name}
            detail={memo.detail}
            memoType={memo.memoType}
            memoDate={memo.memoDate}
            updatedAt={memo.updatedAt}
            onCancel={handleCancelEdit}
            onSuccess={handleUpdateMemo}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Memo"
        maxWidth="sm"
      >
        <CommonDeleteForm
          description={`Delete memo: "${memo?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isSubmitting={isDeleting}
          error={deleteError}
        />
      </Modal>
    </div>
  )
}

export default ViewMemoForm