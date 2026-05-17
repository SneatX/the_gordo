import { reservationService } from '@/services/reservation.service'
import { restaurantTableService } from '@/services/restaurantTable.service'
import { scheduleService } from '@/services/schedule.service'
import { toAmPm } from '@/utils/time'
import type { Result, Reservation, ReservationStatus, RestaurantTable } from '@/types'

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const checkSchedule = async (
  startTime: Date,
  durationMinutes: number,
): Promise<string | null> => {
  const res = await scheduleService.getAll()
  if (!res.ok) return res.error

  const dayOfWeek = startTime.getDay()
  const schedule = res.data.find((s) => s.dayOfWeek === dayOfWeek && s.isActive)

  if (!schedule) return 'El restaurante no tiene horario activo para ese día'

  const resStart = toMinutes(
    `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
  )
  const resEnd = resStart + durationMinutes
  const open = toMinutes(schedule.startTime)
  const close = toMinutes(schedule.endTime)

  if (resStart < open) return `El restaurante abre a las ${toAmPm(schedule.startTime)} ese día`
  if (resEnd > close) return `La reserva excede el horario de cierre (${toAmPm(schedule.endTime)})`

  return null
}

const checkTableAvailability = async (
  tableId: string,
  startTime: Date,
  durationMinutes: number,
  excludeId?: string,
): Promise<string | null> => {
  const res = await reservationService.getByTable(tableId)
  if (!res.ok) return res.error

  const newStart = startTime.getTime()
  const newEnd = newStart + durationMinutes * 60_000

  const conflict = res.data.find((r) => {
    if (excludeId && r.id === excludeId) return false
    if (r.status !== 'active') return false
    const existStart = r.startTime.getTime()
    const existEnd = existStart + r.durationMinutes * 60_000
    return newStart < existEnd && newEnd > existStart
  })

  if (conflict) return 'La mesa ya tiene una reserva activa en ese horario'
  return null
}

export const reservationController = {
  getAll: (): Promise<Result<Reservation[]>> => reservationService.getAll(),

  getById: (id: string): Promise<Result<Reservation>> => reservationService.getById(id),

  getByTable: (tableId: string): Promise<Result<Reservation[]>> =>
    reservationService.getByTable(tableId),

  create: async (
    tableId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
  ): Promise<Result<Reservation>> => {
    const scheduleErr = await checkSchedule(startTime, durationMinutes)
    if (scheduleErr) return { ok: false, error: scheduleErr }
    const conflict = await checkTableAvailability(tableId, startTime, durationMinutes)
    if (conflict) return { ok: false, error: conflict }
    return reservationService.create(
      tableId, customerName, customerEmail, customerPhone,
      partySize, startTime, durationMinutes,
    )
  },

  update: async (
    id: string,
    tableId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
    status: ReservationStatus,
  ): Promise<Result<Reservation>> => {
    const scheduleErr = await checkSchedule(startTime, durationMinutes)
    if (scheduleErr) return { ok: false, error: scheduleErr }
    const conflict = await checkTableAvailability(tableId, startTime, durationMinutes, id)
    if (conflict) return { ok: false, error: conflict }
    return reservationService.update(
      id, tableId, customerName, customerEmail, customerPhone,
      partySize, startTime, durationMinutes, status,
    )
  },

  delete: (id: string): Promise<Result<void>> => reservationService.delete(id),

  getAvailableTables: async (
    startTime: Date,
    durationMinutes: number,
    minCapacity: number,
  ): Promise<Result<RestaurantTable[]>> => {
    const [tablesRes, reservationsRes] = await Promise.all([
      restaurantTableService.getAll(),
      reservationService.getAll(),
    ])
    if (!tablesRes.ok) return tablesRes
    if (!reservationsRes.ok) return reservationsRes

    const newStart = startTime.getTime()
    const newEnd = newStart + durationMinutes * 60_000

    const available = tablesRes.data
      .filter((t) => t.status === 'active' && t.capacity >= minCapacity)
      .filter((table) => {
        return !reservationsRes.data.some((r) => {
          if (r.tableId !== table.id || r.status !== 'active') return false
          const existStart = r.startTime.getTime()
          const existEnd = existStart + r.durationMinutes * 60_000
          return newStart < existEnd && newEnd > existStart
        })
      })

    return { ok: true, data: available }
  },
}
