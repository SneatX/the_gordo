import { Search, X, ArrowUp, ArrowDown } from 'lucide-react'
import DateInput from '@/components/ui/DateInput'
import { STATUS_LABEL } from './types'
import type { StatusFilter } from './types'

interface Props {
  view: 'upcoming' | 'past' | 'all'
  onViewChange: (v: 'upcoming' | 'past' | 'all') => void
  search: string
  onSearchChange: (v: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (v: StatusFilter) => void
  dateFrom: string
  onDateFromChange: (v: string) => void
  dateTo: string
  onDateToChange: (v: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (v: 'asc' | 'desc') => void
  hasFilters: boolean
  onClearFilters: () => void
}

const filterBtnBase = 'px-3 py-1.5 rounded-xl border-2 font-display text-sm font-medium transition-all'
const filterBtnActive = 'bg-brand-orange border-stone-dark text-white shadow-[2px_2px_0px_#78350F]'
const filterBtnInactive = 'bg-white border-stone-dark/30 text-stone-dark hover:border-stone-dark'

export default function ReservationFilters({
  view, onViewChange,
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  sortOrder, onSortOrderChange,
  hasFilters, onClearFilters,
}: Props) {
  return (
    <div className="bg-white border-4 border-stone-dark rounded-2xl p-4 shadow-[4px_4px_0px_#78350F] space-y-3">

      <div className="flex gap-1 p-1 bg-bg-warm rounded-xl w-fit border-2 border-stone-dark/20">
        <button
          onClick={() => onViewChange('upcoming')}
          className={`px-4 py-1.5 rounded-lg font-display font-semibold text-sm transition-all ${
            view === 'upcoming'
              ? 'bg-brand-orange text-white shadow-[2px_2px_0px_#78350F]'
              : 'text-stone-dark hover:bg-white'
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => onViewChange('past')}
          className={`px-4 py-1.5 rounded-lg font-display font-semibold text-sm transition-all ${
            view === 'past'
              ? 'bg-brand-orange text-white shadow-[2px_2px_0px_#78350F]'
              : 'text-stone-dark hover:bg-white'
          }`}
        >
          Anteriores
        </button>
        <button
          onClick={() => onViewChange('all')}
          className={`px-4 py-1.5 rounded-lg font-display font-semibold text-sm transition-all ${
            view === 'all'
              ? 'bg-brand-orange text-white shadow-[2px_2px_0px_#78350F]'
              : 'text-stone-dark hover:bg-white'
          }`}
        >
          Todas
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-mid pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-2 border-stone-dark/30 rounded-xl pl-9 pr-3 py-2 text-sm font-display focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-display text-sm text-stone-mid whitespace-nowrap">Desde:</label>
          <DateInput
            value={dateFrom}
            onChange={(v) => {
              onDateFromChange(v)
              if (dateTo && dateTo < v) onDateToChange('')
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-display text-sm text-stone-mid whitespace-nowrap">Hasta:</label>
          <DateInput
            value={dateTo}
            min={dateFrom || undefined}
            onChange={onDateToChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-sm text-stone-mid">Estado:</span>
        {(['all', 'active', 'cancelled', 'completed'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => onStatusFilterChange(s)}
            className={`${filterBtnBase} ${statusFilter === s ? filterBtnActive : filterBtnInactive}`}
          >
            {s === 'all' ? 'Todos' : STATUS_LABEL[s]}
          </button>
        ))}
        <div className="w-px h-5 bg-stone-dark/20 mx-1" />
        <span className="font-display text-sm text-stone-mid">Fecha:</span>
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
        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-stone-dark/30 font-display text-sm text-stone-mid hover:border-stone-dark hover:text-stone-dark transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
