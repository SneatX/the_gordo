import { useState, useEffect, useCallback } from 'react'
import { reservationController } from '@/controllers/reservation.controller'
import type { Reservation, ReservationStatus } from '@/types'

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await reservationController.getAll()
    if (res.ok) setReservations(res.data)
    else setError(res.error)
    setLoading(false)
  }, [])

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
    setReservations((prev) => [res.data, ...prev])
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
    setReservations((prev) => prev.map((r) => (r.id === id ? res.data : r)))
    return null
  }

  const remove = async (id: string): Promise<string | null> => {
    const res = await reservationController.delete(id)
    if (!res.ok) return res.error
    setReservations((prev) => prev.filter((r) => r.id !== id))
    return null
  }

  return { reservations, loading, error, reload: load, create, update, remove }
}
