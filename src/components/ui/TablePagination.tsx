import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

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

export default function TablePagination({ total, page, pageSize, onPageChange, onPageSizeChange }: Props) {
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
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value))
            onPageChange(1)
          }}
          className="border-2 border-stone-dark rounded-xl px-2 py-1 text-sm font-display text-stone-dark focus:outline-none focus:border-brand-orange transition-colors bg-white"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
