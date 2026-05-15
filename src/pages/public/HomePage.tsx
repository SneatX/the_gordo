import { Link } from 'react-router-dom'
import { UtensilsCrossed, Clock, MapPin } from 'lucide-react'
import { useSchedules } from '@/hooks/useSchedules'
import type { Schedule } from '@/types'

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const toAmPm = (hhmm: string): string => {
  const [hStr, mStr] = hhmm.split(':')
  const h = parseInt(hStr, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${mStr} ${ampm}`
}

function groupSchedules(schedules: Schedule[]) {
  const active = schedules.filter((s) => s.isActive).sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  if (active.length === 0) return []

  const groups: { days: number[]; startTime: string; endTime: string }[] = []
  for (const s of active) {
    const last = groups[groups.length - 1]
    if (
      last &&
      last.startTime === s.startTime &&
      last.endTime === s.endTime &&
      last.days[last.days.length - 1] === s.dayOfWeek - 1
    ) {
      last.days.push(s.dayOfWeek)
    } else {
      groups.push({ days: [s.dayOfWeek], startTime: s.startTime, endTime: s.endTime })
    }
  }

  return groups.map((g) => {
    const first = DAY_NAMES[g.days[0]]
    const last = DAY_NAMES[g.days[g.days.length - 1]]
    const label =
      g.days.length === 1 ? first :
      g.days.length === 2 ? `${first} y ${last}` :
      `${first} a ${last}`
    return { label, hours: `${toAmPm(g.startTime)} – ${toAmPm(g.endTime)}` }
  })
}

export default function HomePage() {
  const { schedules, loading: schedulesLoading } = useSchedules()
  const scheduleGroups = groupSchedules(schedules)

  return (
    <div className="min-h-screen bg-bg-cream font-body">

      {/* Nav */}
      <header className="sticky top-0 z-10 bg-brand-orange border-b-4 border-stone-dark shadow-[0_4px_0px_#78350F]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="The Gordo" className="w-8 h-8 rounded-lg border-2 border-stone-dark" />
            <span className="font-display font-bold text-xl text-white tracking-wide">The Gordo</span>
          </div>
          <Link
            to="/reservar"
            className="bg-white text-brand-orange-dark font-display font-bold text-sm px-4 py-2 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            Reservar mesa
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-orange to-brand-orange-light border-b-4 border-stone-dark">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-block bg-brand-red text-white font-display font-black text-5xl md:text-7xl px-6 py-3 rounded-3xl border-4 border-stone-dark shadow-[8px_8px_0px_#78350F] mb-6 rotate-[-1deg]">
            The Gordo
          </div>
          <p className="font-display text-white text-xl md:text-2xl font-semibold mt-4 mb-2 drop-shadow">
            Comidas Rápidas
          </p>
          <p className="text-white/90 text-base md:text-lg mb-10 max-w-md mx-auto">
            El sabor que enamora. Reserva tu mesa y disfruta con tu familia.
          </p>
          <Link
            to="/reservar"
            className="inline-block bg-brand-yellow text-stone-dark font-display font-black text-lg px-8 py-4 rounded-2xl border-4 border-stone-dark shadow-[6px_6px_0px_#78350F] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
          >
            ¡Hacer una reserva!
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-display font-bold text-3xl text-stone-dark text-center mb-10">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <UtensilsCrossed className="w-8 h-8" />,
              title: 'Sabor auténtico',
              desc: 'Preparamos cada plato con ingredientes frescos y recetas propias.',
            },
            {
              icon: <Clock className="w-8 h-8" />,
              title: 'Reserva en minutos',
              desc: 'Nuestro formulario es rápido. En menos de 2 minutos tienes tu mesa.',
            },
            {
              icon: <MapPin className="w-8 h-8" />,
              title: 'Ambiente familiar',
              desc: 'Un espacio acogedor pensado para compartir en familia o con amigos.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border-4 border-stone-dark rounded-2xl p-6 shadow-[5px_5px_0px_#78350F] text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow/40 border-2 border-stone-dark rounded-2xl mb-4 text-stone-dark">
                {icon}
              </div>
              <h3 className="font-display font-bold text-lg text-stone-dark mb-2">{title}</h3>
              <p className="text-stone-mid text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Horarios */}
      <section className="bg-bg-warm border-y-4 border-stone-dark">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <h2 className="font-display font-bold text-3xl text-stone-dark text-center mb-8">
            Horarios de atención
          </h2>
          <div className="max-w-sm mx-auto space-y-3">
            {schedulesLoading ? (
              <p className="text-center font-display text-stone-mid text-sm">Cargando horarios...</p>
            ) : scheduleGroups.length === 0 ? (
              <p className="text-center font-display text-stone-mid text-sm">
                Consulta nuestros horarios llamándonos.
              </p>
            ) : (
              scheduleGroups.map(({ label, hours }) => (
                <div
                  key={label}
                  className="flex justify-between items-center bg-white border-2 border-stone-dark rounded-xl px-5 py-3 shadow-[3px_3px_0px_#78350F]"
                >
                  <span className="font-display font-semibold text-stone-dark text-sm">{label}</span>
                  <span className="font-display font-bold text-brand-orange text-sm">{hours}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-brand-orange border-4 border-stone-dark rounded-3xl p-10 shadow-[8px_8px_0px_#78350F]">
          <h2 className="font-display font-black text-3xl text-white mb-3">
            ¿Listo para reservar?
          </h2>
          <p className="text-white/90 mb-8 text-base">
            Sin cuenta, sin complicaciones. Solo completa el formulario y listo.
          </p>
          <Link
            to="/reservar"
            className="inline-block bg-white text-brand-orange-dark font-display font-black text-lg px-8 py-4 rounded-2xl border-4 border-stone-dark shadow-[6px_6px_0px_#78350F] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
          >
            Reserva tu mesa
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-dark text-white py-8 border-t-4 border-stone-mid">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-display font-bold text-lg mb-1">The Gordo — Comidas Rápidas</p>
          <p className="text-white/60 text-sm">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
