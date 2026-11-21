import { useEffect, useState } from 'react'

export default function StepsViewer({ steps }) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setShown(0)
    if (!steps?.length) return
    const id = setInterval(() => {
      setShown(n => {
        if (n >= steps.length) {
          clearInterval(id)
          return n
        }
        return n + 1
      })
    }, 250)
    return () => clearInterval(id)
  }, [steps])

  if (!steps?.length) return null

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-muted">Các bước mô phỏng ({steps.length})</p>
        <button
          onClick={() => setShown(steps.length)}
          className="text-xs text-muted hover:text-primary"
        >
          Hiện hết
        </button>
      </div>
      <ol className="space-y-2">
        {steps.slice(0, shown).map(s => (
          <li
            key={s.index}
            className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm"
          >
            <span className="text-muted">{s.index + 1}.</span>
            <span>{s.input}</span>
            <span className="text-muted">{s.operation}</span>
            <span className="text-primary">→ {s.output}</span>
            {s.detailInput && (
              <span className="w-full break-all pl-8 text-xs text-muted">
                {s.detailInput} → {s.detailOutput}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
