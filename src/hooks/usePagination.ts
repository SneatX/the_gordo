import { useState, useMemo } from 'react'

export function usePagination<T>(items: T[], defaultPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeRaw] = useState(defaultPageSize)

  const totalPages = Math.ceil(items.length / pageSize)
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1

  const paginated = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  )

  const setPageSize = (size: number) => {
    setPageSizeRaw(size)
    setPage(1)
  }

  return {
    page: safePage,
    pageSize,
    setPage,
    setPageSize,
    paginated,
    total: items.length,
  }
}
