import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLocations } from '@/hooks/useLocations'
import Modal from '@/components/ui/Modal'
import type { Location } from '@/types'

const EMPTY = { name: '', description: '' }
const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors'
const label = 'block font-display font-medium text-stone-dark mb-1 text-sm'

export default function LocationPage() {
  const { locations, loading, create, update, remove } = useLocations()

  const [editing, setEditing] = useState<Location | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
    if (err) toast.error(err)
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
    if (err) toast.error(err)
    else {
      toast.success('Ubicación eliminada')
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-stone-dark">Ubicaciones</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva ubicación
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="font-display text-stone-dark">Cargando...</p>
      ) : (
        <div className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F]">
          <table className="w-full">
            <thead className="bg-brand-orange">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Nombre</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Descripción</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center font-display text-stone-mid">
                    No hay ubicaciones registradas
                  </td>
                </tr>
              )}
              {locations.map((loc) => (
                <tr key={loc.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-stone-dark">{loc.name}</td>
                  <td className="px-4 py-3 text-sm text-stone-mid">{loc.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEdit(loc)}
                        className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(loc.id)}
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

      {/* Create / Edit modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'Editar ubicación' : 'Nueva ubicación'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Nombre</label>
              <input
                className={input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label className={label}>Descripción</label>
              <textarea
                className={`${input} resize-none`}
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
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

      {/* Delete confirm modal */}
      {deleteId && (
        <Modal title="Eliminar ubicación" onClose={() => setDeleteId(null)}>
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
