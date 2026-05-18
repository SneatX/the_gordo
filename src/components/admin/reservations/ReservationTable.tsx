import { ArrowUp, ArrowDown, Pencil, Ban } from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'
import TableSkeleton from '@/components/ui/TableSkeleton'
import TablePagination from '@/components/ui/TablePagination'
import { STATUS_LABEL, STATUS_STYLE } from './types'
import type { Reservation } from '@/types'

interface Props {
  reservations: Reservation[]
  loading: boolean
  hasFilters: boolean
  cacheKey: string
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (v: 'asc' | 'desc') => void
  onSortToggle: () => void
  tableNumber: (id: string) => number | string
  onEdit: (r: Reservation) => void
  onCancel: (r: Reservation) => void
  total: number
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export default function ReservationTable({
  reservations, loading, hasFilters, cacheKey,
  sortOrder, onSortToggle,
  tableNumber, onEdit, onCancel,
  total, page, pageSize, onPageChange, onPageSizeChange,
}: Props) {
  return (
    <>
      {loading ? (
        <TableSkeleton cols={7} />
      ) : (
        <div
          key={cacheKey}
          className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F] animate-fade-in"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed">
              <thead className="bg-brand-orange">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[180px]">Cliente</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[72px]">Mesa</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[80px]">Personas</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[140px]">
                    <button
                      onClick={onSortToggle}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      Fecha y hora
                      {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[88px]">Duración</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[110px]">Estado</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center font-display text-stone-mid">
                      {hasFilters ? 'Sin resultados para los filtros aplicados' : 'No hay reservas registradas'}
                    </td>
                  </tr>
                )}
                {reservations.map((r) => (
                  <tr key={r.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                    <td className="px-4 py-3 max-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-stone-dark truncate">{r.customerName}</p>
                      <p className="text-xs text-stone-mid truncate">{r.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-stone-dark">#{tableNumber(r.tableId)}</td>
                    <td className="px-4 py-3 text-sm text-stone-dark">{r.partySize}</td>
                    <td className="px-4 py-3 text-sm text-stone-dark">
                      {r.startTime.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}{' '}
                      {r.startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-mid">{r.durationMinutes} min</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border-2 ${STATUS_STYLE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Tooltip text="Editar reserva">
                          <button
                            onClick={() => onEdit(r)}
                            className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        {r.status === 'active' && (
                          <Tooltip text="Cancelar reserva">
                            <button
                              onClick={() => onCancel(r)}
                              className="p-1.5 rounded-lg hover:bg-brand-red/10 text-brand-red transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
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
