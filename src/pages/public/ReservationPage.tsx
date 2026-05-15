import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Users, Calendar, Clock, User, Phone, Mail, MapPin, ChevronDown } from 'lucide-react'
import { reservationController } from '@/controllers/reservation.controller'
import { useSchedules } from '@/hooks/useSchedules'
import { useLocations } from '@/hooks/useLocations'
import type { RestaurantTable, Reservation } from '@/types'

const DURATION = 90

type Step = 1 | 2 | 3 | 'success'

const inputCls = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-orange transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed'
const inputErrCls = 'w-full border-2 border-brand-red rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-red transition-colors bg-white'
const labelCls = 'block font-display font-semibold text-stone-dark mb-1 text-sm'

// ── helpers ──────────────────────────────────────────────────────────────────

const toAmPm = (hhmm: string): string => {
  const [hStr, mStr] = hhmm.split(':')
  const h = parseInt(hStr, 10)
  const h12 = h % 12 || 12
  return `${h12}:${mStr} ${h >= 12 ? 'PM' : 'AM'}`
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const fromMinutes = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

// ── sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Fecha y personas' },
    { n: 2, label: 'Elige tu mesa' },
    { n: 3, label: 'Tus datos' },
  ]
  return (
    <div className="flex items-center gap-1 justify-center mb-10">
      {steps.map(({ n, label }, i) => {
        const done = (typeof current === 'number' && current > n) || current === 'success'
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

function SummaryBar({ date, time, partySize, tableNumber }: {
  date: string; time: string; partySize: number; tableNumber?: number
}) {
  const dateLabel = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' })
    : ''
  return (
    <div className="bg-bg-warm border-2 border-stone-dark/30 rounded-2xl px-5 py-3 flex flex-wrap gap-4 text-sm">
      <span className="font-display text-stone-dark capitalize">
        <Calendar className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
        {dateLabel}
      </span>
      <span className="font-display text-stone-dark">
        <Clock className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
        {toAmPm(time)} · {DURATION} min
      </span>
      <span className="font-display text-stone-dark">
        <Users className="inline w-4 h-4 mr-1 mb-0.5 text-brand-orange" />
        {partySize} {partySize === 1 ? 'persona' : 'personas'}
      </span>
      {tableNumber != null && (
        <span className="font-display text-stone-dark font-semibold">Mesa #{tableNumber}</span>
      )}
    </div>
  )
}

function LocationAccordion({
  locationName,
  tables,
  selectedTableId,
  onSelect,
}: {
  locationName: string
  tables: RestaurantTable[]
  selectedTableId: string
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-2 border-stone-dark/30 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-warm hover:bg-bg-cream transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0" />
          <span className="font-display font-bold text-stone-dark text-sm">{locationName}</span>
          <span className="text-xs text-stone-mid font-display">({tables.length})</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-mid transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border-t-2 border-stone-dark/20">
          {tables.map((table) => {
            const selected = table.id === selectedTableId
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => onSelect(table.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all
                  ${selected
                    ? 'border-brand-orange bg-brand-orange/10 shadow-[3px_3px_0px_#F97316]'
                    : 'border-stone-dark/40 bg-bg-cream hover:border-stone-dark hover:bg-bg-warm'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-black text-stone-dark text-base">Mesa #{table.number}</span>
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
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ReservationPage() {
  const { schedules } = useSchedules()
  const { locations } = useLocations()

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

  // derived ─────────────────────────────────────────────────────────────────

  const activeSchedule = useMemo(() => {
    if (!date) return null
    const dow = new Date(date + 'T00:00:00').getDay()
    return schedules.find((s) => s.dayOfWeek === dow && s.isActive) ?? null
  }, [date, schedules])

  const timeSlots = useMemo(() => {
    if (!activeSchedule || !date) return []
    const open = toMinutes(activeSchedule.startTime)
    const close = toMinutes(activeSchedule.endTime)
    const lastStart = close - DURATION

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

  // only tables with a known location
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

  const dateDisabled = date !== '' && !activeSchedule

  // handlers ────────────────────────────────────────────────────────────────

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
    const res = await reservationController.getAvailableTables(startTime, DURATION, partySize)
    setSearching(false)
    if (!res.ok) { setSearchError(res.error); return }
    if (res.data.length === 0) {
      setSearchError('No hay mesas disponibles para ese horario y cantidad de personas. Intenta con otro horario.')
      return
    }
    setAvailableTables(res.data)
    setSelectedTableId(res.data[0].id)
    setStep(2)
  }

  const handleNameChange = (val: string) => {
    const clean = val.replace(/[0-9]/g, '')
    setCustomerName(clean)
    setNameError(val !== clean ? 'El nombre no debe contener números.' : '')
  }

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '')
    setCustomerPhone(clean)
    if (val !== clean) {
      setPhoneError('El teléfono no debe contener letras.')
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
    // final validations before submit
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
    const res = await reservationController.create(
      selectedTableId, customerName, customerEmail, customerPhone,
      partySize, startTime, DURATION,
    )
    setSubmitting(false)
    if (!res.ok) { setSubmitError(res.error); return }
    setReservation(res.data)
    setStep('success')
  }

  const selectedTable = availableTables.find((t) => t.id === selectedTableId)
  const todayStr = new Date().toISOString().split('T')[0]

  const step3Valid =
    customerName.trim() !== '' &&
    customerPhone.replace(/\D/g, '').length === 10 &&
    isValidEmail(customerEmail) &&
    !nameError && !phoneError && !emailError

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg-cream font-body">

      {/* Nav */}
      <header className="bg-brand-orange border-b-4 border-stone-dark shadow-[0_4px_0px_#78350F]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white font-display text-sm transition-colors">
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

        {/* ─── STEP 1 ──────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
            <h1 className="font-display font-black text-2xl text-stone-dark mb-1">
              ¿Cuándo quieres venir?
            </h1>
            <p className="text-stone-mid text-sm mb-7">
              Elige fecha, hora y cantidad de personas.
            </p>

            <div className="space-y-5">

              {/* Fecha */}
              <div>
                <label className={labelCls}>
                  <Calendar className="inline w-4 h-4 mr-1 mb-0.5" />
                  Fecha
                </label>
                <input
                  type="date"
                  className={dateDisabled ? inputErrCls : inputCls}
                  value={date}
                  min={todayStr}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
                {dateDisabled && (
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
                <select
                  className={inputCls}
                  value={time}
                  disabled={!activeSchedule || timeSlots.length === 0}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option value="">
                    {!date
                      ? 'Primero elige una fecha'
                      : !activeSchedule
                      ? 'Sin horario disponible'
                      : timeSlots.length === 0
                      ? 'No hay horas disponibles (mínimo 2 h de anticipación)'
                      : 'Selecciona una hora'}
                  </option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{toAmPm(slot)}</option>
                  ))}
                </select>
                {activeSchedule && timeSlots.length > 0 && (
                  <p className="mt-1 text-xs text-stone-mid font-display">
                    Horario: {toAmPm(activeSchedule.startTime)} – {toAmPm(activeSchedule.endTime)}
                    &nbsp;· Reserva mínimo con 2 h de anticipación.
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
                    disabled={dateDisabled}
                    onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-xl border-2 border-stone-dark font-display font-bold text-lg text-stone-dark hover:bg-bg-warm transition-colors shadow-[2px_2px_0px_#78350F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0px_#78350F] disabled:translate-x-0 disabled:translate-y-0"
                  >−</button>
                  <span className={`font-display font-black text-2xl w-8 text-center ${dateDisabled ? 'text-stone-mid' : 'text-stone-dark'}`}>
                    {partySize}
                  </span>
                  <button
                    type="button"
                    disabled={dateDisabled}
                    onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                    className="w-10 h-10 rounded-xl border-2 border-stone-dark font-display font-bold text-lg text-stone-dark hover:bg-bg-warm transition-colors shadow-[2px_2px_0px_#78350F] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0px_#78350F] disabled:translate-x-0 disabled:translate-y-0"
                  >+</button>
                  <span className={`text-sm ${dateDisabled ? 'text-stone-mid opacity-50' : 'text-stone-mid'}`}>
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
                disabled={!date || !time || !activeSchedule || searching}
                onClick={handleSearchTables}
                className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-display font-black text-base px-6 py-3.5 rounded-2xl border-2 border-stone-dark shadow-[4px_4px_0px_#78350F] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
              >
                {searching ? 'Buscando mesas...' : <>Ver mesas disponibles <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2 ──────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <SummaryBar date={date} time={time} partySize={partySize} />

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
              <h1 className="font-display font-black text-2xl text-stone-dark mb-1">Elige tu mesa</h1>
              <p className="text-stone-mid text-sm mb-6">
                {availableTables.filter((t) => t.locationId).length}{' '}
                {availableTables.filter((t) => t.locationId).length === 1 ? 'mesa disponible' : 'mesas disponibles'} para ese horario.
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
            <SummaryBar date={date} time={time} partySize={partySize} tableNumber={selectedTable?.number} />

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 md:p-8 shadow-[6px_6px_0px_#78350F]">
              <h1 className="font-display font-black text-2xl text-stone-dark mb-1">¿A nombre de quién?</h1>
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
                  {nameError && <p className="mt-1 text-xs text-brand-red font-display">{nameError}</p>}
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
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                  {phoneError
                    ? <p className="mt-1 text-xs text-brand-red font-display">{phoneError}</p>
                    : <p className="mt-1 text-xs text-stone-mid font-display">10 dígitos, sin espacios ni guiones.</p>
                  }
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
                  {emailError && <p className="mt-1 text-xs text-brand-red font-display">{emailError}</p>}
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
                    {submitting ? 'Confirmando...' : <>Confirmar reserva <Check className="w-4 h-4" /></>}
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
            <h1 className="font-display font-black text-3xl text-stone-dark mb-2">¡Reserva confirmada!</h1>
            <p className="text-stone-mid mb-8">Te esperamos, {reservation.customerName.split(' ')[0]}.</p>

            <div className="bg-white border-4 border-stone-dark rounded-3xl p-6 shadow-[6px_6px_0px_#78350F] text-left max-w-sm mx-auto mb-8">
              <h2 className="font-display font-bold text-stone-dark mb-4 text-base">Detalles de tu reserva</h2>
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
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
