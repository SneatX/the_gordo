import { useReservations } from '@/hooks/useReservations'

export default function ReservationPage() {
  const { reservations, loading, error } = useReservations()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {reservations.map((r) => (
        <li key={r.id}>
          {r.customerName} — mesa {r.tableId} — {r.startTime.toLocaleString()} ({r.partySize} personas) — {r.status}
        </li>
      ))}
    </ul>
  )
}
