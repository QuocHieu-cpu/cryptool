export default function TextInput({ value, onChange, placeholder = 'Nhập văn bản...' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-muted">Văn bản đầu vào</span>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-md border border-border bg-bg p-3 font-mono text-sm outline-none focus:border-primary"
        placeholder={placeholder}
      />
    </label>
  )
}
