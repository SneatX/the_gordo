import { X } from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-bg-cream rounded-3xl border-4 border-stone-dark shadow-[8px_8px_0px_#78350F] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-brand-orange px-6 py-4 flex items-center justify-between border-b-4 border-stone-dark flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-white">{title}</h2>
          <Tooltip text="Cerrar" side="left">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
