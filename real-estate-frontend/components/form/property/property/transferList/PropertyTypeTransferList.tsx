"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { usePropertyTypeContext } from "@/context/store/PropertyTypeStore"
import ResEntryPropertyTypeDto from "@/domain/property/propertyType/ResEntryPropertyTypeDto"
import { PropertyService } from "@/service/property/PropertyService"
import { isLeft } from "@/implementation/Either"

interface PropertyTypeTransferListProps {
  propertyId: string
}

const PropertyTypeTransferList = ({ propertyId }: PropertyTypeTransferListProps) => {
  const { propertyTypes } = usePropertyTypeContext()
  const [assignedTypes, setAssignedTypes] = useState<ResEntryPropertyTypeDto[]>([])
  const [leftChecked, setLeftChecked] = useState<string[]>([])
  const [rightChecked, setRightChecked] = useState<string[]>([])
  const [left, setLeft] = useState<ResEntryPropertyTypeDto[]>([])
  const [right, setRight] = useState<ResEntryPropertyTypeDto[]>([])
  const [syncing, setSyncing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true)
      setError("")
      const result = await PropertyService.instance.fetchAllPropertyTypesByPropertyId(propertyId)
      if (isLeft(result)) {
        setError(result.value.message || "Failed to fetch assigned property types")
        setAssignedTypes([])
      } else {
        setAssignedTypes(result.value)
        setError("")
      }
      setLoading(false)
    }
    fetchAssigned()
  }, [propertyId])

  useEffect(() => {
    const assignedIds = new Set(assignedTypes.map(pt => pt.id))
    setLeft(propertyTypes.filter(pt => !assignedIds.has(pt.id)))
    setRight(assignedTypes)
  }, [propertyTypes, assignedTypes])

  const moveRight = () => {
    const toMove = left.filter(pt => leftChecked.includes(pt.id))
    setRight([...right, ...toMove])
    setLeft(left.filter(pt => !leftChecked.includes(pt.id)))
    setLeftChecked([])
    setSuccess("")
  }

  const moveLeft = () => {
    const toMove = right.filter(pt => rightChecked.includes(pt.id))
    setLeft([...left, ...toMove])
    setRight(right.filter(pt => !rightChecked.includes(pt.id)))
    setRightChecked([])
    setSuccess("")
  }

  const moveAllRight = () => {
    setRight([...right, ...left])
    setLeft([])
    setLeftChecked([])
    setSuccess("")
  }

  const moveAllLeft = () => {
    setLeft([...left, ...right])
    setRight([])
    setRightChecked([])
    setSuccess("")
  }

  const handleSync = async () => {
    setSyncing(true)
    setError("")
    setSuccess("")
    const ids = right.map(pt => pt.id)
    const result = await PropertyService.instance.assignPropertyTypeToProperty({
      propertyId,
      propertyTypes: ids, // Use propertyTypeIds for backend compatibility
    })
    setSyncing(false)
    if (isLeft(result)) {
      setError(result.value.message || "Failed to assign property types")
    } else {
      setSuccess("Property types successfully assigned!")
      setAssignedTypes(right)
    }
  }

  const handleCheckAll = (items: ResEntryPropertyTypeDto[], setChecked: (ids: string[]) => void, checked: string[]) => {
    if (checked.length === items.length) {
      setChecked([])
    } else {
      setChecked(items.map(item => item.id))
    }
  }

  const renderList = (
    title: string,
    items: ResEntryPropertyTypeDto[],
    checked: string[],
    setChecked: (ids: string[]) => void,
    isLoading = false
  ) => (
    <div className="flex-1 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => handleCheckAll(items, setChecked, checked)}
          >
            {checked.length === items.length ? "None" : "All"}
          </Button>
        )}
      </div>
      <Card className="border-muted">
        <ScrollArea className="h-64 md:h-80">
          <div className="p-3 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                No items available
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (checked.includes(item.id)) {
                      setChecked(checked.filter(id => id !== item.id))
                    } else {
                      setChecked([...checked, item.id])
                    }
                  }}
                >
                  <Checkbox
                    checked={checked.includes(item.id)}
                    onCheckedChange={(checkedVal) => {
                      if (checkedVal) {
                        setChecked([...checked, item.id])
                      } else {
                        setChecked(checked.filter(id => id !== item.id))
                      }
                    }}
                    id={item.id}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label 
                    htmlFor={item.id} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 group-hover:text-foreground transition-colors"
                  >
                    {item.detail}
                  </label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading property types...</span>
      </div>
    )
  }

  return (
    <>
      <CardHeader className="pb-4">
        <div className="space-y-4">
          <div>
            <CardTitle className="text-xl font-semibold">Assign Property Types</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Select and assign property types to this property. Use the transfer controls to move items between lists.
            </p>
          </div>
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
          <div className="flex justify-end">
            <Button 
              onClick={handleSync} 
              disabled={syncing || right.length === assignedTypes.length}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6 items-start">
          {renderList("Available Types", left, leftChecked, setLeftChecked)}
          <div className="flex flex-col gap-2 items-center justify-center py-8">
            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveRight} 
                disabled={leftChecked.length === 0}
                className="w-10 h-10 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Move selected to assigned"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveAllRight} 
                disabled={left.length === 0}
                className="w-10 h-8 p-0 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Move all to assigned"
              >
                ≫
              </Button>
            </div>
            <Separator className="w-8" />
            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveAllLeft} 
                disabled={right.length === 0}
                className="w-10 h-8 p-0 text-xs hover:bg-secondary hover:text-secondary-foreground transition-colors"
                title="Move all to available"
              >
                ≪
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveLeft} 
                disabled={rightChecked.length === 0}
                className="w-10 h-10 p-0 hover:bg-secondary hover:text-secondary-foreground transition-colors"
                title="Move selected to available"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {renderList("Assigned Types", right, rightChecked, setRightChecked)}
        </div>
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {renderList("Available Types", left, leftChecked, setLeftChecked)}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-lg">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveAllLeft} 
                disabled={right.length === 0}
                className="h-8 px-2 text-xs hover:bg-secondary hover:text-secondary-foreground transition-colors"
                title="Move all to available"
              >
                <ChevronUp className="h-3 w-3 mr-1" />
                All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveLeft} 
                disabled={rightChecked.length === 0}
                className="h-8 px-2 hover:bg-secondary hover:text-secondary-foreground transition-colors"
                title="Move selected to available"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveRight} 
                disabled={leftChecked.length === 0}
                className="h-8 px-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Move selected to assigned"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={moveAllRight} 
                disabled={left.length === 0}
                className="h-8 px-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Move all to assigned"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                All
              </Button>
            </div>
          </div>
          {renderList("Assigned Types", right, rightChecked, setRightChecked)}
        </div>
        {/* Summary Section */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Available: <strong className="text-foreground">{left.length}</strong></span>
              <span>Assigned: <strong className="text-foreground">{right.length}</strong></span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {leftChecked.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {leftChecked.length} selected in available
                </Badge>
              )}
              {rightChecked.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {rightChecked.length} selected in assigned
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}

export default PropertyTypeTransferList