import { useState, useEffect, useCallback } from 'react'
import { locationController } from '@/controllers/location.controller'
import type { Location } from '@/types'

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await locationController.getAll()
    if (res.ok) setLocations(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { locations, loading, reload: load }
}
