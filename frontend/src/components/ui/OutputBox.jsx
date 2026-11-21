import { Copy } from 'lucide-react'

export default function OutputBox({ value }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-muted">Kết quả</span>
        <button
          onClick={() => navigator.clipboard.writeText(value)}
          className="flex items-center gap-1 text-xs text-muted hover:text-primary"
        >
          <Copy className="h-3.5 w-3.5" /> Copy
        </button>
      </div>
      <div className="min-h-24 rounded-md border border-border bg-surface p-3 font-mono text-sm break-all">
        {value || <span className="text-muted">Chưa có kết quả</span>}
      </div>
    </div>
  )
}
