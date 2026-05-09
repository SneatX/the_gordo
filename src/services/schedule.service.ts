import { supabase, type Result } from '@/lib/supabase'
import type { Schedule, Tables } from '@/types'

type ScheduleRow = Tables<'schedules'>

const toDomain = (row: ScheduleRow): Schedule => ({
  id: row.id,
  dayOfWeek: row.day_of_week,
  startTime: row.start_time,
  endTime: row.end_time,
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
})

export const scheduleService = {
  getAll: async (): Promise<Result<Schedule[]>> => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('day_of_week')
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.map(toDomain) }
  },

  getById: async (id: string): Promise<Result<Schedule>> => {
    const { data, error } = await supabase.from('schedules').select('*').eq('id', id).single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  create: async (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean,
  ): Promise<Result<Schedule>> => {
    const { data, error } = await supabase
      .from('schedules')
      .insert({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, is_active: isActive })
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  update: async (
    id: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean,
  ): Promise<Result<Schedule>> => {
    const { data, error } = await supabase
      .from('schedules')
      .update({ day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, is_active: isActive })
      .eq('id', id)
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  delete: async (id: string): Promise<Result<void>> => {
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: undefined }
  },
}
