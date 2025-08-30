import Either, { right, left } from "@/implementation/Either"

interface LatLngResult {
  lat: string | null
  lng: string | null
  mapUrl: string
}

const extractLatLng = (mapUrl: string): Either<null, LatLngResult> => {
  if (!mapUrl || typeof mapUrl !== "string") {
    return left(null)
  }

  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/
  const match = mapUrl.match(regex)

  if (match && match.length >= 3) {
    const lat = match[1]
    const lng = match[2]
    return right({ lat, lng, mapUrl })
  }

  return left(null)
}

export default extractLatLng