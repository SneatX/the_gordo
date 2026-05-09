import { useState, useEffect, useCallback } from 'react'
import { reservationController } from '@/controllers/reservation.controller'
import type { Reservation } from '@/types'

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

  useEffect(() => {
    load()
  }, [load])

  return { reservations, loading, error, reload: load }
}
