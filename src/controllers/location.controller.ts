import { locationService } from '@/services/location.service'
import type { Result, Location } from '@/types'

export const locationController = {
  getAll: (): Promise<Result<Location[]>> => locationService.getAll(),
  getById: (id: string): Promise<Result<Location>> => locationService.getById(id),
  create: (name: string, description: string | null): Promise<Result<Location>> =>
    locationService.create(name, description),
  update: (id: string, name: string, description: string | null): Promise<Result<Location>> =>
    locationService.update(id, name, description),
  delete: (id: string): Promise<Result<void>> => locationService.delete(id),
}
