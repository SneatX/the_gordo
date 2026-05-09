import { reservationService } from '@/services/reservation.service'
import type { Result, Reservation, ReservationStatus } from '@/types'

export const reservationController = {
  getAll: (): Promise<Result<Reservation[]>> => reservationService.getAll(),
  getById: (id: string): Promise<Result<Reservation>> => reservationService.getById(id),
  getByTable: (tableId: string): Promise<Result<Reservation[]>> =>
    reservationService.getByTable(tableId),
  create: (
    tableId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
  ): Promise<Result<Reservation>> =>
    reservationService.create(
      tableId,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      startTime,
      durationMinutes,
    ),
  update: (
    id: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
    status: ReservationStatus,
  ): Promise<Result<Reservation>> =>
    reservationService.update(
      id,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      startTime,
      durationMinutes,
      status,
    ),
  delete: (id: string): Promise<Result<void>> => reservationService.delete(id),
}
