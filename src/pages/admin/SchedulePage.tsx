import { useSchedules } from '@/hooks/useSchedules'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function SchedulePage() {
  const { schedules, loading, error } = useSchedules()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {schedules.map((s) => (
        <li key={s.id}>
          {DAYS[s.dayOfWeek]} — {s.startTime} a {s.endTime} — {s.isActive ? 'activo' : 'inactivo'}
        </li>
      ))}
    </ul>
  )
}
