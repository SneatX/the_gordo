interface Props {
  cols: number
  rows?: number
}

export default function TableSkeleton({ cols, rows = 5 }: Props) {
  return (
    <div className="bg-white border-4 border-stone-dark rounded-2xl overflow-hidden shadow-[4px_4px_0px_#78350F]">
      <div className="bg-brand-orange/60 h-[46px] animate-pulse" />
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-t-2 border-stone-dark/10 animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-stone-dark/10 rounded-full"
                style={{
                  flex: j === cols - 1 ? '0 0 64px' : j === 0 ? '2' : '1',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
