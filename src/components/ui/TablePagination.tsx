import { ChevronLeft, ChevronRight } from 'lucide-react'
import CustomSelect from './CustomSelect'
import type { TablePaginationProps } from '@/components/ui/types'

const PAGE_SIZES = [5, 10, 15, 20]

function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export default function TablePagination({ total, page, pageSize, onPageChange, onPageSizeChange, loading }: TablePaginationProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 animate-pulse">
        <div className="h-4 w-36 bg-stone-dark/10 rounded-full" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-8 bg-stone-dark/10 rounded-lg" />
          ))}
        </div>
        <div className="h-8 w-32 bg-stone-dark/10 rounded-xl" />
      </div>
    )
  }

  if (total <= 5) return null

  const totalPages = Math.ceil(total / pageSize)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const btnBase =
    'h-8 min-w-[32px] px-2 rounded-lg font-display text-sm font-medium border-2 transition-all'
  const btnActive =
    'bg-brand-orange border-stone-dark text-white shadow-[2px_2px_0px_#78350F]'
  const btnInactive =
    'bg-white border-stone-dark/30 text-stone-dark hover:border-stone-dark hover:bg-bg-warm'
  const btnDisabled =
    'bg-white border-stone-dark/10 text-stone-dark/30 cursor-not-allowed'

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
      <p className="font-display text-sm text-stone-mid">
        Mostrando {from}–{to} de {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`}
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 font-display text-stone-mid text-sm">…</span>
          ) : (
            <button
              key={p}
              className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className={`${btnBase} ${page === totalPages ? btnDisabled : btnInactive}`}
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-display text-sm text-stone-mid">Por página:</span>
        <div className="w-24">
          <CustomSelect
            value={String(pageSize)}
            onChange={(v) => { onPageSizeChange(Number(v)); onPageChange(1) }}
            options={PAGE_SIZES.map((s) => ({ value: String(s), label: String(s) }))}
          />
        </div>
      </div>
    </div>
  )
}
