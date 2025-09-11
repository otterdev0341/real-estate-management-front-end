"use client"

import { useState } from "react"
import { usePropertyContext } from "@/context/store/PropertyStore"
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

// Fix default marker icon issue for leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const DEFAULT_CENTER = [13.7563, 100.5018] // Bangkok as default center

function FocusMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  map.setView([lat, lng], map.getZoom(), { animate: true })
  return null
}

const MapDisplay = () => {
  const { properties, loading } = usePropertyContext()
  const router = useRouter()
  const [focusedPropertyId, setFocusedPropertyId] = useState<string | null>(null)

  // Filter properties with valid lat/lng
  const propertiesWithLatLng = properties.filter(
    (p) =>
      typeof p.lat === "string" &&
      typeof p.lng === "string" &&
      p.lat.trim() !== "" &&
      p.lng.trim() !== "" &&
      !isNaN(parseFloat(p.lat)) &&
      !isNaN(parseFloat(p.lng))
  )

  // Calculate map center from properties if available
  const mapCenter: [number, number] =
    propertiesWithLatLng.length > 0
      ? [
          parseFloat(propertiesWithLatLng[0].lat),
          parseFloat(propertiesWithLatLng[0].lng),
        ]
      : [DEFAULT_CENTER[0], DEFAULT_CENTER[1]]

  if (loading) {
    return (
      <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-border flex items-center justify-center lg:flex-row"
        >
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      <div className="h-[500px] rounded-xl overflow-hidden shadow-lg border border-border w-full lg:w-[60vw]">
        <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {propertiesWithLatLng.map((property) => {
            const lat = parseFloat(property.lat)
            const lng = parseFloat(property.lng)
            const isFocused = focusedPropertyId === property.id
            return (
              <Marker
                key={property.id}
                position={[lat, lng]}
                eventHandlers={{
                  click: () => router.push(`/service/property/${property.id}`),
                  mouseover: (e) => {
                    e.target.openTooltip()
                  },
                  mouseout: (e) => {
                    e.target.closeTooltip()
                  },
                }}
              >
                {isFocused && <FocusMap lat={lat} lng={lng} />}
                <Popup>
                  <div className="font-bold">{property.name}</div>
                  <div className="text-sm text-muted-foreground">{property.area}</div>
                  <div className="text-xs mt-1">{property.description}</div>
                  <button
                    className="mt-2 px-2 py-1 bg-violet-600 text-white rounded text-xs hover:bg-violet-700"
                    onClick={() => router.push(`/service/property/${property.id}`)}
                  >
                    View Details
                  </button>
                </Popup>
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  {property.name}
                </Tooltip>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
      <div
        className="bg-card/80 border border-border rounded-xl shadow-xl p-4 overflow-auto w-full lg:w-[40vw]"
        style={{
          marginTop: typeof window !== "undefined" && window.innerWidth < 1024 ? "1rem" : 0,
        }}
      >
        <h2 className="text-lg font-bold mb-4 text-foreground">Properties</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Name</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Price</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Status</th>
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Sold</th>
            </tr>
          </thead>
          <tbody>
            {propertiesWithLatLng.map((property) => (
              <tr
                key={property.id}
                className={`border-b border-border cursor-pointer hover:bg-violet-100 transition`}
                onClick={() => setFocusedPropertyId(property.id)}
              >
                <td className="px-3 py-2">{property.id.slice(0, 6)}</td>
                <td className="px-3 py-2">{property.name}</td>
                <td className="px-3 py-2">{property.price ?? "-"}</td>
                <td className="px-3 py-2">{property.propertyStatus}</td>
                <td className="px-3 py-2">{property.sold ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MapDisplay