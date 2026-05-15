import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Users, Calendar, Clock, User, Phone, Mail } from 'lucide-react'
import { reservationController } from '@/controllers/reservation.controller'
import type { RestaurantTable, Reservation } from '@/types'

const DURATION = 90

type Step = 1 | 2 | 3 | 'success'

const input =
  'w-full border-2 border-stone-dark rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-orange transition-colors bg-white'
const label = 'block font-display font-semibold text-stone-dark mb-1 text-sm'

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Fecha y personas' },
    { n: 2, label: 'Elegí tu mesa' },
    { n: 3, label: 'Tus datos' },
  ]
  return (
    <div className="flex items-center gap-1 justify-center mb-10">
      {steps.map(({ n, label }, i) => {
        const done = typeof current === 'number' && current > n || current === 'success'
        const active = current === n
        return (
          <div key={n} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full border-2 border-stone-dark flex items-center justify-center font-display font-bold text-sm transition-all
                  ${done ? 'bg-brand-orange text-white' : active ? 'bg-brand-yellow text-stone-dark' : 'bg-white text-stone-mid'}`}
              >
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-display hidden sm:block ${active ? 'text-stone-dark font-semibold' : 'text-stone-mid'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mb-4 ${done ? 'bg-brand-orange' : 'bg-stone-dark/20'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ReservationPage() {
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(2)

  // Step 2
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([])
  const [selectedTableId, setSelectedTableId] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  // Step 3
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Success
  const [reservation, setReservation] = useState<Reservation | null>(null)

  const startTime = date && time ? new Date(`${date}T${time}`) : null

  const handleSearchTables = async () => {
    if (!startTime) return
    setSearching(true)
    setSearchError(null)
    const res = await reservationController.getAvailableTables(startTime, DURATION, partySize)
    setSearching(false)
    if (!res.ok) {
      setSearchError(res.error)
      return
    }
    if (res.data.length === 0) {
      setSearchError('No hay mesas disponibles para ese horario y cantidad de personas. Probá con otro horario.')
      return
    }
    setAvailableTables(res.data)
    setSelectedTableId(res.data[0].id)
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!startTime || !selectedTableId) return
    setSubmitting(true)
    setSubmitError(null)
    const res = await reservationController.create(
      selectedTableId,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      startTime,
      DURATION,
    )
    setSubmitting(false)
    if (!res.ok) {
      setSubmitError(res.error)
      return
    }
    setReservation(res.data)
    setStep('success')
  }

  const selectedTable = availableTables.find((t) => t.id === selectedTableId)

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-bg-cream font-body">

      {/* Nav */}
      <header className="bg-brand-orange border-b-4 border-stone-dark shadow-[0_4px_0px_#78350F]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/80 hover:text-white font-display text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <img src="/icon.png" alt="The Gordo" className="w-6 h-6 rounded border border-white/40" />
            Inicio
          </Link>
          <span className="text-white/40">|</span>
          <span className="font-display font-bold text-white">Reservar mesa</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {step !== 'success' && <StepIndicator current={step} />}

        {/* ─── STEP 1: Fecha, hora y personas ─── */}
        {step === 1 && (
          <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
            <h1 className="font-display font-black text-2xl text-stone-dark mb-1">
              ¿Cuándo querés venir?
            </h1>
            <p className="text-stone-mid text-sm mb-7">
              Elegí fecha, hora y cantidad de personas.
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>
                    <Calendar className="inline w-4 h-4 mr-1 mb-0.5" />
                    Fecha
                  </label>
                  <input
                    type="date"
                    className={input}
                    value={date}
                    min={todayStr}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>
                    <Clock className="inline w-4 h-4 mr-1 mb-0.5" />
                    Hora
                  </label>
                  <input
                    type="time"
                    className={input}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={label}>
                  <Users className="inline w-4 h-4 mr-1 mb-0.5" />
                  Personas
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-stone-dark font-display font-bold text-lg text-stone-dark hover:bg-bg-warm transition-colors shadow-[2px_2px_0px_#78350F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    −
                  </button>
                  <span className="font-display font-black text-2xl text-stone-dark w-8 text-center">
                    {partySize}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                    className="w-10 h-10 rounded-xl border-2 border-stone-dark font-display font-bold text-lg text-stone-dark hover:bg-bg-warm transition-colors shadow-[2px_2px_0px_#78350F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    +
                  </button>
                  <span className="text-stone-mid text-sm">
                    {partySize === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
              </div>

              {searchError && (
                <div className="bg-brand-red/10 border-2 border-brand-red rounded-xl px-4 py-3 text-brand-red-dark text-sm font-display">
                  {searchError}
                </div>
              )}

              <button
                type="button"
                disabled={!date || !time || searching}
                onClick={handleSearchTables}
                className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black text-base px-6 py-3.5 rounded-2xl border-2 border-stone-dark shadow-[4px_4px_0px_#78350F] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                {searching ? 'Buscando mesas...' : (
                  <>
                    Ver mesas disponibles
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Seleccionar mesa ─── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-bg-warm border-2 border-stone-dark/30 rounded-2xl px-5 py-3 flex flex-wrap gap-4 text-sm">
              <span className="font-display text-stone-dark">
                <Calendar className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
                {startTime?.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
              <span className="font-display text-stone-dark">
                <Clock className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
                {time} · {DURATION} min
              </span>
              <span className="font-display text-stone-dark">
                <Users className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
                {partySize} {partySize === 1 ? 'persona' : 'personas'}
              </span>
            </div>

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
              <h1 className="font-display font-black text-2xl text-stone-dark mb-1">
                Elegí tu mesa
              </h1>
              <p className="text-stone-mid text-sm mb-6">
                {availableTables.length} {availableTables.length === 1 ? 'mesa disponible' : 'mesas disponibles'} para ese horario.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {availableTables.map((table) => {
                  const selected = table.id === selectedTableId
                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => setSelectedTableId(table.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all
                        ${selected
                          ? 'border-brand-orange bg-brand-orange/10 shadow-[3px_3px_0px_#F97316]'
                          : 'border-stone-dark/40 bg-bg-cream hover:border-stone-dark hover:bg-bg-warm'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display font-black text-stone-dark text-base">
                          Mesa #{table.number}
                        </span>
                        {selected && (
                          <span className="w-5 h-5 bg-brand-orange rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </div>
                      <span className="text-stone-mid text-sm font-display">
                        Hasta {table.capacity} {table.capacity === 1 ? 'persona' : 'personas'}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-stone-dark font-display font-semibold text-sm text-stone-dark hover:bg-bg-warm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
                <button
                  type="button"
                  disabled={!selectedTableId}
                  onClick={() => setStep(3)}
                  className="flex-2 flex-1 flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Datos del cliente ─── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Resumen */}
            <div className="bg-bg-warm border-2 border-stone-dark/30 rounded-2xl px-5 py-3 flex flex-wrap gap-4 text-sm">
              <span className="font-display text-stone-dark">
                <Calendar className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
                {startTime?.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
              <span className="font-display text-stone-dark">
                <Clock className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
                {time}
              </span>
              <span className="font-display text-stone-dark">
                <Users className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
                {partySize} {partySize === 1 ? 'persona' : 'personas'}
              </span>
              {selectedTable && (
                <span className="font-display text-stone-dark font-semibold">
                  Mesa #{selectedTable.number}
                </span>
              )}
            </div>

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
              <h1 className="font-display font-black text-2xl text-stone-dark mb-1">
                ¿A nombre de quién?
              </h1>
              <p className="text-stone-mid text-sm mb-7">
                Solo necesitamos tu nombre y teléfono para confirmar la reserva.
              </p>

              <div className="space-y-4">
                <div>
                  <label className={label}>
                    <User className="inline w-4 h-4 mr-1 mb-0.5" />
                    Nombre completo <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    className={input}
                    placeholder="Juan García"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={label}>
                    <Phone className="inline w-4 h-4 mr-1 mb-0.5" />
                    Teléfono <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="tel"
                    className={input}
                    placeholder="300 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>
                    <Mail className="inline w-4 h-4 mr-1 mb-0.5" />
                    Email <span className="text-stone-mid font-normal">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    className={input}
                    placeholder="juan@ejemplo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                {submitError && (
                  <div className="bg-brand-red/10 border-2 border-brand-red rounded-xl px-4 py-3 text-brand-red-dark text-sm font-display">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-stone-dark font-display font-semibold text-sm text-stone-dark hover:bg-bg-warm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </button>
                  <button
                    type="button"
                    disabled={!customerName.trim() || !customerPhone.trim() || submitting}
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  >
                    {submitting ? 'Confirmando...' : (
                      <>
                        Confirmar reserva
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SUCCESS ─── */}
        {step === 'success' && reservation && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-yellow border-4 border-stone-dark rounded-full shadow-[5px_5px_0px_#78350F] mb-6">
              <Check className="w-10 h-10 text-stone-dark" />
            </div>
            <h1 className="font-display font-black text-3xl text-stone-dark mb-2">
              ¡Reserva confirmada!
            </h1>
            <p className="text-stone-mid mb-8">
              Te esperamos, {reservation.customerName.split(' ')[0]}.
            </p>

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 shadow-[6px_6px_0px_#78350F] text-left max-w-sm mx-auto mb-8">
              <h2 className="font-display font-bold text-stone-dark mb-4 text-base">
                Detalles de tu reserva
              </h2>
              <dl className="space-y-3">
                {[
                  {
                    icon: <Calendar className="w-4 h-4 text-brand-orange" />,
                    label: 'Fecha',
                    value: reservation.startTime.toLocaleDateString('es-CO', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    }),
                  },
                  {
                    icon: <Clock className="w-4 h-4 text-brand-orange" />,
                    label: 'Hora',
                    value: `${reservation.startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} · ${reservation.durationMinutes} min`,
                  },
                  {
                    icon: <Users className="w-4 h-4 text-brand-orange" />,
                    label: 'Personas',
                    value: `${reservation.partySize}`,
                  },
                  {
                    icon: <User className="w-4 h-4 text-brand-orange" />,
                    label: 'A nombre de',
                    value: reservation.customerName,
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="mt-0.5">{icon}</div>
                    <div>
                      <dt className="text-xs text-stone-mid font-display">{label}</dt>
                      <dd className="text-sm font-display font-semibold text-stone-dark capitalize">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-bold text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[4px_4px_0px_#78350F] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
