import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Ban, Search, X, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { useReservationsAdmin } from '@/hooks/useReservationsAdmin'
import { useRestaurantTables } from '@/hooks/useRestaurantTables'
import { useSchedules } from '@/hooks/useSchedules'
import { useDebounce } from '@/hooks/useDebounce'
import Modal from '@/components/ui/Modal'
import TableSkeleton from '@/components/ui/TableSkeleton'
import TablePagination from '@/components/ui/TablePagination'
import CustomSelect from '@/components/ui/CustomSelect'
import DateInput from '@/components/ui/DateInput'
import Tooltip from '@/components/ui/Tooltip'
import { toAmPm, toMinutes, fromMinutes, RESERVATION_DURATION_MIN } from '@/utils/time'
import type { Reservation, ReservationStatus } from '@/types'

const EMPTY = {
  tableId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  partySize: '2',
  date: '',
  time: '',
  durationMinutes: '90',
  status: 'active' as ReservationStatus,
}

const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] transition-colors'
const label = 'block font-display font-medium text-stone-dark mb-1 text-sm'

const STATUS_LABEL: Record<ReservationStatus, string> = {
  active: 'Activa',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

const STATUS_STYLE: Record<ReservationStatus, string> = {
  active: 'bg-brand-yellow/30 border-brand-yellow-dark text-stone-dark',
  cancelled: 'bg-brand-red/10 border-brand-red text-brand-red',
  completed: 'bg-stone-dark/10 border-stone-dark/30 text-stone-mid',
}

type StatusFilter = ReservationStatus | 'all'

export default function ReservationPage() {
  const { tables } = useRestaurantTables()
  const { schedules } = useSchedules()

  const [editing, setEditing] = useState<Reservation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Filters — initialize from URL params (used by admin stats links)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFrom, setDateFrom] = useState(searchParams.get('desde') ?? '')
  const [dateTo, setDateTo] = useState(searchParams.get('hasta') ?? '')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Sync date filters when URL params change (e.g. clicking stats chips from sidebar)
  useEffect(() => {
    setDateFrom(searchParams.get('desde') ?? '')
    setDateTo(searchParams.get('hasta') ?? '')
    setPage(1)
  }, [searchParams])

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
    // Keep current time in list when editing even if outside generated slots
    if (form.time && !slots.includes(form.time)) slots.unshift(form.time)
    return slots
  }, [formActiveSchedule, form.date, form.time])

  const debouncedSearch = useDebounce(search, 300)

  const { reservations, total, loading, create, update } = useReservationsAdmin(
    { search: debouncedSearch, status: statusFilter, dateFrom, dateTo, sortOrder },
    page,
    pageSize,
  )

  const hasFilters = search || statusFilter !== 'all' || dateFrom || dateTo
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (r: Reservation) => {
    setEditing(r)
    const iso = r.startTime.toISOString().slice(0, 16)
    setForm({
      tableId: r.tableId,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      customerPhone: r.customerPhone,
      partySize: String(r.partySize),
      date: iso.slice(0, 10),
      time: iso.slice(11, 16),
      durationMinutes: String(r.durationMinutes),
      status: r.status,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const startDate = new Date(`${form.date}T${form.time}`)
    const err = editing
      ? await update(
          editing.id, form.tableId, form.customerName, form.customerEmail,
          form.customerPhone, Number(form.partySize), startDate,
          Number(form.durationMinutes), form.status,
        )
      : await create(
          form.tableId, form.customerName, form.customerEmail,
          form.customerPhone, Number(form.partySize), startDate,
          Number(form.durationMinutes),
        )
    setSaving(false)
    if (err) toast.error(err)
    else {
      toast.success(editing ? 'Reserva actualizada' : 'Reserva creada')
      closeModal()
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    const r = cancelTarget
    const err = await update(
      r.id, r.tableId, r.customerName, r.customerEmail,
      r.customerPhone, r.partySize, r.startTime, r.durationMinutes, 'cancelled',
    )
    setCancelling(false)
    if (err) toast.error(err)
    else {
      toast.success('Reserva cancelada')
      setCancelTarget(null)
    }
  }

  const tableNumber = (id: string) => tables.find((t) => t.id === id)?.number ?? '—'

  const filterBtnBase = 'px-3 py-1.5 rounded-xl border-2 font-display text-sm font-medium transition-all'
  const filterBtnActive = 'bg-brand-orange border-stone-dark text-white shadow-[2px_2px_0px_#78350F]'
  const filterBtnInactive = 'bg-white border-stone-dark/30 text-stone-dark hover:border-stone-dark'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-stone-dark">Reservas</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-stone-dark rounded-2xl p-4 shadow-[4px_4px_0px_#78350F] space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-mid pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full border-2 border-stone-dark/30 rounded-xl pl-9 pr-3 py-2 text-sm font-display focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-display text-sm text-stone-mid whitespace-nowrap">Desde:</label>
            <DateInput
              value={dateFrom}
              onChange={(v) => {
                setDateFrom(v)
                if (dateTo && dateTo < v) setDateTo('')
                setPage(1)
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-display text-sm text-stone-mid whitespace-nowrap">Hasta:</label>
            <DateInput
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(v) => { setDateTo(v); setPage(1) }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-sm text-stone-mid">Estado:</span>
          {(['all', 'active', 'cancelled', 'completed'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`${filterBtnBase} ${statusFilter === s ? filterBtnActive : filterBtnInactive}`}
            >
              {s === 'all' ? 'Todos' : STATUS_LABEL[s]}
            </button>
          ))}
          <div className="w-px h-5 bg-stone-dark/20 mx-1" />
          <span className="font-display text-sm text-stone-mid">Fecha:</span>
          <button
            onClick={() => { setSortOrder('asc'); setPage(1) }}
            className={`${filterBtnBase} flex items-center gap-1 ${sortOrder === 'asc' ? filterBtnActive : filterBtnInactive}`}
          >
            <ArrowUp className="w-3.5 h-3.5" /> Asc
          </button>
          <button
            onClick={() => { setSortOrder('desc'); setPage(1) }}
            className={`${filterBtnBase} flex items-center gap-1 ${sortOrder === 'desc' ? filterBtnActive : filterBtnInactive}`}
          >
            <ArrowDown className="w-3.5 h-3.5" /> Desc
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-stone-dark/30 font-display text-sm text-stone-mid hover:border-stone-dark hover:text-stone-dark transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton cols={7} />
      ) : (
        <div
          key={`${debouncedSearch}-${statusFilter}-${dateFrom}-${dateTo}-${sortOrder}-${page}-${pageSize}`}
          className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F] animate-fade-in"
        >
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed">
            <thead className="bg-brand-orange">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[180px]">Cliente</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[72px]">Mesa</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[80px]">Personas</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[140px]">
                  <button
                    onClick={() => { setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); setPage(1) }}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    Fecha y hora
                    {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[88px]">Duración</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm w-[110px]">Estado</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-display text-stone-mid">
                    {hasFilters ? 'Sin resultados para los filtros aplicados' : 'No hay reservas registradas'}
                  </td>
                </tr>
              )}
              {reservations.map((r) => (
                <tr key={r.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                  <td className="px-4 py-3 max-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-stone-dark truncate">{r.customerName}</p>
                    <p className="text-xs text-stone-mid truncate">{r.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-stone-dark">#{tableNumber(r.tableId)}</td>
                  <td className="px-4 py-3 text-sm text-stone-dark">{r.partySize}</td>
                  <td className="px-4 py-3 text-sm text-stone-dark">
                    {r.startTime.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}{' '}
                    {r.startTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-mid">{r.durationMinutes} min</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border-2 ${STATUS_STYLE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Tooltip text="Editar reserva">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      {r.status === 'active' && (
                        <Tooltip text="Cancelar reserva">
                          <button
                            onClick={() => setCancelTarget(r)}
                            className="p-1.5 rounded-lg hover:bg-brand-red/10 text-brand-red transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <TablePagination
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
        loading={loading}
      />

      {/* Create / Edit modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'Editar reserva' : 'Nueva reserva'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fecha */}
            <div>
              <label className={label}>Fecha</label>
              <DateInput
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(v) => setForm({ ...form, date: v, time: '' })}
                required
              />
              {form.date && !formActiveSchedule && (
                <p className="mt-1 text-xs text-brand-red font-display">
                  El restaurante no atiende ese día.
                </p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label className={label}>Hora</label>
              <CustomSelect
                value={form.time}
                onChange={(v) => setForm({ ...form, time: v })}
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

            {/* Personas */}
            <div>
              <label className={label}>Personas</label>
              <input
                type="number"
                min={1}
                className={input}
                value={form.partySize}
                onChange={(e) => setForm({ ...form, partySize: e.target.value })}
                required
              />
            </div>

            {/* Mesa */}
            <div>
              <label className={label}>Mesa</label>
              <CustomSelect
                value={form.tableId}
                onChange={(v) => setForm({ ...form, tableId: v })}
                placeholder="Seleccionar mesa"
                options={tables.filter((t) => t.status === 'active').map((t) => ({
                  value: t.id,
                  label: `Mesa #${t.number} — ${t.capacity} personas`,
                }))}
              />
            </div>

            {/* Cliente */}
            <div>
              <label className={label}>Nombre del cliente</label>
              <input
                className={input}
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value.replace(/[0-9]/g, '') })}
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
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>Teléfono</label>
                <input
                  type="tel"
                  maxLength={10}
                  className={input}
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value.replace(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '') })}
                />
              </div>
            </div>

            {editing && (
              <div>
                <label className={label}>Estado</label>
                <CustomSelect
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v as ReservationStatus })}
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
                onClick={closeModal}
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
      )}

      {/* Cancel confirm */}
      {cancelTarget && (
        <Modal title="Cancelar reserva" onClose={() => setCancelTarget(null)}>
          <p className="text-sm text-stone-dark mb-1">
            ¿Cancelar la reserva de <span className="font-semibold">{cancelTarget.customerName}</span>?
          </p>
          <p className="text-xs text-stone-mid mb-6">Esta acción cambiará el estado a Cancelada.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setCancelTarget(null)}
              className="flex-1 py-2 rounded-xl border-2 border-stone-dark font-display font-medium text-sm text-stone-dark hover:bg-bg-warm transition-colors"
            >
              Volver
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 py-2 rounded-xl border-2 border-stone-dark bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 font-display font-semibold text-sm text-white shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              {cancelling ? 'Cancelando...' : 'Cancelar reserva'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
