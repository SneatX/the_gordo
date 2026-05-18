import Modal from '@/components/ui/Modal'
import type { Reservation } from '@/types'

interface Props {
  reservation: Reservation
  onClose: () => void
  onConfirm: () => void
  cancelling: boolean
}

export default function CancelReservationModal({ reservation, onClose, onConfirm, cancelling }: Props) {
  return (
    <Modal title="Cancelar reserva" onClose={onClose}>
      <p className="text-sm text-stone-dark mb-1">
        ¿Cancelar la reserva de <span className="font-semibold">{reservation.customerName}</span>?
      </p>
      <p className="text-xs text-stone-mid mb-6">Esta acción cambiará el estado a Cancelada.</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-xl border-2 border-stone-dark font-display font-medium text-sm text-stone-dark hover:bg-bg-warm transition-colors"
        >
          Volver
        </button>
        <button
          onClick={onConfirm}
          disabled={cancelling}
          className="flex-1 py-2 rounded-xl border-2 border-stone-dark bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 font-display font-semibold text-sm text-white shadow-[3px_3px_0px_#78350F] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
        >
          {cancelling ? 'Cancelando...' : 'Cancelar reserva'}
        </button>
      </div>
    </Modal>
  )
}
