import { useEffect, useState } from 'react'
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  Type, ArrowRightLeft, Gauge, Calculator, ArrowRight,
} from 'lucide-react'
import StepsViewer from './StepsViewer'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const mod = (n, m) => ((n % m) + m) % m
const SPEEDS = [
  { label: '0.5x', ms: 1100 },
  { label: '1x', ms: 700 },
  { label: '2x', ms: 350 },
]
const CHART_H = 300

const barPx = ch => {
  const idx = Math.min(25, Math.max(0, ch.charCodeAt(0) - 65))
  return 24 + (idx / 25) * (CHART_H - 60)
}

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-bg p-4">
      <div className={`rounded-md p-2.5 ${tone.bg} ${tone.text}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

function Chip({ ch, state }) {
  const cls =
    state === 'active'
      ? 'border-primary bg-primary/10 text-primary'
      : state === 'done'
      ? 'border-success/30 bg-success/10 text-success'
      : 'border-border text-muted'
  return (
    <span className={`flex min-h-9 items-center justify-center rounded-sm border font-mono transition ${ch.length > 1 ? 'min-w-9 px-2 text-xs' : 'w-9 text-sm'} ${cls}`}>
      {ch}
    </span>
  )
}

export default function SimPanel({ steps, algorithm }) {
  const [tab, setTab] = useState('sim')
  const [cur, setCur] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const total = steps?.length || 0

  useEffect(() => {
    setCur(0)
    setPlaying(false)
  }, [steps])

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setCur(c => {
        if (c >= total - 1) {
          setPlaying(false)
          return c
        }
        return c + 1
      })
    }, SPEEDS[speed].ms)
    return () => clearInterval(id)
  }, [playing, total, speed])

  const tabBtn = id => `rounded-md px-5 py-2 text-sm transition ${
    tab === id
      ? 'bg-primary-dark text-white font-medium'
      : 'text-muted hover:text-text'
  }`
  const iconBtn = 'rounded-md border border-border bg-bg p-3 text-muted transition hover:border-primary hover:text-primary'

  const step = steps?.[cur]
  const isDes = algorithm === 'des'
  const isRsa = algorithm === 'rsa'
  const isHill = algorithm === 'hillcipher'
  const isPlayfair = algorithm === 'playfair'
  const showLetterMap = algorithm === 'caesar' || algorithm === 'vigenere'
  const shift = step && showLetterMap ? mod(step.output.charCodeAt(0) - step.input.charCodeAt(0), 26) : 0
  const progress = total ? ((cur + 1) / total) * 100 : 0

  return (
    <div className="card p-6">
      <div className="mb-5 inline-flex gap-1 rounded-md border border-border bg-surface p-1">
        <button className={tabBtn('sim')} onClick={() => setTab('sim')}>Mô phỏng</button>
        <button className={tabBtn('steps')} onClick={() => setTab('steps')}>Các bước</button>
      </div>

      {!steps?.length ? (
        <div className="py-20 text-center">
          <p className="text-4xl">🔐</p>
          <p className="mt-3 text-sm text-muted">
            Nhập văn bản, khóa rồi bấm "Thực thi" để xem mô phỏng.
          </p>
        </div>
      ) : tab === 'steps' ? (
        <StepsViewer steps={steps} />
      ) : (
        <div className="space-y-6">
          {/* Tiêu đề + tiến độ */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-semibold">
                Mô phỏng thuật toán{' '}
                <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-sm text-primary">
                  {algorithm}
                </span>
              </p>
              <span className="rounded-md border border-border bg-bg px-2.5 py-1 font-mono text-xs text-muted">
                Độ phức tạp: <span className="text-warning">{isDes ? 'O(16·b)' : isRsa ? 'O(log e)' : isHill ? 'O(n²)' : 'O(n)'}</span>
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-sm bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Hero: ký tự vào -> ký tự ra */}
          <div className="flex items-center justify-center gap-6 rounded-lg border border-border bg-bg py-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted">Đầu vào</p>
              <p className={`mt-1 font-sans font-bold text-text ${isDes || isRsa ? 'text-2xl font-mono' : 'text-6xl'}`}>{step.input}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="rounded-sm border border-warning/40 bg-warning/10 px-3 py-1 font-mono text-xs text-warning">
                {step.operation}
              </span>
              <ArrowRight className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted">Đầu ra</p>
              <p className={`mt-1 font-sans font-bold text-success ${isDes || isRsa ? 'text-2xl font-mono' : 'text-6xl'}`}>
                {step.output}
              </p>
            </div>
          </div>

          {(isDes || isRsa) && step.detailInput && (
            <div className="grid gap-4 rounded-lg border border-border bg-bg p-5 md:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">{isDes ? 'Trạng thái trước vòng (L/R, hex)' : 'Giá trị trước phép toán'}</p>
                <p className="break-all font-mono text-sm text-text">{step.detailInput}</p>
              </div>
              <div className="min-w-0">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">{isDes ? 'Trạng thái sau vòng (L/R, hex)' : 'Giá trị sau phép toán'}</p>
                <p className="break-all font-mono text-sm text-success">{step.detailOutput}</p>
              </div>
            </div>
          )}

          {/* Biểu đồ chỉ phù hợp với phép dịch bảng chữ cái */}
          {showLetterMap && (
          <div className="rounded-lg border border-border bg-bg p-5">
            <div className="relative" style={{ height: CHART_H }}>
              {[0, 25, 50, 75].map(p => (
                <div
                  key={p}
                  className="absolute inset-x-0 border-t border-dashed border-white/5"
                  style={{ bottom: `${p}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end gap-2">
                {steps.map((s, i) => {
                  const active = i === cur
                  const ch = i <= cur ? s.output : s.input
                  return (
                    <div key={s.index} className="relative flex h-full flex-1 items-end justify-center">
                      {active && (
                        <div
                          className="absolute bottom-0 w-full border-2 border-dashed border-primary/50"
                          style={{ height: barPx(s.input) }}
                        />
                      )}
                      <div
                        className={`relative w-full transition-all duration-500 ${
                          active
                            ? 'bg-primary'
                            : i < cur
                            ? 'bg-success/30'
                            : 'bg-border'
                        }`}
                        style={{ height: barPx(ch) }}
                      >
                        {active && (
                          <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-primary px-2 py-0.5 font-mono text-xs font-semibold text-bg">
                            {s.input} → {s.output}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              {steps.map((s, i) => (
                <span
                  key={s.index}
                  className={`flex-1 text-center font-mono text-sm ${
                    i === cur ? 'font-bold text-primary' : i < cur ? 'text-success/70' : 'text-muted'
                  }`}
                >
                  {i <= cur ? s.output : s.input}
                </span>
              ))}
            </div>
          </div>
          )}

          {/* Chuỗi vào / ra */}
          {!isDes && !isRsa && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">Văn bản gốc</p>
              <div className="flex flex-wrap gap-1.5">
                {steps.map((s, i) => (
                  <Chip key={s.index} ch={s.input} state={i === cur ? 'active' : i < cur ? 'done' : 'idle'} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">Bản mã</p>
              <div className="flex flex-wrap gap-1.5">
                {steps.map((s, i) => (
                  <Chip
                    key={s.index}
                    ch={i <= cur ? s.output : '·'}
                    state={i === cur ? 'active' : i < cur ? 'done' : 'idle'}
                  />
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Bảng chữ cái */}
          <div className="rounded-lg border border-border bg-bg p-4">
            <div className="grid gap-1 font-mono text-xs" style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }}>
              {LETTERS.map(l => (
                <div key={l} className={`rounded-sm py-1.5 text-center transition ${
                  l === step.input ? 'bg-primary font-bold text-bg' : 'text-muted'
                }`}>{l}</div>
              ))}
            </div>
            <p className="my-2 text-center text-xs text-primary">↓ dịch {shift} vị trí</p>
            <div className="grid gap-1 font-mono text-xs" style={{ gridTemplateColumns: 'repeat(26, minmax(0, 1fr))' }}>
              {LETTERS.map((_, i) => (
                <div key={i} className={`rounded-sm py-1.5 text-center transition ${
                  LETTERS[i] === step.input ? 'bg-success font-bold text-bg' : 'text-muted'
                }`}>{LETTERS[mod(i + shift, 26)]}</div>
              ))}
            </div>
          </div>

          {/* Thống kê */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={Type} label={isDes ? 'Vòng đang xử lý' : isRsa ? 'Byte đang xử lý' : isPlayfair ? 'Cặp chữ đang xử lý' : 'Ký tự đang xử lý'} value={step.input}
                  tone={{ bg: 'bg-primary/10', text: 'text-primary' }} />
            <Stat icon={ArrowRightLeft} label={isDes ? 'Số vòng DES' : isRsa ? 'Phép toán RSA' : isHill ? 'Phép biến đổi' : isPlayfair ? 'Quy tắc' : 'Độ dịch'} value={isDes ? '16' : isRsa || isHill ? step.operation : isPlayfair ? step.operation : shift}
                  tone={{ bg: 'bg-warning/10', text: 'text-warning' }} />
            <Stat icon={Gauge} label="Tiến độ" value={`${cur + 1}/${total}`}
                  tone={{ bg: 'bg-success/10', text: 'text-success' }} />
            <Stat icon={Calculator} label="Phép tính" value={step.operation}
                  tone={{ bg: 'bg-primary/10', text: 'text-primary' }} />
          </div>

          {/* Điều khiển */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className={iconBtn} onClick={() => { setPlaying(false); setCur(0) }}>
              <RotateCcw className="h-5 w-5" />
            </button>
            <button className={iconBtn} onClick={() => { setPlaying(false); setCur(c => Math.max(0, c - 1)) }}>
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              className="rounded-md bg-primary-dark p-3 text-white transition hover:bg-primary"
              onClick={() => {
                if (cur >= total - 1) setCur(0)
                setPlaying(p => !p)
              }}
            >
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <button className={iconBtn} onClick={() => { setPlaying(false); setCur(c => Math.min(total - 1, c + 1)) }}>
              <SkipForward className="h-5 w-5" />
            </button>
            <div className="ml-2 inline-flex rounded-md border border-border bg-surface p-1">
              {SPEEDS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSpeed(i)}
                  className={`rounded-sm px-3 py-1.5 font-mono text-xs transition ${
                    speed === i ? 'bg-primary/10 text-primary' : 'text-muted hover:text-text'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
