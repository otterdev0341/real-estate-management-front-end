"use client"

import { usePropertyContext } from "@/context/store/PropertyStore"
import { useMemo } from "react"

// Pastel color palette for bars (12 colors)
const pastelColors = [
  "#A3CEF1", "#F9C6D0", "#F7E8A4", "#B6E2D3", "#D7C7F4", "#F6D6B1",
  "#C2F0FC", "#FFD6E0", "#D4F1F4", "#FFE5B4", "#B5EAD7", "#E2F0CB"
]

const PropertyStatusWidget = () => {
  const { properties, loading } = usePropertyContext()

  // Count properties by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    properties.forEach((p) => {
      const status = p.propertyStatus || "Unknown"
      counts[status] = (counts[status] || 0) + 1
    })
    return counts
  }, [properties])

  // Prepare chart data
  const statusList = Object.keys(statusCounts).sort((a, b) => a.localeCompare(b))
  const maxCount = Math.max(...Object.values(statusCounts), 1)

  return (
    <div className="bg-card/80 border border-border rounded-xl shadow-xl p-4 w-full max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4 text-foreground">Property Status Overview</h2>
      {loading ? (
        <div className="text-muted-foreground text-center py-8">Loading...</div>
      ) : statusList.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No property data found.</div>
      ) : (
        <>
          {/* Desktop view: show bar chart */}
          <div className="hidden md:flex gap-4 items-end w-full justify-center">
            {statusList.map((status, idx) => {
              const count = statusCounts[status]
              const percent = Math.round((count / maxCount) * 100)
              const barColor = pastelColors[idx % pastelColors.length]
              return (
                <div key={status} className="flex flex-col items-center">
                  <div
                    className="w-8 rounded-t"
                    style={{
                      height: `${percent * 2}px`, // scale height for visibility
                      background: barColor,
                      transition: "height 0.5s"
                    }}
                  />
                  <span className="text-xs font-medium mt-1 text-muted-foreground">{status}</span>
                  <span className="text-xs font-semibold text-foreground">{count}</span>
                </div>
              )
            })}
          </div>
          {/* Mobile & medium view: show only property status and count */}
          <div className="flex flex-col gap-2 md:hidden w-full">
            {statusList.map((status, idx) => (
              <div
                key={status}
                className="flex items-center justify-between px-3 py-2 rounded bg-muted/40"
                style={{ background: pastelColors[idx % pastelColors.length] }}
              >
                <span className="text-xs font-medium text-muted-foreground">{status}</span>
                <span className="text-xs font-bold text-foreground">{statusCounts[status]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PropertyStatusWidget