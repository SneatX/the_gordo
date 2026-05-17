import { useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutGrid, Clock, MapPin, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAdminStats } from '@/hooks/useAdminStats'
import Tooltip from '@/components/ui/Tooltip'

const NAV_ITEMS = [
  { to: '/admin/reservas', label: 'Reservas', Icon: CalendarDays },
  { to: '/admin/mesas', label: 'Mesas', Icon: LayoutGrid },
  { to: '/admin/horarios', label: 'Horarios', Icon: Clock },
  { to: '/admin/ubicaciones', label: 'Ubicaciones', Icon: MapPin },
]

function StatChip({ label, value, color, to }: { label: string; value: number; color: string; to: string }) {
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
  const { totalReservations, todayReservations, activeTables } = useAdminStats()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const todayISO = new Date().toISOString().split('T')[0]

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-bg-cream">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={[
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r-4 border-stone-dark overflow-y-auto',
        'transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:translate-x-0 md:shrink-0',
      ].join(' ')}>

        {/* Brand */}
        <div className="px-4 py-4 border-b-4 border-stone-dark flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="The Gordo"
            className="w-10 h-10 rounded-xl border-2 border-stone-dark object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display text-xl font-bold text-brand-orange leading-none truncate">The Gordo</p>
            <p className="font-display text-xs text-stone-dark font-medium">Comidas Rápidas</p>
          </div>
          <Tooltip text="Cerrar menú" side="bottom">
            <button
              onClick={closeSidebar}
              className="ml-auto p-1 rounded-lg hover:bg-bg-warm transition-colors md:hidden shrink-0"
            >
              <X className="w-4 h-4 text-stone-dark" />
            </button>
          </Tooltip>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
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
              value={todayReservations}
              color="bg-brand-yellow/30 text-stone-dark"
              to={`/admin/reservas?desde=${todayISO}&hasta=${todayISO}`}
            />
            <StatChip
              label="Total reservas"
              value={totalReservations}
              color="bg-brand-orange/10 text-stone-dark"
              to="/admin/reservas"
            />
            <StatChip
              label="Mesas disponibles"
              value={activeTables}
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
      <main className="flex-1 overflow-y-auto p-4 md:p-8 min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 mb-5 md:hidden">
          <Tooltip text="Abrir menú" side="bottom">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border-2 border-stone-dark bg-white shadow-[2px_2px_0px_#78350F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Menu className="w-5 h-5 text-stone-dark" />
            </button>
          </Tooltip>
          <img src="/logo.jpg" alt="The Gordo" className="w-8 h-8 rounded-lg border-2 border-stone-dark object-cover" />
          <p className="font-display text-lg font-bold text-brand-orange">The Gordo</p>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
