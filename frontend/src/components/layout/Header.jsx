import { Lock } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-surface px-6">
      <Lock className="h-5 w-5 text-primary" />
      <h1 className="font-semibold">WebCryptool</h1>
    </header>
  )
}