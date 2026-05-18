import { useState, useEffect, useCallback } from 'react'
import { reservationService, type ReservationFilters } from '@/services/reservation.service'
import { reservationController } from '@/controllers/reservation.controller'
import type { Result, Reservation, ReservationStatus, RestaurantTable } from '@/types'

export function useReservations(filters?: ReservationFilters, page?: number, pageSize?: number) {
  const paginated = page !== undefined && pageSize !== undefined

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(paginated)

  const load = useCallback(async () => {
    if (!paginated) return
    setLoading(true)
    const res = await reservationService.getFiltered(filters!, page, pageSize)
    if (res.ok) { setReservations(res.data.data); setTotal(res.data.total) }
    setLoading(false)
  }, [filters?.view, filters?.search, filters?.status, filters?.dateFrom, filters?.dateTo, filters?.sortOrder, page, pageSize])

  useEffect(() => { load() }, [load])

  const create = async (
    tableId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
  ): Promise<Result<Reservation>> => {
    const res = await reservationController.create(
      tableId, customerName, customerEmail, customerPhone, partySize, startTime, durationMinutes,
    )
    if (res.ok && paginated) await load()
    return res
  }

  const update = async (
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
    const res = await reservationController.update(
      id, tableId, customerName, customerEmail, customerPhone, partySize, startTime, durationMinutes, status,
    )
    if (res.ok && paginated) await load()
    return res
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await reservationController.delete(id)
    if (!res.ok) return res.error
    if (paginated) await load()
    return null
  }

  const searchAvailableTables = (
    startTime: Date,
    durationMinutes: number,
    minCapacity: number,
  ): Promise<Result<RestaurantTable[]>> =>
    reservationController.getAvailableTables(startTime, durationMinutes, minCapacity)

  return { reservations, total, loading, reload: load, create, update, remove, searchAvailableTables }
}
