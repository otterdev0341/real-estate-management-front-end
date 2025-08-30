"use client"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, RefreshCw, AlertCircle, CheckCircle2, PlusCircle, Trash2 } from "lucide-react"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { MemoService } from "@/service/memo/MemoService"
import { isLeft } from "@/implementation/Either"
import ResEntryPropertyDto from "@/domain/property/property/ResEntryPropertyDto"
import { Separator } from "@/components/ui/separator"
import { PropertyService } from "@/service/property/PropertyService"
import { FaEye } from "react-icons/fa"
import { useRouter } from "next/navigation"

interface MemoTransferListProps {
  memoId: string
}

const MemoTransferList = ({ memoId }: MemoTransferListProps) => {
  const router = useRouter()
  const { properties, loading: propertyLoading } = usePropertyContext()
  const [right, setRight] = useState<ResEntryPropertyDto[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Fetch assigned properties for this memo using MemoService
  useEffect(() => {
    const fetchAssigned = async () => {
      setError("")
      const result = await MemoService.instance.fetchAllPropertiesByMemoId(memoId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch assigned properties")
        setRight([])
      } else {
        setRight(result.value)
      }
    }
    fetchAssigned()
  }, [memoId, properties])

  // Prepare left list (unassigned properties)
  const assignedIds = new Set(right.map(pt => pt.id))
  const left = properties.filter(pt => !assignedIds.has(pt.id))
  const filteredLeft = search
    ? left.filter(pt => pt.name.toLowerCase().includes(search.toLowerCase()) || pt.id.includes(search))
    : left

  // Assign memo to property
  const handleAssign = async (propertyId: string) => {
    setAssigningId(propertyId)
    setError("")
    setSuccess("")
    const result = await PropertyService.instance.assignMemoToProperty(propertyId, memoId)
    setAssigningId(null)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to assign memo to property")
    } else {
      setSuccess("Memo assigned successfully!")
      // Move property to right list
      const property = properties.find(p => p.id === propertyId)
      if (property) setRight([...right, property])
    }
  }

  // Remove memo from property
  const handleRemove = async (propertyId: string) => {
    setRemovingId(propertyId)
    setError("")
    setSuccess("")
    const result = await PropertyService.instance.removeMemoFromProperty(propertyId, memoId)
    setRemovingId(null)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to remove memo from property")
    } else {
      setSuccess("Memo removed successfully!")
      setRight(right.filter(p => p.id !== propertyId))
    }
  }

  // Render left card list
  const renderLeftList = () => (
    <div className="flex-1 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">Available Properties</h3>
          <Badge variant="secondary" className="text-xs">{filteredLeft.length}</Badge>
        </div>
        <input
          type="text"
          placeholder="Search property..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1 text-xs w-full sm:w-32"
        />
      </div>
      <ScrollArea className="h-64 md:h-80">
        <div className="grid grid-cols-1 gap-3">
          {propertyLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : filteredLeft.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No properties available
            </div>
          ) : (
            filteredLeft.map((item) => (
              <Card key={item.id} className="flex flex-row items-center justify-between p-3 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium break-words whitespace-pre-line">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                    <span>ID: {item.id.slice(0, 6)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={e => {
                      e.stopPropagation()
                      router.push(`/service/property/${item.id}`)
                    }}
                    title="View property"
                  >
                    <FaEye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary"
                    disabled={assigningId === item.id}
                    onClick={e => {
                      e.stopPropagation()
                      handleAssign(item.id)
                    }}
                    title="Assign memo to property"
                  >
                    {assigningId === item.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )

  // Render right card list
  const renderRightList = () => (
    <div className="flex-1 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-sm text-foreground">Assigned Properties</h3>
        <Badge variant="secondary" className="text-xs">{right.length}</Badge>
      </div>
      <ScrollArea className="h-64 md:h-80">
        <div className="grid grid-cols-1 gap-3">
          {right.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No properties assigned
            </div>
          ) : (
            right.map((item) => (
              <Card key={item.id} className="flex flex-row items-center p-3 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium break-words whitespace-pre-line">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                    <span>ID: {item.id.slice(0, 6)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={e => {
                      e.stopPropagation()
                      router.push(`/service/property/${item.id}`)
                    }}
                    title="View property"
                  >
                    <FaEye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    disabled={removingId === item.id}
                    onClick={e => {
                      e.stopPropagation()
                      handleRemove(item.id)
                    }}
                    title="Remove memo from property"
                  >
                    {removingId === item.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <CardTitle className="text-xl font-semibold">Assign Memo to Properties</CardTitle>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Select a property and click the assign icon to assign this memo.
          </p>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-md">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6 items-start">
          {renderLeftList()}
          <Separator orientation="vertical" className="h-80 mx-2" />
          {renderRightList()}
        </div>
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {renderLeftList()}
          <Separator className="my-2" />
          {renderRightList()}
        </div>
      </CardContent>
    </>
  )
}

export default MemoTransferList

/**
 * lef: fetch all property from PropertyStore
 * maby be left can use scroll-area or something similar but can be search or filter
 * only one button "Sync" 
 * in case to sync need to call assignMemoToProperty in interater to it
 * in case to remove need to call removeMemoFromProperty in interater to it
 * 
 * this component accept memoId: string as props
 * 
 * also this design must be responsive
 */