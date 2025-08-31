"use client"
import { useEffect, useState } from "react"
import { PropertyService } from "@/service/property/PropertyService"
import { MemoService } from "@/service/memo/MemoService"
import { isLeft } from "@/implementation/Either"
import ResEntryMemoDto from "@/domain/memo/ResEntryMemoDto"
import FileUpload from "@/domain/uploadFile/FileUpload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaEye, FaFileImage, FaFilePdf, FaFileAlt, FaRegFilePdf } from "react-icons/fa"
import { useRouter } from "next/navigation"
import { PaperClipIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { GoUnlink } from "react-icons/go"
import { RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Modal from "@/components/modal/Modal"
import CommonYesNoForm from "@/components/form/delete/CommonYesNoForm"

interface ViewPropertyMemoProps {
  propertyId: string
}

const ViewPropertyMemo = ({ propertyId }: ViewPropertyMemoProps) => {
  const [memos, setMemos] = useState<ResEntryMemoDto[]>([])
  const [attachmentsMap, setAttachmentsMap] = useState<Record<string, FileUpload[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [memoTypeFilter, setMemoTypeFilter] = useState("all")
  const [confirmUnlinkId, setConfirmUnlinkId] = useState<string | null>(null)
  const [isSubmittingUnlink, setIsSubmittingUnlink] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchMemos = async () => {
      setLoading(true)
      setError("")
      const result = await PropertyService.instance.fetchAllMemosByProperty(propertyId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch memos")
        setMemos([])
      } else {
        setMemos(result.value)
      }
      setLoading(false)
    }
    fetchMemos()
  }, [propertyId])

  // Fetch attachments for each memo
  useEffect(() => {
    const fetchAttachments = async () => {
      const map: Record<string, FileUpload[]> = {}
      for (const memo of memos) {
        const result = await MemoService.instance.fetchMemoFileRelated({ targetId: memo.id, fileType: "all" })
        if (!isLeft(result)) {
          map[memo.id] = result.value
        } else {
          map[memo.id] = []
        }
      }
      setAttachmentsMap(map)
    }
    if (memos.length > 0) fetchAttachments()
  }, [memos])

  // Helper to count attachment types
  const getAttachmentCounts = (memoId: string) => {
    const files = attachmentsMap[memoId] || []
    const imageCount = files.filter(f => f.fileType === "image").length
    const pdfCount = files.filter(f => f.fileType === "pdf").length
    const otherCount = files.filter(f => f.fileType !== "image" && f.fileType !== "pdf").length
    return { imageCount, pdfCount, otherCount }
  }

  // Unlink memo from property (with confirmation)
  const handleUnlink = async (memoId: string) => {
    setIsSubmittingUnlink(true)
    setError("")
    const result = await PropertyService.instance.removeMemoFromProperty(propertyId, memoId)
    setIsSubmittingUnlink(false)
    setConfirmUnlinkId(null)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to unlink memo from property")
    } else {
      setMemos(memos.filter(m => m.id !== memoId))
    }
  }

  // Get all unique memo types from memos
  const memoTypes = Array.from(new Set(memos.map(m => m.memoType).filter(Boolean)))

  // Filter memos by search term and memoType
  const filteredMemos = memos.filter(memo => {
    const matchesSearch =
      !search ||
      (memo.name?.toLowerCase().includes(search.toLowerCase()) ||
        memo.detail?.toLowerCase().includes(search.toLowerCase()))
    const matchesType =
      memoTypeFilter === "all" || memo.memoType === memoTypeFilter
    return matchesSearch && matchesType
  })

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading memos...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-destructive">{error}</div>
  }

  if (!filteredMemos || filteredMemos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-muted-foreground text-lg">No memos found for this property.</div>
      </div>
    )
  }

  return (
    <>
      {/* Modal for confirmation */}
      <Modal
        isOpen={!!confirmUnlinkId}
        onClose={() => setConfirmUnlinkId(null)}
        title="Unlink Memo"
        maxWidth="sm"
      >
        <CommonYesNoForm
          description="Are you sure you want to unlink this memo from the property? This action cannot be undone."
          onYes={() => confirmUnlinkId && handleUnlink(confirmUnlinkId)}
          onNo={() => setConfirmUnlinkId(null)}
          isSubmitting={isSubmittingUnlink}
          error={error}
        />
      </Modal>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <h2 className="font-semibold text-lg">Memos</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search memo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-xs w-full sm:w-64"
          />
          <Select value={memoTypeFilter} onValueChange={setMemoTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {memoTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMemos.map(memo => {
          const { imageCount, pdfCount, otherCount } = getAttachmentCounts(memo.id)
          return (
            <Card key={memo.id} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-gray-900">{memo.name}</div>
                  <div className="text-sm text-muted-foreground">{memo.detail}</div>
                  <div className="text-xs text-muted-foreground mt-2">Type: {memo.memoType}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Created: {memo.createdAt ? format(new Date(memo.createdAt), "yyyy-MM-dd HH:mm") : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {memo.updatedAt ? format(new Date(memo.updatedAt), "yyyy-MM-dd HH:mm") : "-"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/service/memo/${memo.id}`)}
                    title="View Memo"
                  >
                    <FaEye className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    disabled={isSubmittingUnlink}
                    onClick={() => setConfirmUnlinkId(memo.id)}
                    title="Unlink memo from property"
                  >
                    {isSubmittingUnlink && confirmUnlinkId === memo.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <GoUnlink className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
              {/* Attachments summary */}
              <div className="flex items-center gap-4 mt-2">
                {imageCount > 0 && (
                  <span className="flex items-center gap-1 text-blue-600 text-xs">
                    <PhotoIcon className="h-4 w-4" /> {imageCount}
                  </span>
                )}
                {pdfCount > 0 && (
                  <span className="flex items-center gap-1 text-red-600 text-xs">
                    <FaRegFilePdf className="h-4 w-4" /> {pdfCount}
                  </span>
                )}
                {otherCount > 0 && (
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <PaperClipIcon className="h-4 w-4" /> {otherCount}
                  </span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

export default ViewPropertyMemo


/**
 * ths will accept propts as propertyId: string
 * fetchAllMemosByProperty from propertyService
 * display memo by card display but use the pattern from ViewMemoForm
 * also display icon for attachment if there is any with Icon and number "image", "pdf", "other"
 * if no memo, display empty state with button to create new memo
 * ad fa eye icon on click of button, open /service/memo/{memoId}
 */


