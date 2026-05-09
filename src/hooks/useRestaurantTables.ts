import { useState, useEffect, useCallback } from 'react'
import { restaurantTableController } from '@/controllers/restaurantTable.controller'
import type { RestaurantTable } from '@/types'

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

  useEffect(() => {
    load()
  }, [load])

  return { tables, loading, error, reload: load }
}
