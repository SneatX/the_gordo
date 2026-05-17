import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, X, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { useReservationsAdmin } from '@/hooks/useReservationsAdmin'
import { useRestaurantTables } from '@/hooks/useRestaurantTables'
import { useDebounce } from '@/hooks/useDebounce'
import Modal from '@/components/ui/Modal'
import TableSkeleton from '@/components/ui/TableSkeleton'
import TablePagination from '@/components/ui/TablePagination'
import type { Reservation, ReservationStatus } from '@/types'

const EMPTY = {
  tableId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  partySize: '2',
  startTime: '',
  durationMinutes: '90',
  status: 'active' as ReservationStatus,
}

const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors'
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

  const [editing, setEditing] = useState<Reservation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const debouncedSearch = useDebounce(search, 300)

  const { reservations, total, loading, create, update, remove } = useReservationsAdmin(
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
    setForm({
      tableId: r.tableId,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      customerPhone: r.customerPhone,
      partySize: String(r.partySize),
      startTime: r.startTime.toISOString().slice(0, 16),
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
    const startDate = new Date(form.startTime)
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

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const err = await remove(deleteId)
    setDeleting(false)
    if (err) toast.error(err)
    else {
      toast.success('Reserva eliminada')
      setDeleteId(null)
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
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              className="border-2 border-stone-dark/30 rounded-xl px-3 py-2 text-sm font-display focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-display text-sm text-stone-mid whitespace-nowrap">Hasta:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              className="border-2 border-stone-dark/30 rounded-xl px-3 py-2 text-sm font-display focus:outline-none focus:border-brand-orange transition-colors"
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
          <table className="w-full min-w-[640px]">
            <thead className="bg-brand-orange">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Cliente</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Mesa</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Personas</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">
                  <button
                    onClick={() => { setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); setPage(1) }}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  >
                    Fecha y hora
                    {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Duración</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Estado</th>
                <th className="px-4 py-3 w-24" />
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
                  <td className="px-4 py-3 max-w-[180px]">
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
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1.5 rounded-lg hover:bg-brand-red/10 text-brand-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <div>
              <label className={label}>Mesa</label>
              <select
                className={input}
                value={form.tableId}
                onChange={(e) => setForm({ ...form, tableId: e.target.value })}
                required
              >
                <option value="">Seleccionar mesa</option>
                {tables.filter((t) => t.status === 'active').map((t) => (
                  <option key={t.id} value={t.id}>
                    Mesa #{t.number} — {t.capacity} personas
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Cliente</label>
              <input
                className={input}
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
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
                  className={input}
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <label className={label}>Duración (min)</label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  className={`${input} disabled:opacity-60 disabled:cursor-not-allowed`}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  disabled={!!editing}
                  required
                />
              </div>
            </div>
            <div>
              <label className={label}>Fecha y hora</label>
              <input
                type="datetime-local"
                className={input}
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            {editing && (
              <div>
                <label className={label}>Estado</label>
                <select
                  className={input}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ReservationStatus })}
                >
                  <option value="active">Activa</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
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

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Eliminar reserva" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-stone-dark mb-6">
            ¿Estás seguro? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 py-2 rounded-xl border-2 border-stone-dark font-display font-medium text-sm text-stone-dark hover:bg-bg-warm transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2 rounded-xl border-2 border-stone-dark bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 font-display font-semibold text-sm text-white shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
