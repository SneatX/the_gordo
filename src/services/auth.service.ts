import { supabase, type Result } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const authService = {
  signIn: async (email: string, password: string): Promise<Result<Session>> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.session }
  },

  signUp: async (email: string, password: string): Promise<Result<User>> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { ok: false, error: error.message }
    if (!data.user) return { ok: false, error: 'No se pudo crear el usuario' }
    return { ok: true, data: data.user }
  },

  signOut: async (): Promise<Result<void>> => {
    const { error } = await supabase.auth.signOut()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: undefined }
  },

  getSession: async (): Promise<Result<Session | null>> => {
    const { data, error } = await supabase.auth.getSession()
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data.session }
  },
}
