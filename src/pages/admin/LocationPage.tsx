import { useLocations } from '@/hooks/useLocations'

export default function LocationsPage() {
  const { locations, loading } = useLocations()

  console.log(locations)
  if (loading) return <div>Cargando...</div>

  return (
    <ul>
      {locations.map((l) => (
        <li key={l.id}>{l.name}</li>
      ))}
    </ul>
  )
}
