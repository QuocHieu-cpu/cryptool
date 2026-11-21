const mod = (n, m) => ((n % m) + m) % m
const isLetter = c => c >= 'A' && c <= 'Z'

function caesar({ mode, text, key }) {
  const sign = mode === 'encrypt' ? 1 : -1
  const shift = mod(parseInt(key, 10) * sign, 26)
  const steps = []
  let result = ''
  for (const ch of text.toUpperCase()) {
    if (isLetter(ch)) {
      const out = String.fromCharCode(mod(ch.charCodeAt(0) - 65 + shift, 26) + 65)
      steps.push({ index: steps.length, input: ch, operation: `${ch} ${sign === 1 ? '+' : '-'} ${Math.abs(parseInt(key, 10))}`, output: out })
      result += out
    } else result += ch
  }
  return { result, steps }
}

function vigenere({ mode, text, key }) {
  const sign = mode === 'encrypt' ? 1 : -1
  const k = key.toUpperCase().replace(/[^A-Z]/g, '')
  const steps = []
  let result = ''
  let j = 0
  for (const ch of text.toUpperCase()) {
    if (isLetter(ch)) {
      const kc = k[j % k.length]
      const shift = kc.charCodeAt(0) - 65
      const out = String.fromCharCode(mod(ch.charCodeAt(0) - 65 + sign * shift, 26) + 65)
      steps.push({ index: steps.length, input: ch, operation: `${ch} ${sign === 1 ? '+' : '-'} ${kc}(${shift})`, output: out })
      result += out
      j++
    } else result += ch
  }
  return { result, steps }
}

const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a)

function determinant(matrix, n) {
  if (n === 1) return matrix[0]
  if (n === 2) return matrix[0] * matrix[3] - matrix[1] * matrix[2]
  let value = 0
  for (let col = 0; col < n; col++) {
    const minor = []
    for (let row = 1; row < n; row++) {
      for (let c = 0; c < n; c++) if (c !== col) minor.push(matrix[row * n + c])
    }
    value += (col % 2 ? -1 : 1) * matrix[col] * determinant(minor, n - 1)
  }
  return value
}

function inverseMod(value, m) {
  for (let candidate = 1; candidate < m; candidate++) if (mod(value * candidate, m) === 1) return candidate
  throw new Error('Ma trận khóa Hill không khả nghịch modulo 26.')
}

function inverseMatrix(matrix, n) {
  const det = determinant(matrix, n)
  if (gcd(det, 26) !== 1) throw new Error('Ma trận khóa Hill không khả nghịch modulo 26.')
  const invDet = inverseMod(mod(det, 26), 26)
  if (n === 1) return [invDet]
  const result = Array(n * n)
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const minor = []
      for (let r = 0; r < n; r++) {
        if (r === row) continue
        for (let c = 0; c < n; c++) if (c !== col) minor.push(matrix[r * n + c])
      }
      const cofactor = (row + col) % 2 ? -determinant(minor, n - 1) : determinant(minor, n - 1)
      result[col * n + row] = mod(invDet * cofactor, 26)
    }
  }
  return result
}

