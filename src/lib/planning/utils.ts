export function isoDaysRange(startISO: string, endISO: string): string[] {
  if (!startISO || !endISO) return []
  const start = new Date(startISO + 'T00:00:00')
  const end = new Date(endISO + 'T00:00:00')
  const out: string[] = []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export function businessDaysBetween(weeks: Array<{ weekIndex: number; saturday: 'work' | 'off'; sunday: 'work' | 'off' }>, startISO: string, endISO: string) {
  const days = isoDaysRange(startISO, endISO)
  // simple preview: count saturdays/sundays as work/off based on week index
  const totalWeeks = weeks.length || Math.ceil(days.length / 7)
  let satWork = 0, sunWork = 0
  days.forEach((iso, idx) => {
    const date = new Date(iso + 'T00:00:00')
    const dow = date.getDay() // 0=Sun,6=Sat
    const wIndex = Math.min(Math.floor(idx / 7) + 1, totalWeeks)
    const w = weeks.find((w) => w.weekIndex === wIndex)
    if (!w) return
    if (dow === 6 && w.saturday === 'work') satWork++
    if (dow === 0 && w.sunday === 'work') sunWork++
  })
  return { satWork, sunWork, totalWeeks }
}


