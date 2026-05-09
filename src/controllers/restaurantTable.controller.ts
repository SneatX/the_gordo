import { restaurantTableService } from '@/services/restaurantTable.service'
import type { Result, RestaurantTable, TableStatus } from '@/types'

export const restaurantTableController = {
  getAll: (): Promise<Result<RestaurantTable[]>> => restaurantTableService.getAll(),
  getById: (id: string): Promise<Result<RestaurantTable>> => restaurantTableService.getById(id),
  getByLocation: (locationId: string): Promise<Result<RestaurantTable[]>> =>
    restaurantTableService.getByLocation(locationId),
  create: (
    number: number,
    capacity: number,
    locationId: string | null,
  ): Promise<Result<RestaurantTable>> => restaurantTableService.create(number, capacity, locationId),
  update: (
    id: string,
    number: number,
    capacity: number,
    locationId: string | null,
    status: TableStatus,
  ): Promise<Result<RestaurantTable>> =>
    restaurantTableService.update(id, number, capacity, locationId, status),
  delete: (id: string): Promise<Result<void>> => restaurantTableService.delete(id),
}