function hillCipher({ mode, text, key }) {
  const normalizedKey = key.trim().toUpperCase()
  const n = Math.sqrt(normalizedKey.length)
  const matrix = [...normalizedKey].map(ch => ch.charCodeAt(0) - 65)
  const transform = mode === 'decrypt' ? inverseMatrix(matrix, n) : matrix
  const chars = [...text]
  const positions = []
  const letters = []
  chars.forEach((ch, i) => {
    if (/^[A-Za-z]$/.test(ch)) {
      positions.push(i)
      letters.push(ch.toUpperCase().charCodeAt(0) - 65)
    }
  })
  if (!letters.length) throw new Error('Văn bản Hill cần có ít nhất một chữ cái A–Z.')
  if (mode === 'decrypt' && letters.length % n !== 0) {
    throw new Error(`Số chữ cái trong bản mã phải chia hết cho ${n}.`)
  }

  const pad = mode === 'encrypt' ? (n - letters.length % n) % n : 0
  for (let i = 0; i < pad; i++) letters.push(23) // X dùng làm ký tự đệm
  const transformed = []
  const steps = []
  for (let start = 0; start < letters.length; start += n) {
    const input = letters.slice(start, start + n)
    const output = Array(n).fill(0).map((_, row) =>
      mod(input.reduce((sum, value, col) => sum + transform[row * n + col] * value, 0), 26),
    )
    output.forEach((value, offset) => {
      const inputChar = String.fromCharCode(65 + input[offset])
      const outputChar = String.fromCharCode(65 + value)
      transformed.push(outputChar)
      steps.push({
        index: steps.length,
        input: inputChar,
        operation: `Hill: K·[${input.map(v => String.fromCharCode(65 + v)).join(' ')}] mod 26`,
        output: outputChar,
      })
    })
  }

  const outputChars = chars.map(ch => /^[A-Za-z]$/.test(ch) ? ch.toUpperCase() : ch)
  positions.forEach((position, i) => { outputChars[position] = transformed[i] })
  if (pad) outputChars.push(...transformed.slice(positions.length))
  const result = outputChars.join('')
  return {
    result,
    steps,
    note: mode === 'encrypt' && pad ? `Đã thêm ${pad} chữ X đệm ở cuối để đủ khối; khi giải mã, xóa phần X đệm nếu không thuộc văn bản gốc.` : '',
  }
}

function playfairCipher({ mode, text, key }) {
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'
  const square = []
  const seen = new Set()
  for (const ch of (key.toUpperCase().replace(/J/g, 'I') + alphabet).replace(/[^A-Z]/g, '')) {
    if (ch !== 'J' && !seen.has(ch)) {
      seen.add(ch)
      square.push(ch)
    }
  }
  const position = new Map(square.map((ch, i) => [ch, { row: Math.floor(i / 5), col: i % 5 }]))
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I')
  if (!cleanText) throw new Error('Playfair cần ít nhất một chữ cái A–Z.')

  const pairs = []
  if (mode === 'encrypt') {
    for (let i = 0; i < cleanText.length;) {
      const first = cleanText[i]
      const next = cleanText[i + 1]
      if (!next) {
        pairs.push([first, first === 'X' ? 'Q' : 'X'])
        i++
      } else if (first === next) {
        pairs.push([first, first === 'X' ? 'Q' : 'X'])
        i++
      } else {
        pairs.push([first, next])
        i += 2
      }
    }
  } else {
    if (cleanText.length % 2 !== 0) throw new Error('Bản mã Playfair phải có số chữ cái chẵn.')
    for (let i = 0; i < cleanText.length; i += 2) pairs.push([cleanText[i], cleanText[i + 1]])
  }

  const steps = []
  const result = []
  for (const [a, b] of pairs) {
    const pa = position.get(a)
    const pb = position.get(b)
    let outA, outB, rule
    if (pa.row === pb.row) {
      const direction = mode === 'encrypt' ? 1 : 4
      outA = square[pa.row * 5 + (pa.col + direction) % 5]
      outB = square[pb.row * 5 + (pb.col + direction) % 5]
      rule = `cùng hàng, dịch ${mode === 'encrypt' ? 'phải' : 'trái'}`
    } else if (pa.col === pb.col) {
      const direction = mode === 'encrypt' ? 1 : 4
      outA = square[((pa.row + direction) % 5) * 5 + pa.col]
      outB = square[((pb.row + direction) % 5) * 5 + pb.col]
      rule = `cùng cột, dịch ${mode === 'encrypt' ? 'xuống' : 'lên'}`
    } else {
      outA = square[pa.row * 5 + pb.col]
      outB = square[pb.row * 5 + pa.col]
      rule = 'hình chữ nhật, đổi cột'
    }
    result.push(outA, outB)
    steps.push({
      index: steps.length,
      input: a + b,
      operation: rule,
      output: outA + outB,
    })
  }

  return {
    result: result.join(''),
    steps,
    note: mode === 'encrypt'
      ? 'Playfair bỏ khoảng trắng/ký tự ngoài A–Z và gộp J thành I. Chữ X/Q có thể được thêm làm ký tự đệm; khi giải mã hãy đối chiếu để bỏ phần đệm.'
      : 'Playfair gộp J thành I; bản giải mã có thể còn chữ X/Q đệm, cần đối chiếu với văn bản gốc.',
  }
}

