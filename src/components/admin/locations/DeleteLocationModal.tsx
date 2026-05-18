import Modal from '@/components/ui/Modal'

interface Props {
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
}

export default function DeleteLocationModal({ onClose, onConfirm, deleting }: Props) {
  return (
    <Modal title="Eliminar ubicación" onClose={onClose}>
      <p className="text-sm text-stone-dark mb-6">
        ¿Estás seguro? Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-xl border-2 border-stone-dark font-display font-medium text-sm text-stone-dark hover:bg-bg-warm transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 py-2 rounded-xl border-2 border-stone-dark bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 font-display font-semibold text-sm text-white shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  )
}
