import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'
import TableSkeleton from '@/components/ui/TableSkeleton'
import TablePagination from '@/components/ui/TablePagination'
import { STATUS_LABEL } from './types'
import type { StatusFilter } from './types'
import type { RestaurantTable } from '@/types'

interface Props {
  tables: RestaurantTable[]
  loading: boolean
  statusFilter: StatusFilter
  cacheKey: string
  sortOrder: 'asc' | 'desc'
  onSortToggle: () => void
  locationName: (id: string | null) => string
  onEdit: (table: RestaurantTable) => void
  onDelete: (id: string) => void
  total: number
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export default function TableList({
  tables, loading, statusFilter, cacheKey,
  sortOrder, onSortToggle,
  locationName, onEdit, onDelete,
  total, page, pageSize, onPageChange, onPageSizeChange,
}: Props) {
  return (
    <>
      {loading ? (
        <TableSkeleton cols={5} />
      ) : (
        <div
          key={cacheKey}
          className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F] animate-fade-in"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-brand-orange">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">
                    <button
                      onClick={onSortToggle}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      Mesa
                      {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Capacidad</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Ubicación</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Estado</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {tables.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center font-display text-stone-mid">
                      {statusFilter !== 'all' ? 'Sin mesas con ese estado' : 'No hay mesas registradas'}
                    </td>
                  </tr>
                )}
                {tables.map((t) => (
                  <tr key={t.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-stone-dark">#{t.number}</td>
                    <td className="px-4 py-3 text-sm text-stone-dark">{t.capacity} personas</td>
                    <td className="px-4 py-3 text-sm text-stone-mid">{locationName(t.locationId)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border-2
                        ${t.status === 'active'
                          ? 'bg-brand-yellow/30 border-brand-yellow-dark text-stone-dark'
                          : 'bg-brand-red/10 border-brand-red text-brand-red'
                        }`}>
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Tooltip text="Editar mesa">
                          <button
                            onClick={() => onEdit(t)}
                            className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Eliminar mesa">
                          <button
                            onClick={() => onDelete(t.id)}
                            className="p-1.5 rounded-lg hover:bg-brand-red/10 text-brand-red transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TablePagination
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={loading}
      />
    </>
  )
}
