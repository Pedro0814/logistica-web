"use client"

import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { loadDraft } from '@/utils/storage'
import type { PlannerInput } from '@/types/planner'
import { geocodeNominatim, resolvePlannerPoints } from '@/utils/geo_osm'
import { routeOSRM } from '@/utils/osrm'

const OSRM_URL = process.env.NEXT_PUBLIC_OSRM_URL || 'https://router.project-osrm.org'

// Configure default marker icon for Leaflet (works well with bundlers)
const DefaultIcon = new L.Icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(L.Marker as any).prototype.options.icon = DefaultIcon

function FitAll({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] })
  }, [bounds, map])
  return null
}

export default function RouteMapLeaflet({ planner }: { planner?: PlannerInput }) {
  const draft = planner ?? loadDraft<PlannerInput>()

  const [profile, setProfile] = useState<'car' | 'bike' | 'foot'>('car')
  const [mode, setMode] = useState<'cities' | 'stores'>('cities')
  const [points, setPoints] = useState<Array<{ label: string; lat: number; lng: number }>>([])
  const [ignored, setIgnored] = useState<string[]>([])
  const [route, setRoute] = useState<GeoJSON.LineString | null>(null)
  const [segmentLines, setSegmentLines] = useState<Array<{ line: GeoJSON.LineString; color: string }>>([])
  const [dailySegmentLines, setDailySegmentLines] = useState<Array<{ line: GeoJSON.LineString; color: string; dashed?: boolean }>>([])
  const [distanceKm, setDistanceKm] = useState<number>(0)
  const [durationHrs, setDurationHrs] = useState<number>(0)
  const [busy, setBusy] = useState<boolean>(false)

  const bounds = useMemo(() => {
    if (!points.length && !route) return null
    const b = L.latLngBounds([])
    if (route?.coordinates && (route.coordinates as [number, number][])?.length) {
      (route.coordinates as [number, number][]).forEach(([lng, lat]) => b.extend([lat, lng]))
    }
    points.forEach((p) => b.extend([p.lat, p.lng]))
    if (!b.isValid()) return null
    return b
  }, [points, route])

  const recalc = useCallback(async () => {
    if (!draft) return
    setBusy(true)
    setRoute(null)
    setSegmentLines([])
    setIgnored([])
    setDistanceKm(0)
    setDurationHrs(0)
    setDailySegmentLines([])

    const resolved = await resolvePlannerPoints(draft, mode)
    const extraMarkers: Array<{ label: string; lat: number; lng: number }> = []
    const origin = await geocodeOrigin(draft.global.originCity)
    const toRoute = origin
      ? [origin[0], ...resolved.map(({ lat, lng }) => ({ lat, lng })), origin[0]]
      : resolved.map(({ lat, lng }) => ({ lat, lng }))

    if (toRoute.length < 2) {
      setBusy(false)
      return
    }

    const basePalette = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']
    let baseKm = 0
    let baseHrs = 0
    for (let i = 0; i < toRoute.length - 1; i++) {
      const a = toRoute[i]
      const b = toRoute[i + 1]
      const seg = await routeOSRM([a, b], profile, OSRM_URL)
      if (seg?.line) {
        const color = basePalette[i % basePalette.length]
        setSegmentLines((prev) => [...prev, { line: seg.line, color }])
        baseKm += seg.distanceKm
        baseHrs += seg.durationHrs
      }
    }

    // Deslocamentos diários hotel ⇄ lojas por cidade
    let extraKm = 0
    let extraHrs = 0
    const dailyPalette = ['#16a34a', '#0ea5e9', '#d946ef', '#f97316', '#22c55e']
    let dailyIndex = 0
    for (const c of draft.itinerary) {
      const hotel = await geocodeHotel(c)
      if (!hotel) continue
      const stores = await resolveStoresForCity(c)
      if (stores.length === 0) continue
      const chain = [hotel, ...stores, hotel]
      for (let i = 0; i < chain.length - 1; i++) {
        const seg = await routeOSRM([chain[i], chain[i + 1]], 'car', OSRM_URL)
        if (seg?.line) {
          const color = dailyPalette[dailyIndex % dailyPalette.length]
          dailyIndex++
          setDailySegmentLines((prev) => [...prev, { line: seg.line, color, dashed: true }])
          extraKm += seg.distanceKm
          extraHrs += seg.durationHrs
        }
      }
      extraMarkers.push({ label: `Hotel – ${c.city}`, lat: hotel.lat, lng: hotel.lng })
    }

    setPoints([...resolved, ...extraMarkers])
    setDistanceKm(baseKm + extraKm)
    setDurationHrs(baseHrs + extraHrs)
    setBusy(false)
  }, [draft, mode, profile])

  useEffect(() => { void recalc() }, [mode, profile, recalc])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Tipo de mapa</label>
          <select className="input" defaultValue="osm" onChange={() => {/* handled by LayersControl */}}>
            <option value="osm">OSM Standard</option>
            <option value="positron">CartoDB Positron</option>
            <option value="esri">Esri Satélite</option>
          </select>
        </div>
        <div>
          <label className="label">Perfil</label>
          <select className="input" value={profile} onChange={(e) => setProfile(e.target.value as any)}>
            <option value="car">Carro</option>
            <option value="bike">Bike</option>
            <option value="foot">A pé</option>
          </select>
        </div>
        <div>
          <label className="label">Rota por</label>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="cities">Cidades</option>
            <option value="stores">Unidades</option>
          </select>
        </div>
        <button className="btn-secondary" disabled={busy} onClick={() => void recalc()}>Recalcular</button>
        <div className="text-sm text-background-600">
          {points.length} pontos resolvidos{ignored.length ? `, ${ignored.length} ignorados` : ''}
          {distanceKm ? ` • ${distanceKm.toFixed(1)} km` : ''}
          {durationHrs ? ` • ${durationHrs.toFixed(1)} h` : ''}
        </div>
      </div>

      <MapContainer className="w-full h-[480px] rounded-lg overflow-hidden border border-background-200" center={[-15.79, -47.88]} zoom={4} scrollWheelZoom>
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OSM Standard">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="CartoDB Positron">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Esri Satélite">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]}>
            <Popup>
              <div className="text-sm"><strong>{p.label}</strong></div>
            </Popup>
          </Marker>
        ))}
        {route && (
          <Polyline positions={(route.coordinates as [number, number][])?.map(([lng, lat]) => [lat, lng])} color="#2563eb" weight={4} />
        )}
        {segmentLines.map((seg, i) => (
          <Polyline key={`seg-${i}`} positions={(seg.line.coordinates as [number, number][])?.map(([lng, lat]) => [lat, lng])} pathOptions={{ color: seg.color, weight: 4 }} />
        ))}
        {dailySegmentLines.map((seg, i) => (
          <Polyline key={`dseg-${i}`} positions={(seg.line.coordinates as [number, number][])?.map(([lng, lat]) => [lat, lng])} pathOptions={{ color: seg.color, weight: 3, dashArray: seg.dashed ? '6 6' : undefined }} />
        ))}
        <FitAll bounds={bounds} />
      </MapContainer>
    </div>
  )
}

async function geocodeOrigin(originCity: string): Promise<Array<{ lat: number; lng: number }> | null> {
  const g = await geocodeNominatim(originCity)
  return g ? [g] : null
}

async function geocodeHotel(city: { hotelName?: string; city: string }) {
  if (city.hotelName && city.hotelName.trim()) {
    const g = await geocodeNominatim(`${city.hotelName}, ${city.city}`)
    if (g) return g
  }
  return await geocodeNominatim(city.city)
}

async function resolveStoresForCity(city: { stores: Array<{ addressLine: string }>; city: string }) {
  const pts: Array<{ lat: number; lng: number }> = []
  for (const s of city.stores) {
    if (s.addressLine) {
      const g = await geocodeNominatim(s.addressLine)
      if (g) pts.push(g)
    }
  }
  if (pts.length === 0) {
    const g = await geocodeNominatim(city.city)
    if (g) pts.push(g)
  }
  return pts
}


