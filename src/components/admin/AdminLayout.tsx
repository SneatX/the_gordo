import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutGrid, Clock, MapPin, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useReservations } from '@/hooks/useReservations'
import { useRestaurantTables } from '@/hooks/useRestaurantTables'

const NAV_ITEMS = [
  { to: '/admin/reservas', label: 'Reservas', Icon: CalendarDays },
  { to: '/admin/mesas', label: 'Mesas', Icon: LayoutGrid },
  { to: '/admin/horarios', label: 'Horarios', Icon: Clock },
  { to: '/admin/ubicaciones', label: 'Ubicaciones', Icon: MapPin },
]

function StatChip({ label, value, color, to }: { label: string; value: number | string; color: string; to: string }) {
  return (
    <Link
      to={to}
      className={`block rounded-xl border-2 border-stone-dark px-3 py-2 ${color} hover:shadow-[2px_2px_0px_#78350F] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all`}
    >
      <p className="font-display font-black text-xl leading-none">{value}</p>
      <p className="font-display text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </Link>
  )
}

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { reservations } = useReservations()
  const { tables } = useRestaurantTables()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]
  const todayStr = today.toDateString()
  const reservasHoy = reservations.filter((r) => r.startTime.toDateString() === todayStr).length
  const mesasDisponibles = tables.filter((t) => t.status === 'active').length

  return (
    <div className="flex min-h-screen bg-bg-cream">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col bg-white border-r-4 border-stone-dark">

        {/* Brand */}
        <div className="px-6 py-6 border-b-4 border-stone-dark">
          <p className="font-display text-2xl font-bold text-brand-orange leading-none">The Gordo</p>
          <p className="font-display text-sm text-stone-dark font-medium">Comidas Rápidas</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl font-display font-medium text-sm transition-all
                ${isActive
                  ? 'bg-brand-orange text-white shadow-[3px_3px_0px_#78350F]'
                  : 'text-stone-dark hover:bg-bg-warm'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Stats */}
        <div className="px-3 pb-3 border-t-4 border-stone-dark pt-4 space-y-2">
          <p className="px-1 font-display text-xs font-semibold text-stone-mid uppercase tracking-wide mb-3">
            Tiempo real
          </p>
          <div className="grid grid-cols-1 gap-2">
            <StatChip
              label="Reservas hoy"
              value={reservasHoy}
              color="bg-brand-yellow/30 text-stone-dark"
              to={`/admin/reservas?desde=${todayISO}&hasta=${todayISO}`}
            />
            <StatChip
              label="Total reservas"
              value={reservations.length}
              color="bg-brand-orange/10 text-stone-dark"
              to="/admin/reservas"
            />
            <StatChip
              label="Mesas disponibles"
              value={mesasDisponibles}
              color="bg-green-50 text-stone-dark"
              to="/admin/mesas?estado=activa"
            />
          </div>
        </div>

        {/* Sign out */}
        <div className="px-3 py-4 border-t-4 border-stone-dark space-y-2">
          <p className="px-4 text-xs text-stone-mid truncate">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-display font-medium text-sm text-stone-dark hover:bg-brand-red/10 hover:text-brand-red transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
