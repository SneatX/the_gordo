import { supabase, type Result } from '@/lib/supabase'
import type { Reservation, ReservationStatus, Tables } from '@/types'

type ReservationRow = Tables<'reservations'>

const toDomain = (row: ReservationRow): Reservation => {
  const startTime = new Date(row.start_time)
  const endTime = new Date(startTime.getTime() + row.duration_minutes * 60_000)
  return {
    id: row.id,
    tableId: row.table_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    partySize: row.party_size,
    startTime,
    durationMinutes: row.duration_minutes,
    endTime,
    status: row.status as ReservationStatus,
    createdAt: new Date(row.created_at),
  }
}

export type ReservationFilters = {
  search?: string
  status?: ReservationStatus | 'all'
  dateFrom?: string
  dateTo?: string
}

export const reservationService = {
  getAll: async (): Promise<Result<Reservation[]>> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('start_time', { ascending: false })
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.map(toDomain) }
  },

  getFiltered: async (
    filters: ReservationFilters,
    page: number,
    pageSize: number,
  ): Promise<Result<{ data: Reservation[]; total: number }>> => {
    let query = supabase
      .from('reservations')
      .select('*', { count: 'exact' })
      .order('start_time', { ascending: false })

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters.dateFrom) {
      query = query.gte('start_time', `${filters.dateFrom}T00:00:00`)
    }
    if (filters.dateTo) {
      query = query.lte('start_time', `${filters.dateTo}T23:59:59`)
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim()
      query = query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`)
    }

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, error, count } = await query
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { data: (data ?? []).map(toDomain), total: count ?? 0 } }
  },

  getById: async (id: string): Promise<Result<Reservation>> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  getByTable: async (tableId: string): Promise<Result<Reservation[]>> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('table_id', tableId)
      .order('start_time', { ascending: false })
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.map(toDomain) }
  },

  create: async (
    tableId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
  ): Promise<Result<Reservation>> => {
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        table_id: tableId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        party_size: partySize,
        start_time: startTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .select()
      .maybeSingle()
    if (error) return { ok: false, error: error.message }
    if (!data) return { ok: false, error: 'No se pudo crear la reserva (verificá los permisos RLS)' }
    return { ok: true, data: toDomain(data) }
  },

  update: async (
    id: string,
    tableId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
    status: ReservationStatus,
  ): Promise<Result<Reservation>> => {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        table_id: tableId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        party_size: partySize,
        start_time: startTime.toISOString(),
        duration_minutes: durationMinutes,
        status,
      })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) return { ok: false, error: error.message }
    if (!data) return { ok: false, error: 'No se pudo actualizar la reserva (verificá los permisos RLS)' }
    return { ok: true, data: toDomain(data) }
  },

  delete: async (id: string): Promise<Result<void>> => {
    const { error } = await supabase.from('reservations').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: undefined }
  },
}
