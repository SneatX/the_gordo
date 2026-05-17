import { useState, useEffect, useCallback } from 'react'
import { reservationService, type ReservationFilters } from '@/services/reservation.service'
import { reservationController } from '@/controllers/reservation.controller'
import type { Reservation, ReservationStatus } from '@/types'

export function useReservationsAdmin(
  filters: ReservationFilters,
  page: number,
  pageSize: number,
) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await reservationService.getFiltered(filters, page, pageSize)
    if (res.ok) {
      setReservations(res.data.data)
      setTotal(res.data.total)
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.dateFrom, filters.dateTo, page, pageSize])

  useEffect(() => { load() }, [load])

  const create = async (
    tableId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    partySize: number,
    startTime: Date,
    durationMinutes: number,
  ): Promise<string | null> => {
    const res = await reservationController.create(
      tableId, customerName, customerEmail, customerPhone,
      partySize, startTime, durationMinutes,
    )
    if (!res.ok) return res.error
    await load()
    return null
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
  ): Promise<string | null> => {
    const res = await reservationController.update(
      id, tableId, customerName, customerEmail, customerPhone,
      partySize, startTime, durationMinutes, status,
    )
    if (!res.ok) return res.error
    await load()
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await reservationController.delete(id)
    if (!res.ok) return res.error
    await load()
    return null
  }

  return { reservations, total, loading, reload: load, create, update, remove }
}
