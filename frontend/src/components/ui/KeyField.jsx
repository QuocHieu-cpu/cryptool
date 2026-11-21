export default function KeyField({ value, onChange, hint, label = 'Khóa' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={hint}
        className="w-full rounded-md border border-border bg-bg p-3 font-mono text-sm outline-none focus:border-primary"
      />
    </label>
  )
}
