import { Calendar, Clock, Users } from 'lucide-react'
import { toAmPm, RESERVATION_DURATION_MIN } from '@/utils/time'

interface SummaryBarProps {
  date: string
  time: string
  partySize: number
  tableNumber?: number
}

export default function SummaryBar({ date, time, partySize, tableNumber }: SummaryBarProps) {
  const dateLabel = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('es-CO', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })
    : ''

  return (
    <div className="bg-bg-warm border-2 border-stone-dark/30 rounded-2xl px-5 py-3 flex flex-wrap gap-4 text-sm">
      <span className="font-display text-stone-dark capitalize">
        <Calendar className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
        {dateLabel}
      </span>
      <span className="font-display text-stone-dark">
        <Clock className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
        {toAmPm(time)} · {RESERVATION_DURATION_MIN} min
      </span>
      <span className="font-display text-stone-dark">
        <Users className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
        {partySize} {partySize === 1 ? 'persona' : 'personas'}
      </span>
      {tableNumber != null && (
        <span className="font-display text-stone-dark font-semibold">Mesa #{tableNumber}</span>
      )}
    </div>
  )
}
