import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const handleToggle = () => {
    if (disabled) return
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen((v) => !v)
  }

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        dropRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={[
          'w-full flex items-center justify-between border-2 rounded-xl px-3 py-2 text-sm font-display bg-white transition-colors',
          open
            ? 'border-brand-orange shadow-[0_0_0_3px_rgba(249,115,22,0.15)]'
            : 'border-stone-dark hover:border-brand-orange/60',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className={selected ? 'text-stone-dark' : 'text-stone-mid'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-stone-mid shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropRef}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            className="fixed z-[300] bg-white border-2 border-stone-dark rounded-xl shadow-[4px_4px_0px_#78350F] overflow-hidden max-h-60 overflow-y-auto animate-fade-in"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onMouseDown={() => { onChange(opt.value); setOpen(false) }}
                className={[
                  'w-full text-left px-3 py-2.5 text-sm font-display transition-colors border-b border-stone-dark/5 last:border-0',
                  opt.value === value
                    ? 'bg-brand-orange text-white font-semibold'
                    : 'text-stone-dark hover:bg-bg-warm',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
