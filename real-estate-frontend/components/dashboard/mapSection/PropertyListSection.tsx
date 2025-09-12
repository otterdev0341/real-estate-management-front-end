"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"

interface PropertyListSectionProps {
  properties: Array<{
    id: string
    name: string
    price?: string
    propertyStatus?: string
    sold?: boolean
  }>
  onFocusProperty: (propertyId: string) => void
}

const MAP_HEIGHT = 500 // px, should match MapDisplay

const PropertyListSection = ({ properties = [], onFocusProperty }: PropertyListSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [soldFilter, setSoldFilter] = useState("")
  const router = useRouter()

  // Get unique property statuses for filter dropdown
  const propertyStatusOptions = useMemo(() => {
    if (!properties || properties.length === 0) return []
    return Array.from(new Set(properties.map((p) => p.propertyStatus).filter(Boolean)))
  }, [properties])

  // Filter and search logic
  const filteredProperties = useMemo(() => {
    if (!properties || properties.length === 0) return []

    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || property.propertyStatus === statusFilter
      const matchesSold =
        soldFilter === "" ? true : soldFilter === "sold" ? property.sold === true : property.sold === false
      return matchesSearch && matchesStatus && matchesSold
    })
  }, [properties, searchTerm, statusFilter, soldFilter])

  return (
    <div
      className="bg-card/80 border border-border rounded-xl shadow-xl p-4 w-full flex flex-col overflow-hidden"
      style={{ height: `${MAP_HEIGHT}px`, minHeight: `${MAP_HEIGHT}px` }}
    >
      <h2 className="text-lg font-bold mb-4 text-foreground flex-shrink-0">Properties</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-shrink-0">
        <input
          type="text"
          placeholder="Search by name or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm w-full sm:w-2/4"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm w-full sm:w-1/4"
        >
          <option value="">All Status</option>
          {propertyStatusOptions.map((status) => (
            <option key={status} value={status ?? ""}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={soldFilter}
          onChange={(e) => setSoldFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg text-sm w-full sm:w-1/4"
        >
          <option value="">All</option>
          <option value="sold">Sold</option>
          <option value="notSold">Not Sold</option>
        </select>
      </div>
      <div
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          minHeight: 0,
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
        }}
      >
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }
        `}</style>
        <div className="flex flex-col gap-3 pr-2">
          {filteredProperties.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              {!properties || properties.length === 0 ? "No properties available." : "No properties found."}
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-background border border-border rounded-lg shadow flex flex-col gap-2 cursor-pointer hover:bg-violet-50 transition relative flex-shrink-0"
                onClick={() => onFocusProperty(property.id)}
                style={{
                  minHeight: "90px",
                  padding: "16px", // Reduced padding to prevent overflow
                }}
              >
                {/* Desktop view */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {property.id.slice(0, 6)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${property.sold ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {property.sold ? "Sold" : "Available"}
                    </span>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-muted transition flex-shrink-0"
                    title="View Property"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/service/property/${property.id}`)
                    }}
                  >
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-lg text-foreground truncate">{property.name}</div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      <span className="font-semibold">Price:</span> {property.price ?? "-"}
                    </span>
                    <span>
                      <span className="font-semibold">Status:</span> {property.propertyStatus ?? "-"}
                    </span>
                  </div>
                </div>
                {/* Mobile view */}
                <div className="flex sm:hidden items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-foreground truncate">{property.name}</div>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-muted transition flex-shrink-0 ml-2"
                    title="View Property"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/service/property/${property.id}`)
                    }}
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertyListSection
