import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTablesAdmin } from '@/hooks/useTablesAdmin'
import { useLocations } from '@/hooks/useLocations'
import Modal from '@/components/ui/Modal'
import TableSkeleton from '@/components/ui/TableSkeleton'
import TablePagination from '@/components/ui/TablePagination'
import type { RestaurantTable, TableStatus } from '@/types'

const EMPTY = { number: '', capacity: '', locationId: '', status: 'active' as TableStatus }
const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors'
const label = 'block font-display font-medium text-stone-dark mb-1 text-sm'

const STATUS_LABEL: Record<TableStatus, string> = {
  active: 'Activa',
  blocked: 'Bloqueada',
}

type StatusFilter = TableStatus | 'all'

export default function RestaurantTablePage() {
  const { locations } = useLocations()

  const [editing, setEditing] = useState<RestaurantTable | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Filter — initialize from URL param ?estado=activa (used by admin stats)
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('estado') === 'activa' ? 'active' : 'all'
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus as StatusFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const { tables, total, loading, create, update, remove } = useTablesAdmin(
    { status: statusFilter },
    page,
    pageSize,
  )

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
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
    setForm(EMPTY)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const err = editing
      ? await update(editing.id, Number(form.number), Number(form.capacity), form.locationId || null, form.status)
      : await create(Number(form.number), Number(form.capacity), form.locationId || null)
    setSaving(false)
    if (err) toast.error(err)
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
    if (err) toast.error(err)
    else {
      toast.success('Mesa eliminada')
      setDeleteId(null)
    }
  }

  const locationName = (id: string | null) =>
    id ? (locations.find((l) => l.id === id)?.name ?? '—') : '—'

  const filterBtnBase = 'px-3 py-1.5 rounded-xl border-2 font-display text-sm font-medium transition-all'
  const filterBtnActive = 'bg-brand-orange border-stone-dark text-white shadow-[2px_2px_0px_#78350F]'
  const filterBtnInactive = 'bg-white border-stone-dark/30 text-stone-dark hover:border-stone-dark'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-stone-dark">Mesas</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva mesa
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-4 border-stone-dark rounded-2xl px-4 py-3 shadow-[4px_4px_0px_#78350F] flex flex-wrap items-center gap-2">
        <span className="font-display text-sm text-stone-mid">Estado:</span>
        {(['all', 'active', 'blocked'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`${filterBtnBase} ${statusFilter === s ? filterBtnActive : filterBtnInactive}`}
          >
            {s === 'all' ? 'Todas' : STATUS_LABEL[s]}
          </button>
        ))}
        {statusFilter !== 'all' && (
          <button
            onClick={() => { setStatusFilter('all'); setPage(1) }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-stone-dark/30 font-display text-sm text-stone-mid hover:border-stone-dark hover:text-stone-dark transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton cols={5} />
      ) : (
        <div className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F]">
          <table className="w-full">
            <thead className="bg-brand-orange">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Mesa</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Capacidad</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Ubicación</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Estado</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {tables.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center font-display text-stone-mid">
                    {statusFilter !== 'all' ? 'Sin mesas con ese estado' : 'No hay mesas registradas'}
                  </td>
                </tr>
              )}
              {tables.map((t) => (
                <tr key={t.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-stone-dark">#{t.number}</td>
                  <td className="px-4 py-3 text-sm text-stone-dark">{t.capacity} personas</td>
                  <td className="px-4 py-3 text-sm text-stone-mid">{locationName(t.locationId)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border-2
                      ${t.status === 'active'
                        ? 'bg-brand-yellow/30 border-brand-yellow-dark text-stone-dark'
                        : 'bg-brand-red/10 border-brand-red text-brand-red'
                      }`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
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
          title={editing ? `Editar mesa #${editing.number}` : 'Nueva mesa'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Número</label>
                <input
                  type="number"
                  min={1}
                  className={input}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className={label}>Capacidad</label>
                <input
                  type="number"
                  min={1}
                  className={input}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className={label}>Ubicación</label>
              <select
                className={input}
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              >
                <option value="">Sin ubicación</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            {editing && (
              <div>
                <label className={label}>Estado</label>
                <select
                  className={input}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TableStatus })}
                >
                  <option value="active">Activa</option>
                  <option value="blocked">Bloqueada</option>
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
        <Modal title="Eliminar mesa" onClose={() => setDeleteId(null)}>
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
