import { useState } from "react"
import ReqUpdatePropertyStatusDto from "@/domain/property/propertyStatus/ReqUpdatePropertyStatusDto"
import { PropertyStatusService } from "@/service/property/PropertyStatusService"
import { isLeft } from "@/implementation/Either"

interface UpdatePropertyStatusFormProps {
  initialData: ReqUpdatePropertyStatusDto
  onSuccess?: () => void
  onCancel?: () => void
}

const UpdatePropertyStatusForm = ({
  initialData,
  onSuccess,
  onCancel,
}: UpdatePropertyStatusFormProps) => {
  const [detail, setDetail] = useState(initialData.detail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await PropertyStatusService.instance.updatePropertyStatus({
      id: initialData.id,
      detail,
    })
    setLoading(false)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to update property status.")
    } else {
      if (onSuccess) onSuccess()
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">ID</label>
        <input
          type="text"
          value={initialData.id}
          readOnly
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm opacity-70"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Detail</label>
        <input
          type="text"
          value={detail}
          onChange={e => setDetail(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  )
}

export default UpdatePropertyStatusForm