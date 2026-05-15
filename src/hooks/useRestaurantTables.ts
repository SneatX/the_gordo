import { useState, useEffect, useCallback } from 'react'
import { restaurantTableController } from '@/controllers/restaurantTable.controller'
import type { RestaurantTable, TableStatus } from '@/types'

export const useRestaurantTables = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await restaurantTableController.getAll()
    if (res.ok) setTables(res.data)
    else setError(res.error)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (
    number: number,
    capacity: number,
    locationId: string | null,
  ): Promise<string | null> => {
    const res = await restaurantTableController.create(number, capacity, locationId)
    if (!res.ok) return res.error
    setTables((prev) => [...prev, res.data])
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
    setTables((prev) => prev.map((t) => (t.id === id ? res.data : t)))
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await restaurantTableController.delete(id)
    if (!res.ok) return res.error
    setTables((prev) => prev.filter((t) => t.id !== id))
    return null
  }

  return { tables, loading, error, reload: load, create, update, remove }
}
