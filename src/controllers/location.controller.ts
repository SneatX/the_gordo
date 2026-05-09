import { locationService } from '@/services/location.service'
import type { Result } from '@/lib/supabase'
import type { Location } from '@/types'

export const locationController = {
  getAll: async (): Promise<Result<Location[]>> => {
    return locationService.getAll()
  },
}
