import { useRestaurantTables } from '@/hooks/useRestaurantTables'

export default function RestaurantTablePage() {
  const { tables, loading, error } = useRestaurantTables()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {tables.map((t) => (
        <li key={t.id}>
          Mesa {t.number} — capacidad {t.capacity} — {t.status}
        </li>
      ))}
    </ul>
  )
}
