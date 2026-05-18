import { useState, useEffect, useCallback } from 'react'
import { locationService } from '@/services/location.service'
import { locationController } from '@/controllers/location.controller'
import type { Location } from '@/types'

export const useLocations = (sortOrder?: 'asc' | 'desc', page?: number, pageSize?: number) => {
  const paginated = page !== undefined && pageSize !== undefined

  const [locations, setLocations] = useState<Location[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (paginated) {
      const res = await locationService.getFiltered(sortOrder ?? 'asc', page, pageSize)
      if (res.ok) { setLocations(res.data.data); setTotal(res.data.total) }
    } else {
      const res = await locationController.getAll()
      if (res.ok) { setLocations(res.data); setTotal(res.data.length) }
    }
    setLoading(false)
  }, [sortOrder, page, pageSize])

  useEffect(() => { load() }, [load])

  const create = async (name: string, description: string | null): Promise<string | null> => {
    const res = await locationController.create(name, description)
    if (!res.ok) return res.error
    if (paginated) await load()
    else setLocations((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
    return null
  }

  const update = async (id: string, name: string, description: string | null): Promise<string | null> => {
    const res = await locationController.update(id, name, description)
    if (!res.ok) return res.error
    if (paginated) await load()
    else setLocations((prev) => prev.map((l) => (l.id === id ? res.data : l)))
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await locationController.delete(id)
    if (!res.ok) return res.error
    if (paginated) await load()
    else setLocations((prev) => prev.filter((l) => l.id !== id))
    return null
  }

  return { locations, total, loading, reload: load, create, update, remove }
}
