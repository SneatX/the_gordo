import { Check } from 'lucide-react'
import type { StepIndicatorProps } from '@/components/reservation/types'
export type { Step } from '@/components/reservation/types'

const STEPS = [
  { n: 1, label: 'Fecha y personas' },
  { n: 2, label: 'Elige tu mesa' },
  { n: 3, label: 'Tus datos' },
] as const

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 justify-center mb-10">
      {STEPS.map(({ n, label }, i) => {
        const done = (typeof current === 'number' && current > n) || current === 'success'
        const active = current === n
        return (
          <div key={n} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full border-2 border-stone-dark flex items-center justify-center font-display font-bold text-sm transition-all
                  ${done ? 'bg-brand-orange text-white' : active ? 'bg-brand-yellow text-stone-dark' : 'bg-white text-stone-mid'}`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-display hidden sm:block ${active ? 'text-stone-dark font-semibold' : 'text-stone-mid'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-0.5 mb-4 ${done ? 'bg-brand-orange' : 'bg-stone-dark/20'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
