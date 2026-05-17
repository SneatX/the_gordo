import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AdminStats } from '@/types'

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalReservations: 0,
    todayReservations: 0,
    activeTables: 0,
  })

  const load = useCallback(async () => {
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

    setStats({
      totalReservations: totalRes.count ?? 0,
      todayReservations: todayRes.count ?? 0,
      activeTables: tablesRes.count ?? 0,
    })
  }, [])

  useEffect(() => {
    load()

    // Realtime subscription — update stats on any change to reservations or tables
    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  return stats
}
