import { algorithms } from '../../data/algorithms'

export default function Sidebar({ selected, onSelect }) {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface p-4">
      <p className="mb-3 text-xs uppercase tracking-wider text-muted">Thuật toán mã hóa</p>
      <nav className="flex flex-col gap-1">
        {algorithms.map(a => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`rounded-md border-l-2 px-3 py-2 text-left text-sm transition ${
              selected === a.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent text-muted hover:bg-border/50 hover:text-text'
            }`}
          >
            {a.name}
          </button>
        ))}
      </nav>
    </aside>
  )
}
