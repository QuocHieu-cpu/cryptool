import { useState } from 'react'
import { algorithms } from '../../data/algorithms'
import { mockRun } from '../../data/mockEngine'
import { validate } from '../../data/validate'
import ModeSelector from '../ui/ModeSelector'
import TextInput from '../ui/TextInput'
import KeyField from '../ui/KeyField'
import OutputBox from '../ui/OutputBox'
import StepsViewer from '../ui/StepsViewer'
import SimPanel from '../ui/SimPanel'

export default function Workspace({ algorithm }) {
  const [mode, setMode] = useState('encrypt')
  const [text, setText] = useState('')
  const [key, setKey] = useState('')
  const [result, setResult] = useState('')
  const [note, setNote] = useState('')
  const [steps, setSteps] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const current = algorithms.find(a => a.id === algorithm)
  const apiAlgorithms = ['caesar', 'vigenere', 'playfair']

  const handleRun = async () => {
    const msg = validate({ algorithm, mode, text, key })
    setError(msg)
    if (msg) return

    setLoading(true)
    setNote('')
    const apiUrl = import.meta.env.VITE_API_URL || ''
    try {
      let data
      if (apiAlgorithms.includes(algorithm)) {
        const endpoint = `${apiUrl.replace(/\/+$/, '')}/api/crypto`
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ algorithm, mode, text, key }),
        })
        data = await res.json()
        if (!res.ok || data.success === false) {
          throw new Error(data.error || `Server trả về lỗi ${res.status}`)
        }
      } else {
        data = mockRun({ algorithm, mode, text, key })
      }
      setResult(data.result)
      setSteps(data.steps || [])
      setNote(data.note || '')
    } catch (e) {
      setError(apiAlgorithms.includes(algorithm) ? `Backend: ${e.message}` : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
  <main className="flex-1 overflow-y-auto p-6">
    <h2 className="mb-4 text-xl font-semibold">
      <span className="text-muted">Thuật toán: </span>
      <span className="font-mono text-primary">{current.name}</span>
    </h2>
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
          <ModeSelector value={mode} onChange={setMode} />
          <TextInput
            value={text}
            onChange={setText}
            placeholder={algorithm === 'des'
              ? mode === 'decrypt' ? 'Dán bản mã hexadecimal...' : 'Nhập văn bản UTF-8...'
              : algorithm === 'rsa'
                ? mode === 'decrypt' ? 'Dán các số bản mã, ví dụ: 2790 641 2996...' : 'Nhập văn bản UTF-8...'
              : algorithm === 'hillcipher' ? 'Nhập văn bản A–Z; ký tự khác sẽ được giữ nguyên...' : 'Nhập văn bản...'}
          />
          <KeyField
            value={key}
            onChange={setKey}
            label={algorithm === 'rsa' ? mode === 'encrypt' ? 'Khóa công khai (n,e)' : 'Khóa riêng (n,d)' : 'Khóa'}
            hint={algorithm === 'rsa'
              ? mode === 'encrypt' ? '3233,17' : '3233,2753'
              : current.keyHint}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            onClick={handleRun}
            disabled={loading}
            className="rounded-md bg-primary-dark px-5 py-2 font-medium text-white transition hover:bg-primary hover:text-bg disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Thực thi'}
          </button>
        </div>
        <div className="card p-5">
          <OutputBox value={result} />
          {note && <p className="mt-3 text-sm text-warning">{note}</p>}
        </div>
      </div>
      <SimPanel steps={steps} algorithm={algorithm} />
    </div>
  </main>
)
}
