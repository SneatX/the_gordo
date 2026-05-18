import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useLocations } from '@/hooks/useLocations'
import { usePagination } from '@/hooks/usePagination'
import { translateError } from '@/utils/errors'
import LocationFilters from '@/components/admin/locations/LocationFilters'
import LocationTable from '@/components/admin/locations/LocationTable'
import LocationFormModal from '@/components/admin/locations/LocationFormModal'
import DeleteLocationModal from '@/components/admin/locations/DeleteLocationModal'
import type { LocationForm } from '@/components/admin/locations/LocationFormModal'
import type { Location } from '@/types'

const EMPTY: LocationForm = { name: '', description: '' }

export default function LocationPage() {
  const { locations, loading, create, update, remove } = useLocations()

  const [editing, setEditing] = useState<Location | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<LocationForm>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sorted = [...locations].sort((a, b) =>
    sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  )

  const { page, pageSize, setPage, setPageSize, paginated, total } = usePagination(sorted, 5)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (loc: Location) => {
    setEditing(loc)
    setForm({ name: loc.name, description: loc.description ?? '' })
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
    const err = editing
      ? await update(editing.id, form.name, form.description || null)
      : await create(form.name, form.description || null)
    setSaving(false)
    if (err) toast.error(translateError(err))
    else {
      toast.success(editing ? 'Ubicación actualizada' : 'Ubicación creada')
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
      toast.success('Ubicación eliminada')
      setDeleteId(null)
    }
  }

  const cacheKey = `${sortOrder}-${page}-${pageSize}`

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-stone-dark">Ubicaciones</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva ubicación
        </button>
      </div>

      <LocationFilters
        sortOrder={sortOrder}
        onSortOrderChange={(v) => { setSortOrder(v); setPage(1) }}
      />

      <LocationTable
        paginated={paginated}
        loading={loading}
        cacheKey={cacheKey}
        sortOrder={sortOrder}
        onSortToggle={() => { setSortOrder((o) => o === 'asc' ? 'desc' : 'asc'); setPage(1) }}
        onEdit={openEdit}
        onDelete={setDeleteId}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
      />

      {modalOpen && (
        <LocationFormModal
          editing={editing}
          form={form}
          onFormChange={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
        />
      )}

      {deleteId && (
        <DeleteLocationModal
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  )
}
