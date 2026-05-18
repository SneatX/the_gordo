import { ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'
import TableSkeleton from '@/components/ui/TableSkeleton'
import TablePagination from '@/components/ui/TablePagination'
import type { Location } from '@/types'

interface Props {
  paginated: Location[]
  loading: boolean
  cacheKey: string
  sortOrder: 'asc' | 'desc'
  onSortToggle: () => void
  onEdit: (loc: Location) => void
  onDelete: (id: string) => void
  total: number
  page: number
  pageSize: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}

export default function LocationTable({
  paginated, loading, cacheKey,
  sortOrder, onSortToggle,
  onEdit, onDelete,
  total, page, pageSize, onPageChange, onPageSizeChange,
}: Props) {
  return (
    <>
      {loading ? (
        <TableSkeleton cols={3} />
      ) : (
        <div
          key={cacheKey}
          className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F] animate-fade-in"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px]">
              <thead className="bg-brand-orange">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">
                    <button
                      onClick={onSortToggle}
                      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      Nombre
                      {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Descripción</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center font-display text-stone-mid">
                      No hay ubicaciones registradas
                    </td>
                  </tr>
                )}
                {paginated.map((loc) => (
                  <tr key={loc.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-stone-dark">{loc.name}</td>
                    <td className="px-4 py-3 text-sm text-stone-mid">{loc.description ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Tooltip text="Editar ubicación">
                          <button
                            onClick={() => onEdit(loc)}
                            className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Eliminar ubicación">
                          <button
                            onClick={() => onDelete(loc.id)}
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
