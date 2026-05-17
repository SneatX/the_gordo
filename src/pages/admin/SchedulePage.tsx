import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSchedules } from '@/hooks/useSchedules'
import { usePagination } from '@/hooks/usePagination'
import Modal from '@/components/ui/Modal'
import TableSkeleton from '@/components/ui/TableSkeleton'
import TablePagination from '@/components/ui/TablePagination'
import type { Schedule } from '@/types'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const EMPTY = { dayOfWeek: '1', startTime: '09:00', endTime: '22:00', isActive: true }
const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors'
const label = 'block font-display font-medium text-stone-dark mb-1 text-sm'

export default function SchedulePage() {
  const { schedules, loading, create, update, remove } = useSchedules()

  const [editing, setEditing] = useState<Schedule | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { page, pageSize, setPage, setPageSize, paginated, total } = usePagination(schedules, 10)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY)
    setModalOpen(true)
  }

  const openEdit = (s: Schedule) => {
    setEditing(s)
    setForm({
      dayOfWeek: String(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime,
      isActive: s.isActive,
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
      ? await update(editing.id, Number(form.dayOfWeek), form.startTime, form.endTime, form.isActive)
      : await create(Number(form.dayOfWeek), form.startTime, form.endTime, form.isActive)
    setSaving(false)
    if (err) toast.error(err)
    else {
      toast.success(editing ? 'Horario actualizado' : 'Horario creado')
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
      toast.success('Horario eliminado')
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-stone-dark">Horarios</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo horario
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton cols={5} />
      ) : (
        <>
          <div className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F]">
            <table className="w-full">
              <thead className="bg-brand-orange">
                <tr>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Día</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Apertura</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Cierre</th>
                  <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Estado</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center font-display text-stone-mid">
                      No hay horarios registrados
                    </td>
                  </tr>
                )}
                {paginated.map((s) => (
                  <tr key={s.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-stone-dark">{DAYS[s.dayOfWeek]}</td>
                    <td className="px-4 py-3 text-sm text-stone-dark">{s.startTime}</td>
                    <td className="px-4 py-3 text-sm text-stone-dark">{s.endTime}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-display font-semibold border-2
                        ${s.isActive
                          ? 'bg-brand-yellow/30 border-brand-yellow-dark text-stone-dark'
                          : 'bg-stone-dark/10 border-stone-dark/30 text-stone-mid'
                        }`}>
                        {s.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg hover:bg-brand-yellow/40 text-stone-dark transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
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

          <TablePagination
            total={total}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}

      {/* Create / Edit modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'Editar horario' : 'Nuevo horario'}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={label}>Día</label>
              <select
                className={input}
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              >
                {DAYS.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Apertura</label>
                <input
                  type="time"
                  className={input}
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={label}>Cierre</label>
                <input
                  type="time"
                  className={input}
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 accent-brand-orange"
              />
              <span className="font-display font-medium text-stone-dark text-sm">Activo</span>
            </label>
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
        <Modal title="Eliminar horario" onClose={() => setDeleteId(null)}>
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
