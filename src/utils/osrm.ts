export async function routeOSRM(
  points: Array<{ lat: number; lng: number }>,
  profile: 'car' | 'bike' | 'foot',
  baseUrl: string
): Promise<{ line: GeoJSON.LineString; distanceKm: number; durationHrs: number } | null> {
  if (points.length < 2) return null

  const coords = (pts: Array<{ lat: number; lng: number }>) => pts.map((p) => `${p.lng},${p.lat}`).join(';')
  const chunks: Array<Array<{ lat: number; lng: number }>> = []
  const maxCoords = 20 // safety to avoid giant URLs
  for (let i = 0; i < points.length; i += maxCoords - 1) {
    const slice = points.slice(i, i + maxCoords)
    if (i !== 0) slice.unshift(points[i]) // ensure continuity between chunks
    chunks.push(slice)
  }

  let totalDistance = 0
  let totalDuration = 0
  const allCoords: [number, number][] = []

  const apiProfile = profile === 'car' ? 'driving' : profile === 'bike' ? 'cycling' : 'walking'

  for (const chunk of chunks) {
    const url = new URL(`${baseUrl.replace(/\/$/, '')}/route/v1/${apiProfile}/${coords(chunk)}`)
    url.searchParams.set('overview', 'full')
    url.searchParams.set('geometries', 'geojson')
    url.searchParams.set('steps', 'false')
    url.searchParams.set('annotations', 'duration,distance')

    const res = await fetch(url.toString())
    if (!res.ok) continue
    const data = await res.json()
    const route = data?.routes?.[0]
    if (!route?.geometry) continue
    const line = route.geometry as GeoJSON.LineString
    const coordsPart = line.coordinates as [number, number][]
    allCoords.push(...coordsPart)
    totalDistance += (route.distance || 0)
    totalDuration += (route.duration || 0)
  }

  if (!allCoords.length) return null
  return {
    line: { type: 'LineString', coordinates: allCoords },
    distanceKm: totalDistance / 1000,
    durationHrs: totalDuration / 3600,
  }
}


