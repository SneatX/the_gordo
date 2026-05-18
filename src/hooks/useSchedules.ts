import { useState, useEffect, useCallback } from 'react'
import { scheduleService } from '@/services/schedule.service'
import { scheduleController } from '@/controllers/schedule.controller'
import type { Schedule } from '@/types'

export const useSchedules = (page?: number, pageSize?: number) => {
  const paginated = page !== undefined && pageSize !== undefined

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (paginated) {
      const res = await scheduleService.getFiltered(page, pageSize)
      if (res.ok) { setSchedules(res.data.data); setTotal(res.data.total) }
    } else {
      const res = await scheduleController.getAll()
      if (res.ok) { setSchedules(res.data); setTotal(res.data.length) }
    }
    setLoading(false)
  }, [page, pageSize])

  useEffect(() => { load() }, [load])

  const create = async (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean,
  ): Promise<string | null> => {
    const res = await scheduleController.create(dayOfWeek, startTime, endTime, isActive)
    if (!res.ok) return res.error
    if (paginated) await load()
    else setSchedules((prev) => [...prev, res.data].sort((a, b) => a.dayOfWeek - b.dayOfWeek))
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
    if (paginated) await load()
    else setSchedules((prev) => prev.map((s) => (s.id === id ? res.data : s)))
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await scheduleController.delete(id)
    if (!res.ok) return res.error
    if (paginated) await load()
    else setSchedules((prev) => prev.filter((s) => s.id !== id))
    return null
  }

  return { schedules, total, loading, reload: load, create, update, remove }
}
