"use client"

import { Loader } from '@googlemaps/js-api-loader'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadDraft } from '@/utils/storage'
import type { PlannerInput, Store } from '@/types/planner'

type MapType = google.maps.MapTypeId | 'roadmap' | 'satellite'
type TravelMode = google.maps.TravelMode | 'DRIVING' | 'WALKING' | 'TRANSIT'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 400) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

export default function RouteMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const renderersRef = useRef<google.maps.DirectionsRenderer[]>([])
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoRef = useRef<google.maps.InfoWindow | null>(null)
  const [draft, setDraft] = useState<PlannerInput | null>(null)
  const [mapType, setMapType] = useState<MapType>('roadmap')
  const [mode, setMode] = useState<TravelMode>('DRIVING')
  const [routeByStores, setRouteByStores] = useState<boolean>(false)
  const [warn, setWarn] = useState<string>('')
  const [busy, setBusy] = useState<boolean>(false)

  // Load plan on mount + storage updates
  useEffect(() => {
    setDraft(loadDraft<PlannerInput>())
    const handler = () => setDraft(loadDraft<PlannerInput>())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  // Load Google Maps once
  useEffect(() => {
    if (!API_KEY) return
    if (mapRef.current || !containerRef.current) return
    const loader = new Loader({ apiKey: API_KEY, version: 'weekly', libraries: ['places'] })
    loader.load().then(() => {
      const map = new google.maps.Map(containerRef.current as HTMLDivElement, {
        zoom: 4,
        center: { lat: -15.793889, lng: -47.882778 },
        mapTypeId: mapType as google.maps.MapTypeId,
        streetViewControl: false,
        mapTypeControl: false,
      })
      mapRef.current = map
      infoRef.current = new google.maps.InfoWindow()
    }).catch(() => {
      setWarn('Falha ao carregar Google Maps')
    })
  }, [])

  // Update mapType live
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(mapType as google.maps.MapTypeId)
    }
  }, [mapType])

  // Resolve points to visit based on controls
  const pointsToVisit = useMemo(() => {
    const pts: { label: string; address?: string; lat?: number; lng?: number }[] = []
    const d = draft
    if (!d) return pts
    const pushStore = (cityLabel: string, s: Store) => {
      pts.push({
        label: `${cityLabel} - ${s.name}`,
        address: s.addressLine,
        lat: s.lat,
        lng: s.lng,
      })
    }
    if (routeByStores) {
      for (const c of d.itinerary) {
        for (const s of c.stores) pushStore(c.city, s)
      }
    } else {
      for (const c of d.itinerary) {
        // Represent a city by the first store with coords or by city name
        const firstWithCoords = c.stores.find((s) => typeof s.lat === 'number' && typeof s.lng === 'number')
        if (firstWithCoords) {
          pushStore(c.city, firstWithCoords)
        } else {
          pts.push({ label: c.city })
        }
      }
    }
    return pts
  }, [draft, routeByStores])

  const recalc = useCallback(debounce(async () => {
    if (!draft) return
    if (!API_KEY) {
      // No key: show fallback warning; we could list points
      setWarn('Sem chave do Google Maps. Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para visualizar o mapa e rotas reais.')
      return
    }
    const map = mapRef.current
    if (!map) return
    setBusy(true)
    setWarn('')

    // Clear previous markers and renderers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []
    renderersRef.current.forEach((r) => r.setMap(null))
    renderersRef.current = []

    const geocoder = new google.maps.Geocoder()
    const directions = new google.maps.DirectionsService()

    const origin = draft.global.originCity
    const destination = draft.global.originCity

    // Resolve geocoded points
    const resolved: google.maps.LatLngLiteral[] = []
    const labels: string[] = []
    const failures: string[] = []

    // Helper to geocode one
    async function geocodeOne(label: string, addr?: string, lat?: number, lng?: number) {
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { result: { lat, lng }, used: 'coord' as const }
      }
      if (!addr) return { result: null, used: 'none' as const }
      const { results, status } = await geocoder.geocode({ address: addr })
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location
        return { result: { lat: loc.lat(), lng: loc.lng() }, used: 'geocode' as const }
      }
      return { result: null, used: 'fail' as const }
    }

    // Build list of geocode targets depending on route mode
    const targets = pointsToVisit

    for (const p of targets) {
      const label = p.label
      const g = await geocodeOne(label, p.address ?? label, p.lat, p.lng)
      if (g.result) {
        resolved.push(g.result)
        labels.push(label)
      } else {
        failures.push(label)
      }
    }

    // Markers
    const bounds = new google.maps.LatLngBounds()
    for (let i = 0; i < resolved.length; i++) {
      const pos = resolved[i]
      const marker = new google.maps.Marker({ position: pos, map, title: labels[i] })
      marker.addListener('click', () => {
        if (!infoRef.current) return
        infoRef.current.setContent(`<div><strong>${labels[i]}</strong></div>`)
        infoRef.current.open({ map, anchor: marker })
      })
      markersRef.current.push(marker)
      bounds.extend(pos)
    }

    // Directions: chunking to respect waypoints limit (23 typical)
    const maxWaypoints = 23
    const legs: { origin: string | google.maps.LatLngLiteral, destination: string | google.maps.LatLngLiteral, waypoints: google.maps.DirectionsWaypoint[] }[] = []

    const allStops: (string | google.maps.LatLngLiteral)[] = [origin, ...resolved, destination]
    let startIdx = 0
    while (startIdx < allStops.length - 1) {
      const endIdx = Math.min(startIdx + 1 + maxWaypoints, allStops.length - 1)
      const chunk = allStops.slice(startIdx, endIdx + 1)
      const o = chunk[0]
      const d = chunk[chunk.length - 1]
      const waypoints = chunk.slice(1, -1).map((p) => ({ location: p }))
      legs.push({ origin: o, destination: d, waypoints })
      startIdx = endIdx
    }

    for (const leg of legs) {
      const res = await directions.route({
        origin: leg.origin,
        destination: leg.destination,
        waypoints: leg.waypoints,
        travelMode: (mode as google.maps.TravelMode) ?? google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
        provideRouteAlternatives: false,
      })
      const renderer = new google.maps.DirectionsRenderer({ map, suppressMarkers: true, preserveViewport: true })
      renderer.setDirections(res)
      renderersRef.current.push(renderer)
      // Extend bounds with route overview
      const overview = res.routes[0].overview_path
      overview.forEach((p) => bounds.extend(p))
    }

    if (!bounds.isEmpty()) map.fitBounds(bounds, 40)
    if (failures.length) setWarn(`Alguns pontos não foram geocodificados: ${failures.join(', ')}`)
    setBusy(false)
  }, 400), [draft, pointsToVisit, mode])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label className="label">Tipo de mapa</label>
          <select className="input" value={mapType} onChange={(e) => setMapType(e.target.value as MapType)}>
            <option value="roadmap">Estradas</option>
            <option value="satellite">Satélite</option>
          </select>
        </div>
        <div>
          <label className="label">Modo</label>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as TravelMode)}>
            <option value="DRIVING">Carro</option>
            <option value="WALKING">A pé</option>
            <option value="TRANSIT">Transporte</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input id="routeStores" type="checkbox" className="h-4 w-4" checked={routeByStores} onChange={(e) => setRouteByStores(e.target.checked)} />
          <label htmlFor="routeStores" className="text-sm text-background-800">Rota por lojas</label>
        </div>
        <div className="mt-6">
          <button className="btn-secondary" disabled={busy} onClick={() => recalc()}>Recalcular</button>
        </div>
      </div>
      {(!API_KEY) && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          Sem chave do Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY). Será exibida apenas a lista de pontos quando disponível.
        </div>
      )}
      {warn && (
        <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{warn}</div>
      )}
      {!API_KEY ? (
        <FallbackPointsList draft={draft} routeByStores={routeByStores} />
      ) : (
        <div ref={containerRef} className="w-full h-[480px] rounded-lg overflow-hidden border border-background-200" />
      )}
    </div>
  )
}

function FallbackPointsList({ draft, routeByStores }: { draft: PlannerInput | null, routeByStores: boolean }) {
  if (!draft) return null
  const rows: { label: string, addr?: string, lat?: number, lng?: number }[] = []
  if (routeByStores) {
    for (const c of draft.itinerary) for (const s of c.stores) rows.push({ label: `${c.city} - ${s.name}`, addr: s.addressLine, lat: s.lat, lng: s.lng })
  } else {
    for (const c of draft.itinerary) rows.push({ label: c.city })
  }
  return (
    <div className="p-4 border border-background-200 rounded-lg">
      <div className="text-sm text-background-600 mb-2">Pontos (visualização simplificada sem chave):</div>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        {rows.map((r, i) => (
          <li key={i}>{r.label}{r.lat && r.lng ? ` — (${r.lat.toFixed(5)}, ${r.lng.toFixed(5)})` : r.addr ? ` — ${r.addr}` : ''}</li>
        ))}
      </ul>
    </div>
  )
}


