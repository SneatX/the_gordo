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

  useEffect(() => { load() }, [load])

  const create = async (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean,
  ): Promise<string | null> => {
    const res = await scheduleController.create(dayOfWeek, startTime, endTime, isActive)
    if (!res.ok) return res.error
    setSchedules((prev) => [...prev, res.data].sort((a, b) => a.dayOfWeek - b.dayOfWeek))
    return null
  }

  const update = async (
    id: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean,
  ): Promise<string | null> => {
    const res = await scheduleController.update(id, dayOfWeek, startTime, endTime, isActive)
    if (!res.ok) return res.error
    setSchedules((prev) => prev.map((s) => (s.id === id ? res.data : s)))
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await scheduleController.delete(id)
    if (!res.ok) return res.error
    setSchedules((prev) => prev.filter((s) => s.id !== id))
    return null
  }

  return { schedules, loading, error, reload: load, create, update, remove }
}
