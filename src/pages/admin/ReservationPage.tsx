import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useReservations } from '@/hooks/useReservations'
import { useRestaurantTables } from '@/hooks/useRestaurantTables'
import { useSchedules } from '@/hooks/useSchedules'
import { useDebounce } from '@/hooks/useDebounce'
import { translateError } from '@/utils/errors'
import ReservationFilters from '@/components/admin/reservations/ReservationFilters'
import ReservationTable from '@/components/admin/reservations/ReservationTable'
import ReservationFormModal from '@/components/admin/reservations/ReservationFormModal'
import CancelReservationModal from '@/components/admin/reservations/CancelReservationModal'
import { EMPTY_FORM } from '@/components/admin/reservations/types'
import type { ReservationForm, StatusFilter } from '@/components/admin/reservations/types'
import type { Reservation } from '@/types'

export default function ReservationPage() {
  const { tables } = useRestaurantTables()
  const { schedules } = useSchedules()

  const [editing, setEditing] = useState<Reservation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null)
  const [form, setForm] = useState<ReservationForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const [searchParams] = useSearchParams()
  const [view, setView] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFrom, setDateFrom] = useState(searchParams.get('desde') ?? '')
  const [dateTo, setDateTo] = useState(searchParams.get('hasta') ?? '')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const handleViewChange = (v: 'upcoming' | 'past' | 'all') => {
    setView(v)
    setSortOrder(v === 'past' ? 'desc' : 'asc')
    setPage(1)
  }

  useEffect(() => {
    setDateFrom(searchParams.get('desde') ?? '')
    setDateTo(searchParams.get('hasta') ?? '')
    setPage(1)
  }, [searchParams])

  const debouncedSearch = useDebounce(search, 300)

  const { reservations, total, loading, create, update } = useReservations(
    { view, search: debouncedSearch, status: statusFilter, dateFrom, dateTo, sortOrder },
    page,
    pageSize,
  )

  const hasFilters = !!(search || statusFilter !== 'all' || dateFrom || dateTo)

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setDateFrom('')
    setDateTo('')
    setSortOrder(view === 'upcoming' ? 'asc' : 'desc')
    setPage(1)
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
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
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const startDate = new Date(`${form.date}T${form.time}`)
    const res = editing
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
    if (!res.ok) toast.error(translateError(res.error))
    else {
      toast.success(editing ? 'Reserva actualizada' : 'Reserva creada')
      closeModal()
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    const r = cancelTarget
    const res = await update(
      r.id, r.tableId, r.customerName, r.customerEmail,
      r.customerPhone, r.partySize, r.startTime, r.durationMinutes, 'cancelled',
    )
    setCancelling(false)
    if (!res.ok) toast.error(translateError(res.error))
    else {
      toast.success('Reserva cancelada')
      setCancelTarget(null)
    }
  }

  const tableNumber = (id: string) => tables.find((t) => t.id === id)?.number ?? '—'

  const cacheKey = `${view}-${debouncedSearch}-${statusFilter}-${dateFrom}-${dateTo}-${sortOrder}-${page}-${pageSize}`

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

      <ReservationFilters
        view={view}
        onViewChange={handleViewChange}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1) }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => { setDateFrom(v); setPage(1) }}
        dateTo={dateTo}
        onDateToChange={(v) => { setDateTo(v); setPage(1) }}
        sortOrder={sortOrder}
        onSortOrderChange={(v) => { setSortOrder(v); setPage(1) }}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />

      <ReservationTable
        reservations={reservations}
        loading={loading}
        hasFilters={hasFilters}
        cacheKey={cacheKey}
        sortOrder={sortOrder}
        onSortOrderChange={(v) => { setSortOrder(v); setPage(1) }}
        onSortToggle={() => { setSortOrder((s) => s === 'asc' ? 'desc' : 'asc'); setPage(1) }}
        tableNumber={tableNumber}
        onEdit={openEdit}
        onCancel={setCancelTarget}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
      />

      {modalOpen && (
        <ReservationFormModal
          editing={editing}
          form={form}
          onFormChange={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
          tables={tables}
          schedules={schedules}
        />
      )}

      {cancelTarget && (
        <CancelReservationModal
          reservation={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
          cancelling={cancelling}
        />
      )}
    </div>
  )
}
