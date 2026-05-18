import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRestaurantTables } from '@/hooks/useRestaurantTables'
import { useLocations } from '@/hooks/useLocations'
import { translateError } from '@/utils/errors'
import TableFilters from '@/components/admin/tables/TableFilters'
import TableList from '@/components/admin/tables/TableList'
import TableFormModal from '@/components/admin/tables/TableFormModal'
import DeleteTableModal from '@/components/admin/tables/DeleteTableModal'
import { EMPTY_FORM } from '@/components/admin/tables/types'
import type { TableForm, StatusFilter } from '@/components/admin/tables/types'
import type { RestaurantTable, TableStatus } from '@/types'

export default function RestaurantTablePage() {
  const { locations } = useLocations()

  const [editing, setEditing] = useState<RestaurantTable | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<TableForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('estado') === 'activa' ? 'active' : 'all'
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus as StatusFilter)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const { tables, total, loading, create, update, remove } = useRestaurantTables(
    { status: statusFilter, sortOrder },
    page,
    pageSize,
  )

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (table: RestaurantTable) => {
    setEditing(table)
    setForm({
      number: String(table.number),
      capacity: String(table.capacity),
      locationId: table.locationId ?? '',
      status: table.status,
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
    const err = editing
      ? await update(editing.id, Number(form.number), Number(form.capacity), form.locationId || null, form.status as TableStatus)
      : await create(Number(form.number), Number(form.capacity), form.locationId || null)
    setSaving(false)
    if (err) toast.error(translateError(err))
    else {
      toast.success(editing ? 'Mesa actualizada' : 'Mesa creada')
      closeModal()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const err = await remove(deleteId)
    setDeleting(false)
    if (err) toast.error(translateError(err))
    else {
      toast.success('Mesa eliminada')
      setDeleteId(null)
    }
  }

  const locationName = (id: string | null) =>
    id ? (locations.find((l) => l.id === id)?.name ?? '—') : '—'

  const cacheKey = `${statusFilter}-${sortOrder}-${page}-${pageSize}`

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-stone-dark">Mesas</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva mesa
        </button>
      </div>

      <TableFilters
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1) }}
        sortOrder={sortOrder}
        onSortOrderChange={(v) => { setSortOrder(v); setPage(1) }}
      />

      <TableList
        tables={tables}
        loading={loading}
        statusFilter={statusFilter}
        cacheKey={cacheKey}
        sortOrder={sortOrder}
        onSortToggle={() => { setSortOrder((o) => o === 'asc' ? 'desc' : 'asc'); setPage(1) }}
        locationName={locationName}
        onEdit={openEdit}
        onDelete={setDeleteId}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
      />

      {modalOpen && (
        <TableFormModal
          editing={editing}
          form={form}
          onFormChange={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
          locations={locations}
        />
      )}

      {deleteId && (
        <DeleteTableModal
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}
