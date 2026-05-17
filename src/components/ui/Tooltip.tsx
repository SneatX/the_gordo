import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TooltipProps } from '@/components/ui/types'

export default function Tooltip({ text, children, side = 'top' }: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const show = () => {
    if (!ref.current) return
    if (!window.matchMedia('(hover: hover)').matches) return
    const r = ref.current.getBoundingClientRect()
    const GAP = 8

    let top = 0
    let left = 0

    if (side === 'top') {
      top = r.top + window.scrollY - GAP
      left = r.left + window.scrollX + r.width / 2
    } else if (side === 'bottom') {
      top = r.bottom + window.scrollY + GAP
      left = r.left + window.scrollX + r.width / 2
    } else if (side === 'left') {
      top = r.top + window.scrollY + r.height / 2
      left = r.left + window.scrollX - GAP
    } else {
      top = r.top + window.scrollY + r.height / 2
      left = r.right + window.scrollX + GAP
    }

    setCoords({ top, left })
    setVisible(true)
  }

  const transformOrigin = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0%)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0%, -50%)',
  }[side]

  return (
    <>
      <div
        ref={ref}
        className="inline-block"
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              transform: transformOrigin,
              zIndex: 9999,
            }}
            className="pointer-events-none whitespace-nowrap px-2.5 py-1 rounded-lg bg-stone-dark text-white text-xs font-display font-semibold border-2 border-[#78350F] shadow-[2px_2px_0px_#78350F]"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  )
}
