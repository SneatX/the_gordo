import { supabase, type Result } from '@/lib/supabase'
import type { Location } from '@/types'
import type { Tables } from '@/types'

type LocationRow = Tables<'locations'>

const toDomain = (row: LocationRow): Location => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdAt: new Date(row.created_at),
})

export const locationService = {
  getAll: async (): Promise<Result<Location[]>> => {
    const { data, error } = await supabase.from('locations').select('*').order('name')
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.map(toDomain) }
  },

  getById: async (id: string): Promise<Result<Location>> => {
    const { data, error } = await supabase.from('locations').select('*').eq('id', id).single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: toDomain(data) }
  },

  create: async (name: string, description: string | null): Promise<Result<Location>> => {
    const { data, error } = await supabase
      .from('locations')
      .insert({ name, description })
      .select()
      .maybeSingle()
    if (error) return { ok: false, error: error.message }
    if (!data) return { ok: false, error: 'No se pudo crear la ubicación (verificá los permisos RLS)' }
    return { ok: true, data: toDomain(data) }
  },

  update: async (
    id: string,
    name: string,
    description: string | null,
  ): Promise<Result<Location>> => {
    const { data, error } = await supabase
      .from('locations')
      .update({ name, description })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) return { ok: false, error: error.message }
    if (!data) return { ok: false, error: 'No se pudo actualizar la ubicación (verificá los permisos RLS)' }
    return { ok: true, data: toDomain(data) }
  },

  delete: async (id: string): Promise<Result<void>> => {
    const { error } = await supabase.from('locations').delete().eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: undefined }
  },
}
