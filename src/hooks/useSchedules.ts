import { useState, useEffect, useCallback } from 'react'
import { scheduleController } from '@/controllers/schedule.controller'
import type { Schedule } from '@/types'

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await scheduleController.getAll()
    if (res.ok) setSchedules(res.data)
    else setError(res.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { schedules, loading, error, reload: load }
}
