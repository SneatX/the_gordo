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

export const reservationService = {
  getAll: async (): Promise<Result<Reservation[]>> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('start_time', { ascending: false })
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.map(toDomain) }
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
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  update: async (
    id: string,
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
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  delete: async (id: string): Promise<Result<void>> => {
    const { error } = await supabase.from('reservations').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: undefined }
  },
}
