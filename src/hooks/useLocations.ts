import { useState, useEffect, useCallback } from 'react'
import { locationController } from '@/controllers/location.controller'
import type { Location } from '@/types'

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await locationController.getAll()
    if (res.ok) setLocations(res.data)
    else setError(res.error)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (name: string, description: string | null): Promise<string | null> => {
    const res = await locationController.create(name, description)
    if (!res.ok) return res.error
    setLocations((prev) => [...prev, res.data])
    return null
  }

  const update = async (id: string, name: string, description: string | null): Promise<string | null> => {
    const res = await locationController.update(id, name, description)
    if (!res.ok) return res.error
    setLocations((prev) => prev.map((l) => (l.id === id ? res.data : l)))
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await locationController.delete(id)
    if (!res.ok) return res.error
    setLocations((prev) => prev.filter((l) => l.id !== id))
    return null
  }

  return { locations, loading, error, reload: load, create, update, remove }
}
