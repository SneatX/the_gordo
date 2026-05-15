import { useState } from 'react'
import { MapPin, ChevronDown, Check } from 'lucide-react'
import type { RestaurantTable } from '@/types'

interface LocationAccordionProps {
  locationName: string
  tables: RestaurantTable[]
  selectedTableId: string
  onSelect: (id: string) => void
}

export default function LocationAccordion({
  locationName,
  tables,
  selectedTableId,
  onSelect,
}: LocationAccordionProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border-2 border-stone-dark/30 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-warm hover:bg-bg-cream transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0" />
          <span className="font-display font-bold text-stone-dark text-sm">{locationName}</span>
          <span className="text-xs text-stone-mid font-display">({tables.length})</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-mid transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border-t-2 border-stone-dark/20">
          {tables.map((table) => {
            const selected = table.id === selectedTableId
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => onSelect(table.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all
                  ${selected
                    ? 'border-brand-orange bg-brand-orange/10 shadow-[3px_3px_0px_#F97316]'
                    : 'border-stone-dark/40 bg-bg-cream hover:border-stone-dark hover:bg-bg-warm'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-black text-stone-dark text-base">
                    Mesa #{table.number}
                  </span>
                  {selected && (
                    <span className="w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
                <span className="text-stone-mid text-sm font-display">
                  Hasta {table.capacity} {table.capacity === 1 ? 'persona' : 'personas'}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
