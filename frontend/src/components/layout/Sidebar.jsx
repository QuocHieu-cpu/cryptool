import { algorithms } from '../../data/algorithms'

export default function Sidebar({ selected, onSelect }) {
  return (
    <aside className="shrink-0 border-b border-border bg-surface/80 p-3 backdrop-blur md:w-60 md:border-b-0 md:border-r md:p-4">
      <p className="mb-3 hidden text-xs uppercase tracking-wider text-muted md:block">Thuật toán mã hóa</p>
      <nav className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
        {algorithms.map(a => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`shrink-0 whitespace-nowrap rounded-md border-l-2 px-3 py-2 text-left text-sm transition ${
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
