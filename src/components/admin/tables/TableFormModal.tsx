import Modal from '@/components/ui/Modal'
import CustomSelect from '@/components/ui/CustomSelect'
import { EMPTY_FORM } from './types'
import type { TableForm } from './types'
import type { RestaurantTable, TableStatus, Location } from '@/types'

const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] transition-colors'
const label = 'block font-display font-medium text-stone-dark mb-1 text-sm'

interface Props {
  editing: RestaurantTable | null
  form: TableForm
  onFormChange: (form: TableForm) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
  locations: Location[]
}

export default function TableFormModal({ editing, form, onFormChange, onClose, onSubmit, saving, locations }: Props) {
  return (
    <Modal
      title={editing ? `Editar mesa #${editing.number}` : 'Nueva mesa'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Número</label>
            <input
              type="number"
              min={1}
              className={input}
              value={form.number}
              onChange={(e) => onFormChange({ ...form, number: e.target.value })}
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
              onChange={(e) => onFormChange({ ...form, capacity: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className={label}>Ubicación</label>
          <CustomSelect
            value={form.locationId}
            onChange={(v) => onFormChange({ ...form, locationId: v })}
            placeholder="Sin ubicación"
            options={[
              { value: '', label: 'Sin ubicación' },
              ...locations.map((l) => ({ value: l.id, label: l.name })),
            ]}
          />
        </div>
        {editing && (
          <div>
            <label className={label}>Estado</label>
            <CustomSelect
              value={form.status}
              onChange={(v) => onFormChange({ ...form, status: v as TableStatus })}
              options={[
                { value: 'active', label: 'Activa' },
                { value: 'blocked', label: 'Bloqueada' },
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
