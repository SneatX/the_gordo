import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useReservations } from '@/hooks/useReservations'
import { useRestaurantTables } from '@/hooks/useRestaurantTables'
import Modal from '@/components/ui/Modal'
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

export default function ReservationPage() {
  const { reservations, loading, create, update, remove } = useReservations()
  const { tables } = useRestaurantTables()

  const [editing, setEditing] = useState<Reservation | null>(null)
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

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-stone-dark">Reservas</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-display font-semibold text-sm px-4 py-2.5 rounded-xl border-2 border-stone-dark shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
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
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Cliente</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Mesa</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Personas</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Fecha y hora</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Duración</th>
                <th className="text-left px-4 py-3 font-display font-semibold text-white text-sm">Estado</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-display text-stone-mid">
                    No hay reservas registradas
                  </td>
                </tr>
              )}
              {reservations.map((r) => (
                <tr key={r.id} className="border-t-2 border-stone-dark/10 hover:bg-bg-warm transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-stone-dark">{r.customerName}</p>
                    <p className="text-xs text-stone-mid">{r.customerPhone}</p>
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
      )}

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
                  className={input}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
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
