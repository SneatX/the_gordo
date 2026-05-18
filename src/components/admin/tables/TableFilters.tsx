import { X, ArrowUp, ArrowDown } from 'lucide-react'
import { STATUS_LABEL } from './types'
import type { StatusFilter } from './types'

interface Props {
  statusFilter: StatusFilter
  onStatusFilterChange: (v: StatusFilter) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (v: 'asc' | 'desc') => void
}

const filterBtnBase = 'px-3 py-1.5 rounded-xl border-2 font-display text-sm font-medium transition-all'
const filterBtnActive = 'bg-brand-orange border-stone-dark text-white shadow-[2px_2px_0px_#78350F]'
const filterBtnInactive = 'bg-white border-stone-dark/30 text-stone-dark hover:border-stone-dark'

export default function TableFilters({ statusFilter, onStatusFilterChange, sortOrder, onSortOrderChange }: Props) {
  return (
    <div className="bg-white border-4 border-stone-dark rounded-2xl px-4 py-3 shadow-[4px_4px_0px_#78350F] flex flex-wrap items-center gap-2">
      <span className="font-display text-sm text-stone-mid">Estado:</span>
      {(['all', 'active', 'blocked'] as StatusFilter[]).map((s) => (
        <button
          key={s}
          onClick={() => onStatusFilterChange(s)}
          className={`${filterBtnBase} ${statusFilter === s ? filterBtnActive : filterBtnInactive}`}
        >
          {s === 'all' ? 'Todas' : STATUS_LABEL[s]}
        </button>
      ))}
      <div className="w-px h-5 bg-stone-dark/20 mx-1" />
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
      {statusFilter !== 'all' && (
        <button
          onClick={() => onStatusFilterChange('all')}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-stone-dark/30 font-display text-sm text-stone-mid hover:border-stone-dark hover:text-stone-dark transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  )
}
