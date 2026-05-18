import { ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (v: 'asc' | 'desc') => void
}

const filterBtnBase = 'px-3 py-1.5 rounded-xl border-2 font-display text-sm font-medium transition-all'
const filterBtnActive = 'bg-brand-orange border-stone-dark text-white shadow-[2px_2px_0px_#78350F]'
const filterBtnInactive = 'bg-white border-stone-dark/30 text-stone-dark hover:border-stone-dark'

export default function LocationFilters({ sortOrder, onSortOrderChange }: Props) {
  return (
    <div className="bg-white border-4 border-stone-dark rounded-2xl px-4 py-3 shadow-[4px_4px_0px_#78350F] flex flex-wrap items-center gap-2">
      <span className="font-display text-sm text-stone-mid">Orden:</span>
      <button
        onClick={() => onSortOrderChange('asc')}
        className={`${filterBtnBase} flex items-center gap-1 ${sortOrder === 'asc' ? filterBtnActive : filterBtnInactive}`}
      >
        <ArrowUp className="w-3.5 h-3.5" /> Asc
      </button>
      <button
        onClick={() => onSortOrderChange('desc')}
        className={`${filterBtnBase} flex items-center gap-1 ${sortOrder === 'desc' ? filterBtnActive : filterBtnInactive}`}
      >
        <ArrowDown className="w-3.5 h-3.5" /> Desc
      </button>
    </div>
  )
}
