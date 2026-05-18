import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { adminStatsService } from '@/services/adminStats.service'
import type { AdminStats } from '@/types'

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalReservations: 0,
    todayReservations: 0,
    activeTables: 0,
  })

  const load = useCallback(async () => {
    const res = await adminStatsService.get()
    if (res.ok) setStats(res.data)
  }, [])

  useEffect(() => {
    load()

    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  return stats
}
