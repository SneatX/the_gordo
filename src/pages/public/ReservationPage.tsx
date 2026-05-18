import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Info,
} from 'lucide-react'
import { useReservations } from '@/hooks/useReservations'
import { useSchedules } from '@/hooks/useSchedules'
import { useLocations } from '@/hooks/useLocations'
import StepIndicator, { type Step } from '@/components/reservation/StepIndicator'
import SummaryBar from '@/components/reservation/SummaryBar'
import LocationAccordion from '@/components/reservation/LocationAccordion'
import CustomSelect from '@/components/ui/CustomSelect'
import DateInput from '@/components/ui/DateInput'
import { toAmPm, toMinutes, fromMinutes, RESERVATION_DURATION_MIN } from '@/utils/time'
import { isValidEmail } from '@/utils/validation'
import type { RestaurantTable, Reservation } from '@/types'

const inputCls =
  'w-full border-2 border-stone-dark rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-orange transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed'
const inputErrCls =
  'w-full border-2 border-brand-red rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red transition-colors bg-white'
const labelCls = 'block font-display font-semibold text-stone-dark mb-1 text-sm'

export default function ReservationPage() {
  const { schedules } = useSchedules()
  const { locations } = useLocations()
  const { searchAvailableTables, create } = useReservations()

  const [step, setStep] = useState<Step>(1)

  // step 1
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(2)

  // step 2
  const [availableTables, setAvailableTables] = useState<RestaurantTable[]>([])
  const [selectedTableId, setSelectedTableId] = useState('')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  // step 3
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // success
  const [reservation, setReservation] = useState<Reservation | null>(null)

  // ── derived ──────────────────────────────────────────────────────────────

  const activeSchedule = useMemo(() => {
    if (!date) return null
    const dow = new Date(date + 'T00:00:00').getDay()
    return schedules.find((s) => s.dayOfWeek === dow && s.isActive) ?? null
  }, [date, schedules])

  // null when no date selected OR date has no active schedule
  const scheduleAvailable = activeSchedule !== null

  const timeSlots = useMemo(() => {
    if (!activeSchedule || !date) return []
    const open = toMinutes(activeSchedule.startTime)
    const close = toMinutes(activeSchedule.endTime)
    const lastStart = close - RESERVATION_DURATION_MIN

    const now = new Date()
    const isToday = new Date(date + 'T00:00:00').toDateString() === now.toDateString()
    const minAdvanceMs = 2 * 60 * 60 * 1000

    const slots: string[] = []
    for (let m = open; m <= lastStart; m += 30) {
      if (isToday) {
        const slotDate = new Date(date + 'T00:00:00')
        slotDate.setHours(Math.floor(m / 60), m % 60, 0, 0)
        if (slotDate.getTime() - now.getTime() < minAdvanceMs) continue
      }
      slots.push(fromMinutes(m))
    }
    return slots
  }, [activeSchedule, date])

  const tableGroups = useMemo(() => {
    const map = new Map<string, { locationName: string; tables: RestaurantTable[] }>()
    for (const table of availableTables) {
      if (!table.locationId) continue
      const loc = locations.find((l) => l.id === table.locationId)
      if (!loc) continue
      if (!map.has(loc.id)) map.set(loc.id, { locationName: loc.name, tables: [] })
      map.get(loc.id)!.tables.push(table)
    }
    return Array.from(map.values())
  }, [availableTables, locations])

  const tableCount = availableTables.filter((t) => t.locationId).length

  const step3Valid =
    customerName.trim() !== '' &&
    customerPhone.replace(/\D/g, '').length === 10 &&
    isValidEmail(customerEmail) &&
    !nameError &&
    !phoneError &&
    !emailError

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    setTime('')
    setSearchError(null)
  }

  const handleSearchTables = async () => {
    if (!date || !time) return
    setSearching(true)
    setSearchError(null)
    const startTime = new Date(`${date}T${time}`)
    const res = await searchAvailableTables(startTime, RESERVATION_DURATION_MIN, partySize)
    setSearching(false)
    if (!res.ok) {
      setSearchError(res.error)
      return
    }
    if (res.data.length === 0) {
      setSearchError(
        'No hay mesas disponibles para ese horario y cantidad de personas. Intenta con otro horario.',
      )
      return
    }
    setAvailableTables(res.data)
    setSelectedTableId(res.data[0].id)
    setStep(2)
  }

  const handleNameChange = (val: string) => {
    const clean = val.replace(/[0-9]/g, '')
    setCustomerName(clean)
    if (val !== clean) {
      setNameError('El nombre no debe contener números.')
      setTimeout(() => setNameError(''), 1500)
    } else {
      setNameError('')
    }
  }

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '')
    setCustomerPhone(clean)
    if (val !== clean) {
      setPhoneError('El teléfono no debe contener letras.')
      setTimeout(() => setPhoneError(''), 1500)
    } else if (clean.replace(/\D/g, '').length > 0 && clean.replace(/\D/g, '').length !== 10) {
      setPhoneError('El teléfono debe tener 10 dígitos.')
    } else {
      setPhoneError('')
    }
  }

  const handleEmailChange = (val: string) => {
    setCustomerEmail(val)
    setEmailError(val && !isValidEmail(val) ? 'Ingresa un correo electrónico válido.' : '')
  }

  const handleSubmit = async () => {
    const phoneDigits = customerPhone.replace(/\D/g, '')
    if (phoneDigits.length !== 10) {
      setPhoneError('El teléfono debe tener 10 dígitos.')
      return
    }
    if (!isValidEmail(customerEmail)) {
      setEmailError('Ingresa un correo electrónico válido.')
      return
    }
    if (!date || !time || !selectedTableId || nameError || phoneError || emailError) return

    const startTime = new Date(`${date}T${time}`)
    setSubmitting(true)
    setSubmitError(null)
    const res = await create(
      selectedTableId, customerName, customerEmail, customerPhone,
      partySize, startTime, RESERVATION_DURATION_MIN,
    )
    setSubmitting(false)
    if (res.ok) {
      setReservation(res.data)
      setStep('success')
    } else {
      setSubmitError(res.error)
    }
  }

  const selectedTable = availableTables.find((t) => t.id === selectedTableId)
  const todayStr = new Date().toISOString().split('T')[0]

  // ── render ────────────────────────────────────────────────────────────────

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
            <img
              src="/icon.png"
              alt="The Gordo"
              className="w-6 h-6 rounded border border-white/40"
            />
            Inicio
          </Link>
          <span className="text-white/40">|</span>
          <span className="font-display font-bold text-white">Reservar mesa</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {step !== 'success' && <StepIndicator current={step} />}

        {/* ─── STEP 1 ──────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
            <h1 className="font-display font-black text-2xl text-stone-dark mb-1">
              ¿Cuándo quieres venir?
            </h1>
            <p className="text-stone-mid text-sm mb-5">Elige fecha, hora y cantidad de personas.</p>

            {/* Info banner — siempre visible */}
            <div className="flex items-start gap-2.5 bg-brand-orange/10 border-2 border-brand-orange/40 rounded-2xl px-4 py-3 mb-6">
              <Info className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
              <p className="text-sm font-display text-stone-dark leading-snug">
                Cada reserva dura 1 hora y media. Reserva con al menos 2 horas de anticipación.
              </p>
            </div>

            <div className="space-y-5">
              {/* Fecha */}
              <div>
                <label className={labelCls}>
                  <Calendar className="inline w-4 h-4 mr-1 mb-0.5" />
                  Fecha
                </label>
                <DateInput
                  value={date}
                  min={todayStr}
                  onChange={handleDateChange}
                  error={!!(date && !scheduleAvailable)}
                />
                {date && !scheduleAvailable && (
                  <p className="mt-1.5 text-xs font-display text-brand-red">
                    El restaurante no atiende ese día. Por favor elige otra fecha.
                  </p>
                )}
              </div>

              {/* Hora */}
              <div>
                <label className={labelCls}>
                  <Clock className="inline w-4 h-4 mr-1 mb-0.5" />
                  Hora
                </label>
                <CustomSelect
                  value={time}
                  onChange={setTime}
                  disabled={!date || !scheduleAvailable || timeSlots.length === 0}
                  placeholder={
                    !date
                      ? 'Primero elige una fecha'
                      : !scheduleAvailable
                        ? 'Sin horario disponible'
                        : timeSlots.length === 0
                          ? 'No hay horas disponibles (mín. 2 h de anticipación)'
                          : 'Selecciona una hora'
                  }
                  options={timeSlots.map((slot) => ({ value: slot, label: toAmPm(slot) }))}
                />
                {scheduleAvailable && timeSlots.length > 0 && (
                  <p className="mt-1 text-xs text-stone-mid font-display">
                    Horario del día: {toAmPm(activeSchedule!.startTime)} –{' '}
                    {toAmPm(activeSchedule!.endTime)}
                  </p>
                )}
              </div>

              {/* Personas */}
              <div>
                <label className={labelCls}>
                  <Users className="inline w-4 h-4 mr-1 mb-0.5" />
                  Personas
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={!scheduleAvailable}
                    onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-stone-dark font-display font-bold text-lg text-stone-dark hover:bg-bg-warm transition-colors shadow-[2px_2px_0px_#78350F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0px_#78350F] disabled:translate-x-0 disabled:translate-y-0"
                  >
                    −
                  </button>
                  <span
                    className={`font-display font-black text-2xl w-8 text-center ${!scheduleAvailable ? 'text-stone-mid' : 'text-stone-dark'}`}
                  >
                    {partySize}
                  </span>
                  <button
                    type="button"
                    disabled={!scheduleAvailable}
                    onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                    className="w-10 h-10 rounded-xl border-2 border-stone-dark font-display font-bold text-lg text-stone-dark hover:bg-bg-warm transition-colors shadow-[2px_2px_0px_#78350F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0px_#78350F] disabled:translate-x-0 disabled:translate-y-0"
                  >
                    +
                  </button>
                  <span
                    className={`text-sm ${!scheduleAvailable ? 'text-stone-mid opacity-50' : 'text-stone-mid'}`}
                  >
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
                disabled={!date || !time || !scheduleAvailable || searching}
                onClick={handleSearchTables}
                className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black text-base px-6 py-3.5 rounded-2xl border-2 border-stone-dark shadow-[4px_4px_0px_#78350F] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                {searching ? (
                  'Buscando mesas...'
                ) : (
                  <>
                    Ver mesas disponibles <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2 ──────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <SummaryBar date={date} time={time} partySize={partySize} />

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
              <h1 className="font-display font-black text-2xl text-stone-dark mb-1">
                Elige tu mesa
              </h1>
              <p className="text-stone-mid text-sm mb-6">
                {tableCount} {tableCount === 1 ? 'mesa disponible' : 'mesas disponibles'} para ese
                horario.
              </p>

              <div className="space-y-3 mb-6">
                {tableGroups.map(({ locationName, tables }) => (
                  <LocationAccordion
                    key={locationName}
                    locationName={locationName}
                    tables={tables}
                    selectedTableId={selectedTableId}
                    onSelect={setSelectedTableId}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-stone-dark font-display font-semibold text-sm text-stone-dark hover:bg-bg-warm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver
                </button>
                <button
                  type="button"
                  disabled={!selectedTableId}
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3 ──────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <SummaryBar
              date={date}
              time={time}
              partySize={partySize}
              tableNumber={selectedTable?.number}
            />

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
              <h1 className="font-display font-black text-2xl text-stone-dark mb-1">
                ¿A nombre de quién?
              </h1>
              <p className="text-stone-mid text-sm mb-7">
                Completa tus datos para confirmar la reserva.
              </p>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className={labelCls}>
                    <User className="inline w-4 h-4 mr-1 mb-0.5" />
                    Nombre completo <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    className={nameError ? inputErrCls : inputCls}
                    placeholder="Juan García"
                    value={customerName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    autoFocus
                  />
                  {nameError && (
                    <p className="mt-1 text-xs text-brand-red font-display">{nameError}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className={labelCls}>
                    <Phone className="inline w-4 h-4 mr-1 mb-0.5" />
                    Teléfono <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="tel"
                    className={phoneError ? inputErrCls : inputCls}
                    placeholder="3001234567"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                  {phoneError ? (
                    <p className="mt-1 text-xs text-brand-red font-display">{phoneError}</p>
                  ) : (
                    <p className="mt-1 text-xs text-stone-mid font-display">
                      10 dígitos, sin espacios ni guiones.
                    </p>
                  )}
                </div>

                {/* Correo */}
                <div>
                  <label className={labelCls}>
                    <Mail className="inline w-4 h-4 mr-1 mb-0.5" />
                    Correo electrónico <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="email"
                    className={emailError ? inputErrCls : inputCls}
                    placeholder="juan@ejemplo.com"
                    value={customerEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-brand-red font-display">{emailError}</p>
                  )}
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
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                  <button
                    type="button"
                    disabled={!step3Valid || submitting}
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  >
                    {submitting ? (
                      'Confirmando...'
                    ) : (
                      <>
                        Confirmar reserva <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── SUCCESS ─────────────────────────────────────────────────────── */}
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
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    }),
                  },
                  {
                    icon: <Clock className="w-4 h-4 text-brand-orange" />,
                    label: 'Hora',
                    value: `${reservation.startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })} · ${reservation.durationMinutes} min`,
                  },
                  {
                    icon: <Users className="w-4 h-4 text-brand-orange" />,
                    label: 'Personas',
                    value: String(reservation.partySize),
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
                      <dd className="text-sm font-display font-semibold text-stone-dark capitalize">
                        {value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-bold text-sm px-6 py-3 rounded-2xl border-2 border-stone-dark shadow-[4px_4px_0px_#78350F] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
