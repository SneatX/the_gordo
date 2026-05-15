import type { Schedule } from '@/types'
import { toAmPm } from './time'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export interface ScheduleGroup {
  label: string
  hours: string
}

export function groupSchedules(schedules: Schedule[]): ScheduleGroup[] {
  const active = schedules.filter((s) => s.isActive).sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  if (active.length === 0) return []

  const groups: { days: number[]; startTime: string; endTime: string }[] = []
  for (const s of active) {
    const last = groups[groups.length - 1]
    if (
      last &&
      last.startTime === s.startTime &&
      last.endTime === s.endTime &&
      last.days[last.days.length - 1] === s.dayOfWeek - 1
    ) {
      last.days.push(s.dayOfWeek)
    } else {
      groups.push({ days: [s.dayOfWeek], startTime: s.startTime, endTime: s.endTime })
    }
  }

  return groups.map((g) => {
    const first = DAY_NAMES[g.days[0]]
    const last = DAY_NAMES[g.days[g.days.length - 1]]
    const label =
      g.days.length === 1 ? first :
      g.days.length === 2 ? `${first} y ${last}` :
      `${first} a ${last}`
    return { label, hours: `${toAmPm(g.startTime)} – ${toAmPm(g.endTime)}` }
  })
}
