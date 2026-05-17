import { supabase, type Result } from '@/lib/supabase'
import type { RestaurantTable, TableStatus, Tables } from '@/types'

type RestaurantTableRow = Tables<'restaurant_tables'>

const toDomain = (row: RestaurantTableRow): RestaurantTable => ({
  id: row.id,
  number: row.number,
  capacity: row.capacity,
  locationId: row.location_id,
  status: row.status as TableStatus,
  createdAt: new Date(row.created_at),
})

export type TableFilters = {
  status?: TableStatus | 'all'
}

export const restaurantTableService = {
  getAll: async (): Promise<Result<RestaurantTable[]>> => {
    const { data, error } = await supabase.from('restaurant_tables').select('*').order('number')
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.map(toDomain) }
  },

  getFiltered: async (
    filters: TableFilters,
    page: number,
    pageSize: number,
  ): Promise<Result<{ data: RestaurantTable[]; total: number }>> => {
    let query = supabase
      .from('restaurant_tables')
      .select('*', { count: 'exact' })
      .order('number')

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, error, count } = await query
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { data: (data ?? []).map(toDomain), total: count ?? 0 } }
  },

  getById: async (id: string): Promise<Result<RestaurantTable>> => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  getByLocation: async (locationId: string): Promise<Result<RestaurantTable[]>> => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('location_id', locationId)
      .order('number')
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.map(toDomain) }
  },

  create: async (
    number: number,
    capacity: number,
    locationId: string | null,
  ): Promise<Result<RestaurantTable>> => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert({ number, capacity, location_id: locationId })
      .select()
      .maybeSingle()
    if (error) return { ok: false, error: error.message }
    if (!data) return { ok: false, error: 'No se pudo crear la mesa (verificá los permisos RLS)' }
    return { ok: true, data: toDomain(data) }
  },

  update: async (
    id: string,
    number: number,
    capacity: number,
    locationId: string | null,
    status: TableStatus,
  ): Promise<Result<RestaurantTable>> => {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .update({ number, capacity, location_id: locationId, status })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) return { ok: false, error: error.message }
    if (!data) return { ok: false, error: 'No se pudo actualizar la mesa (verificá los permisos RLS)' }
    return { ok: true, data: toDomain(data) }
  },

  delete: async (id: string): Promise<Result<void>> => {
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: undefined }
  },
}
