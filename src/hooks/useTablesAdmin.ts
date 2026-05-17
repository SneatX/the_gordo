import { useState, useEffect, useCallback } from 'react'
import { restaurantTableService, type TableFilters } from '@/services/restaurantTable.service'
import { restaurantTableController } from '@/controllers/restaurantTable.controller'
import type { RestaurantTable, TableStatus } from '@/types'

export function useTablesAdmin(filters: TableFilters, page: number, pageSize: number) {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await restaurantTableService.getFiltered(filters, page, pageSize)
    if (res.ok) {
      setTables(res.data.data)
      setTotal(res.data.total)
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, page, pageSize])

  useEffect(() => { load() }, [load])

  const create = async (
    number: number,
    capacity: number,
    locationId: string | null,
  ): Promise<string | null> => {
    const res = await restaurantTableController.create(number, capacity, locationId)
    if (!res.ok) return res.error
    await load()
    return null
  }

  const update = async (
    id: string,
    number: number,
    capacity: number,
    locationId: string | null,
    status: TableStatus,
  ): Promise<string | null> => {
    const res = await restaurantTableController.update(id, number, capacity, locationId, status)
    if (!res.ok) return res.error
    await load()
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await restaurantTableController.delete(id)
    if (!res.ok) return res.error
    await load()
    return null
  }

  return { tables, total, loading, reload: load, create, update, remove }
}
