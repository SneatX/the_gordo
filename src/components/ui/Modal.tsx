import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl border-4 border-stone-dark shadow-[6px_6px_0px_#78350F] w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b-2 border-stone-dark/20">
          <h2 className="font-display text-xl font-bold text-stone-dark">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-warm text-stone-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
