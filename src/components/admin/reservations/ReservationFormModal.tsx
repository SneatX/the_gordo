import { useMemo } from 'react'
import Modal from '@/components/ui/Modal'
import CustomSelect from '@/components/ui/CustomSelect'
import DateInput from '@/components/ui/DateInput'
import { toAmPm, toMinutes, fromMinutes, RESERVATION_DURATION_MIN } from '@/utils/time'
import { EMPTY_FORM } from './types'
import type { ReservationForm } from './types'
import type { Reservation, ReservationStatus, RestaurantTable, Schedule } from '@/types'

const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] transition-colors'
const label = 'block font-display font-medium text-stone-dark mb-1 text-sm'

interface Props {
  editing: Reservation | null
  form: ReservationForm
  onFormChange: (form: ReservationForm) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
  tables: RestaurantTable[]
  schedules: Schedule[]
}

export default function ReservationFormModal({
  editing, form, onFormChange, onClose, onSubmit, saving, tables, schedules,
}: Props) {
  const formActiveSchedule = useMemo(() => {
    if (!form.date) return null
    const dow = new Date(form.date + 'T00:00:00').getDay()
    return schedules.find((s) => s.dayOfWeek === dow && s.isActive) ?? null
  }, [form.date, schedules])

  const formTimeSlots = useMemo(() => {
    if (!formActiveSchedule || !form.date) return []
    const open = toMinutes(formActiveSchedule.startTime)
    const close = toMinutes(formActiveSchedule.endTime)
    const lastStart = close - RESERVATION_DURATION_MIN
    const slots: string[] = []
    for (let m = open; m <= lastStart; m += 30) {
      slots.push(fromMinutes(m))
    }
    if (form.time && !slots.includes(form.time)) slots.unshift(form.time)
    return slots
  }, [formActiveSchedule, form.date, form.time])

  return (
    <Modal title={editing ? 'Editar reserva' : 'Nueva reserva'} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={label}>Fecha</label>
          <DateInput
            value={form.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(v) => onFormChange({ ...form, date: v, time: '' })}
            required
          />
          {form.date && !formActiveSchedule && (
            <p className="mt-1 text-xs text-brand-red font-display">
              El restaurante no atiende ese día.
            </p>
          )}
        </div>

        <div>
          <label className={label}>Hora</label>
          <CustomSelect
            value={form.time}
            onChange={(v) => onFormChange({ ...form, time: v })}
            disabled={!form.date || !formActiveSchedule || formTimeSlots.length === 0}
            placeholder={
              !form.date
                ? 'Primero elige una fecha'
                : !formActiveSchedule
                  ? 'Sin horario disponible'
                  : formTimeSlots.length === 0
                    ? 'Sin horas disponibles'
                    : 'Selecciona una hora'
            }
            options={formTimeSlots.map((slot) => ({ value: slot, label: toAmPm(slot) }))}
          />
          {formActiveSchedule && (
            <p className="mt-1 text-xs text-stone-mid font-display">
              Horario: {toAmPm(formActiveSchedule.startTime)} – {toAmPm(formActiveSchedule.endTime)}
            </p>
          )}
        </div>

        <div>
          <label className={label}>Personas</label>
          <input
            type="number"
            min={1}
            className={input}
            value={form.partySize}
            onChange={(e) => onFormChange({ ...form, partySize: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={label}>Mesa</label>
          <CustomSelect
            value={form.tableId}
            onChange={(v) => onFormChange({ ...form, tableId: v })}
            placeholder="Seleccionar mesa"
            options={tables.filter((t) => t.status === 'active').map((t) => ({
              value: t.id,
              label: `Mesa #${t.number} — ${t.capacity} personas`,
            }))}
          />
        </div>

        <div>
          <label className={label}>Nombre del cliente</label>
          <input
            className={input}
            value={form.customerName}
            onChange={(e) => onFormChange({ ...form, customerName: e.target.value.replace(/[0-9]/g, '') })}
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Email</label>
            <input
              type="email"
              className={input}
              value={form.customerEmail}
              onChange={(e) => onFormChange({ ...form, customerEmail: e.target.value })}
            />
          </div>
          <div>
            <label className={label}>Teléfono</label>
            <input
              type="tel"
              maxLength={10}
              className={input}
              value={form.customerPhone}
              onChange={(e) => onFormChange({ ...form, customerPhone: e.target.value.replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '') })}
            />
          </div>
        </div>

        {editing && (
          <div>
            <label className={label}>Estado</label>
            <CustomSelect
              value={form.status}
              onChange={(v) => onFormChange({ ...form, status: v as ReservationStatus })}
              options={[
                { value: 'active', label: 'Activa' },
                { value: 'completed', label: 'Completada' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border-2 border-stone-dark font-display font-medium text-sm text-stone-dark hover:bg-bg-warm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2 rounded-xl border-2 border-stone-dark bg-brand-orange hover:bg-brand-orange-dark disabled:opacity-50 font-display font-semibold text-sm text-white shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export { EMPTY_FORM }
