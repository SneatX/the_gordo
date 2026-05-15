export const RESERVATION_DURATION_MIN = 90

export const toAmPm = (hhmm: string): string => {
  const [hStr, mStr] = hhmm.split(':')
  const h = parseInt(hStr, 10)
  const h12 = h % 12 || 12
  return `${h12}:${mStr} ${h >= 12 ? 'PM' : 'AM'}`
}

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const fromMinutes = (mins: number): string => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
