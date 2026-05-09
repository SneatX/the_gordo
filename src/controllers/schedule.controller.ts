import { scheduleService } from '@/services/schedule.service'
import type { Result, Schedule } from '@/types'

export const scheduleController = {
  getAll: (): Promise<Result<Schedule[]>> => scheduleService.getAll(),
  getById: (id: string): Promise<Result<Schedule>> => scheduleService.getById(id),
  create: (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean,
  ): Promise<Result<Schedule>> => scheduleService.create(dayOfWeek, startTime, endTime, isActive),
  update: (
    id: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean,
  ): Promise<Result<Schedule>> =>
    scheduleService.update(id, dayOfWeek, startTime, endTime, isActive),
  delete: (id: string): Promise<Result<void>> => scheduleService.delete(id),
}