// Bảng chuẩn DES (FIPS 46-3).
const IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7]
const FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25]
const E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1]
const P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25]
const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4]
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32]
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1]
const SBOX = [
  [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
  [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
  [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
  [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
  [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
  [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
  [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
  [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]],
]

function permute(value, inputBits, table) {
  let output = 0n
  for (const position of table) output = (output << 1n) | ((value >> BigInt(inputBits - position)) & 1n)
  return output
}

function makeSubkeys(keyBytes) {
  let key = 0n
  for (const byte of keyBytes) key = (key << 8n) | BigInt(byte)
  const selected = permute(key, 64, PC1)
  let c = Number((selected >> 28n) & 0x0fffffffn)
  let d = Number(selected & 0x0fffffffn)
  const result = []
  for (const amount of SHIFTS) {
    c = ((c << amount) | (c >>> (28 - amount))) & 0x0fffffff
    d = ((d << amount) | (d >>> (28 - amount))) & 0x0fffffff
    result.push(permute((BigInt(c) << 28n) | BigInt(d), 56, PC2))
  }
  return result
}

function feistel(right, subkey) {
  const expanded = permute(BigInt(right >>> 0), 32, E) ^ subkey
  let substituted = 0
  for (let box = 0; box < 8; box++) {
    const six = Number((expanded >> BigInt(42 - box * 6)) & 0x3fn)
    const row = ((six & 0x20) >> 4) | (six & 1)
    const col = (six >> 1) & 0x0f
    substituted = (substituted << 4) | SBOX[box][row][col]
  }
  return Number(permute(BigInt(substituted >>> 0), 32, P)) >>> 0
}

function desBlock(bytes, subkeys) {
  let block = 0n
  for (const byte of bytes) block = (block << 8n) | BigInt(byte)
  const initial = permute(block, 64, IP)
  let left = Number((initial >> 32n) & 0xffffffffn) >>> 0
  let right = Number(initial & 0xffffffffn) >>> 0
  const rounds = []
  for (const [round, subkey] of subkeys.entries()) {
    const nextLeft = right
    const nextRight = (left ^ feistel(right, subkey)) >>> 0
    rounds.push({ round: round + 1, leftIn: left, rightIn: right, leftOut: nextLeft, rightOut: nextRight })
    left = nextLeft
    right = nextRight
  }
  const preoutput = (BigInt(right) << 32n) | BigInt(left)
  const final = permute(preoutput, 64, FP)
  const output = Array(8)
  let value = final
  for (let i = 7; i >= 0; i--) { output[i] = Number(value & 0xffn); value >>= 8n }
  return { output, rounds }
}

const toHex = bytes => bytes.map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()

function desCipher({ mode, text, key }) {
  const keyBytes = [...key].map(ch => ch.charCodeAt(0))
  let bytes
  if (mode === 'encrypt') {
    bytes = [...new TextEncoder().encode(text)]
    const pad = 8 - (bytes.length % 8)
    bytes.push(...Array(pad).fill(pad))
  } else {
    const hex = text.replace(/\s/g, '')
    bytes = hex.match(/.{2}/g).map(pair => parseInt(pair, 16))
  }

  const keys = makeSubkeys(keyBytes)
  if (mode === 'decrypt') keys.reverse()
  const output = []
  const steps = []
  for (let start = 0; start < bytes.length; start += 8) {
    const inputBlock = bytes.slice(start, start + 8)
    const { output: outputBlock, rounds } = desBlock(inputBlock, keys)
    const blockNumber = start / 8 + 1
    rounds.forEach(round => {
      const word = value => (value >>> 0).toString(16).padStart(8, '0').toUpperCase()
      steps.push({
        index: steps.length,
        input: `Vòng ${round.round}`,
        operation: `Khối ${blockNumber} · ${mode === 'encrypt' ? 'mã hóa' : 'giải mã'} ${round.round}/16`,
        output: `Vòng ${round.round}`,
        detailInput: `L=${word(round.leftIn)}  R=${word(round.rightIn)}`,
        detailOutput: `L=${word(round.leftOut)}  R=${word(round.rightOut)}`,
      })
    })
    output.push(...outputBlock)
  }

  if (mode === 'encrypt') return { result: toHex(output), steps }
  const pad = output[output.length - 1]
  if (pad < 1 || pad > 8 || output.slice(-pad).some(byte => byte !== pad)) {
    throw new Error('Không giải mã được. Hãy kiểm tra khóa DES và bản mã hexadecimal.')
  }
  const plainBytes = output.slice(0, -pad)
  let result
  try { result = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(plainBytes)) } catch {
    throw new Error('Kết quả không phải văn bản UTF-8 hợp lệ. Hãy kiểm tra khóa và bản mã.')
  }
  return { result, steps }
}

function modPow(base, exponent, modulus) {
  let result = 1n
  base %= modulus
  while (exponent > 0n) {
    if (exponent & 1n) result = (result * base) % modulus
    base = (base * base) % modulus
    exponent >>= 1n
  }
  return result
}

function rsaCipher({ mode, text, key }) {
  const [n, exponent] = key.split(',').map(part => BigInt(part.trim()))
  const steps = []
  if (mode === 'encrypt') {
    const bytes = [...new TextEncoder().encode(text)]
    const blocks = bytes.map((byte, index) => {
      const cipher = modPow(BigInt(byte), exponent, n)
      steps.push({
        index,
        input: `Byte ${index + 1}`,
        operation: 'm^e mod n',
        output: `Byte ${index + 1}`,
        detailInput: `m = ${byte}`,
        detailOutput: `c = ${cipher}`,
      })
      return cipher.toString()
    })
    return {
      result: blocks.join(' '),
      steps,
      note: 'RSA minh họa từng byte, không dùng padding bảo mật. Ví dụ tương ứng: khóa công khai 3233,17; khóa riêng 3233,2753. Không dùng cách này để bảo vệ dữ liệu thật.',
    }
  }

  const cipherBlocks = text.trim().split(/[\s,]+/).map(BigInt)
  const bytes = cipherBlocks.map((cipher, index) => {
    const message = modPow(cipher, exponent, n)
    if (message > 255n) throw new Error('Giải mã tạo ra giá trị không phải byte. Hãy kiểm tra khóa riêng và bản mã.')
    const byte = Number(message)
    steps.push({
      index,
      input: `Byte ${index + 1}`,
      operation: 'c^d mod n',
      output: `Byte ${index + 1}`,
      detailInput: `c = ${cipher}`,
      detailOutput: `m = ${byte}`,
    })
    return byte
  })
  let result
  try { result = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes)) } catch {
    throw new Error('Kết quả không phải văn bản UTF-8 hợp lệ. Hãy kiểm tra khóa riêng và bản mã.')
  }
  return {
    result,
    steps,
    note: 'RSA minh họa từng byte, không dùng padding bảo mật. Không dùng cách này để bảo vệ dữ liệu thật.',
  }
}

export function mockRun(params) {
  if (params.algorithm === 'caesar') return caesar(params)
  if (params.algorithm === 'vigenere') return vigenere(params)
  if (params.algorithm === 'hillcipher') return hillCipher(params)
  if (params.algorithm === 'playfair') return playfairCipher(params)
  if (params.algorithm === 'des') return desCipher(params)
  if (params.algorithm === 'rsa') return rsaCipher(params)
  return { result: '', steps: [] }
}
