export default function ModeSelector({ value, onChange }) {
  const options = [
    { id: 'encrypt', label: 'Mã hóa' },
    { id: 'decrypt', label: 'Giải mã' },
  ]
  return (
    <div className="inline-flex rounded-md border border-border p-1">
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-sm px-4 py-1.5 text-sm transition ${
            value === o.id ? 'bg-primary text-bg font-medium' : 'text-muted hover:text-text'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
