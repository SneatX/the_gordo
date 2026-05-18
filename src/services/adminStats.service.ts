import { supabase, type Result } from '@/lib/supabase'
import type { AdminStats } from '@/types'

export const adminStatsService = {
  get: async (): Promise<Result<AdminStats>> => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString()

    const [totalRes, todayRes, tablesRes] = await Promise.all([
      supabase.from('reservations').select('*', { count: 'exact', head: true }),
      supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', todayStart)
        .lte('start_time', todayEnd),
      supabase
        .from('restaurant_tables')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
    ])

    if (totalRes.error) return { ok: false, error: totalRes.error.message }
    if (todayRes.error) return { ok: false, error: todayRes.error.message }
    if (tablesRes.error) return { ok: false, error: tablesRes.error.message }

    return {
      ok: true,
      data: {
        totalReservations: totalRes.count ?? 0,
        todayReservations: todayRes.count ?? 0,
        activeTables: tablesRes.count ?? 0,
      },
    }
  },
}
