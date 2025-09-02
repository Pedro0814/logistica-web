import type { PlannerInput } from '@/types/planner'

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function cacheKey(query: string) {
  return `geocodeCache:${query}`
}

export async function geocodeNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const key = cacheKey(query)
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(key)
      if (cached) return JSON.parse(cached)
    }
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '1')
    url.searchParams.set('q', query)
    if (CONTACT_EMAIL) url.searchParams.set('email', CONTACT_EMAIL)

    // Respect simple 1 req/s
    await sleep(1000)
    const res = await fetch(url.toString(), { headers: { 'Accept-Language': 'pt-BR' } })
    if (!res.ok) return null
    const data = await res.json()
    const first = data?.[0]
    if (!first) return null
    const result = { lat: Number(first.lat), lng: Number(first.lon) }
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(key, JSON.stringify(result)) } catch {}
    }
    return result
  } catch {
    return null
  }
}

export async function resolvePlannerPoints(
  input: PlannerInput,
  mode: 'cities' | 'stores'
): Promise<Array<{ label: string; lat: number; lng: number }>> {
  const pts: Array<{ label: string; lat: number; lng: number }> = []
  const push = (label: string, lat: number, lng: number) => pts.push({ label, lat, lng })

  if (mode === 'stores') {
    for (const c of input.itinerary) {
      for (const s of c.stores) {
        if (s.addressLine) {
          const g = await geocodeNominatim(s.addressLine)
          if (g) push(`${c.city} - ${s.name}`, g.lat, g.lng)
        }
      }
    }
  } else {
    for (const c of input.itinerary) {
      const g = await geocodeNominatim(c.city)
      if (g) push(`${c.city}`, g.lat, g.lng)
    }
  }

  return pts
}






