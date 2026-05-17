import { Calendar, CalendarClock } from 'lucide-react'

interface Props {
  type?: 'date' | 'datetime-local'
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: boolean
  min?: string
  className?: string
}

export default function DateInput({ type = 'date', value, onChange, required, error, min, className = '' }: Props) {
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={[
          'w-full border-2 rounded-xl px-3 py-2 pr-9 text-sm font-display bg-white cursor-pointer',
          error
            ? 'border-brand-red focus:border-brand-red'
            : 'border-stone-dark focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)]',
          'focus:outline-none transition-colors',
          '[color-scheme:light]',
          // Hide the native indicator visually but keep pointer-events so clicks still open the picker
          '[&::-webkit-calendar-picker-indicator]:opacity-0',
          '[&::-webkit-calendar-picker-indicator]:w-8',
          '[&::-webkit-calendar-picker-indicator]:h-full',
          '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
          '[&::-webkit-calendar-picker-indicator]:absolute',
          '[&::-webkit-calendar-picker-indicator]:right-0',
          '[&::-webkit-calendar-picker-indicator]:top-0',
        ].join(' ')}
      />
      {/* Decorative icon — pointer-events-none so clicks fall through to the invisible indicator */}
      {type === 'datetime-local' ? (
        <CalendarClock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-mid pointer-events-none" />
      ) : (
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-mid pointer-events-none" />
      )}
    </div>
  )
}
