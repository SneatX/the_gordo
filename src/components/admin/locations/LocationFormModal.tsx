import Modal from '@/components/ui/Modal'
import type { Location } from '@/types'
import type { LocationForm } from './types'

const input = 'w-full border-2 border-stone-dark rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors'
const label = 'block font-display font-medium text-stone-dark mb-1 text-sm'

interface Props {
  editing: Location | null
  form: LocationForm
  onFormChange: (form: LocationForm) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  saving: boolean
}

export default function LocationFormModal({ editing, form, onFormChange, onClose, onSubmit, saving }: Props) {
  return (
    <Modal
      title={editing ? 'Editar ubicación' : 'Nueva ubicación'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={label}>Nombre</label>
          <input
            className={input}
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
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
            onChange={(e) => onFormChange({ ...form, description: e.target.value })}
          />
        </div>
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
