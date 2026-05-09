import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) throw new Error('Missing Supabase environment variables')

export const supabase = createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
})

export type Result<T> =
    | { ok: true; data: T }
    | { ok: false; error: string }