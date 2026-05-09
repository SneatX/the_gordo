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

  useEffect(() => {
    load()
  }, [load])

  return { locations, loading, error, reload: load }
}
