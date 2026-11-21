export function validate({ algorithm, mode, text, key }) {
  if (!text.trim()) return 'Vui lòng nhập văn bản.'
  if (!key.trim()) return 'Vui lòng nhập khóa.'
  if (algorithm === 'caesar') {
    if (!/^-?\d+$/.test(key.trim())) {
      return 'Khóa Caesar phải là một số nguyên (vd: 3).'
    }
    return ''
  }
  if (algorithm === 'des') {
    if (!/^[\x20-\x7E]{8}$/.test(key)) return 'Khóa DES phải gồm đúng 8 ký tự ASCII.'
    if (mode === 'decrypt') {
      if (!/^[\s0-9a-fA-F]+$/.test(text)) return 'Bản mã DES phải ở dạng hexadecimal.'
      if (text.replace(/\s/g, '').length % 16 !== 0) return 'Bản mã DES phải có số ký tự hex chia hết cho 16.'
    }
    return ''
  }
  if (algorithm === 'rsa') {
    const parts = key.split(',').map(part => part.trim())
    if (parts.length !== 2 || parts.some(part => !/^\d{1,80}$/.test(part))) {
      return mode === 'encrypt'
        ? 'Nhập khóa công khai theo dạng n,e (ví dụ: 3233,17).'
        : 'Nhập khóa riêng theo dạng n,d (ví dụ: 3233,2753).'
    }
    const [n, exponent] = parts.map(BigInt)
    if (n <= 255n) return 'RSA cần n lớn hơn 255 để mã hóa từng byte UTF-8.'
    if (exponent <= 0n || exponent >= n) return 'Số mũ RSA phải lớn hơn 0 và nhỏ hơn n.'
    if (mode === 'decrypt') {
      if (!/^\s*\d+(?:[\s,]+\d+)*\s*$/.test(text)) return 'Bản mã RSA cần là các số thập phân cách nhau bằng dấu cách hoặc dấu phẩy.'
      const blocks = text.trim().split(/[\s,]+/).map(BigInt)
      if (blocks.some(block => block >= n)) return 'Mỗi số trong bản mã RSA phải nhỏ hơn n.'
    }
    return ''
  }
  if (!/^[A-Za-z]+$/.test(key.trim())) {
    return 'Khóa chỉ được gồm chữ cái, không dấu, không khoảng trắng.'
  }
  if (algorithm === 'hillcipher') {
    const normalizedKey = key.trim()
    const size = Math.sqrt(normalizedKey.length)
    if (!Number.isInteger(size) || size < 2 || size > 5) {
      return 'Khóa Hill phải có 4, 9, 16 hoặc 25 chữ cái (ma trận 2×2 đến 5×5).'
    }
    const matrix = [...normalizedKey.toUpperCase()].map(ch => ch.charCodeAt(0) - 65)
    const determinant = det(matrix, size)
    if (gcd(determinant, 26) !== 1) {
      return 'Ma trận khóa Hill không khả nghịch modulo 26; hãy chọn khóa khác.'
    }
    const letterCount = text.toUpperCase().replace(/[^A-Z]/g, '').length
    if (algorithm === 'hillcipher' && text.trim() && letterCount === 0) {
      return 'Văn bản Hill cần có ít nhất một chữ cái A–Z.'
    }
    if (mode === 'decrypt' && letterCount % size !== 0) {
      return `Khi giải mã Hill, số chữ cái trong bản mã phải chia hết cho ${size}.`
    }
  }
  if (algorithm === 'playfair') {
    const letterCount = text.toUpperCase().replace(/[^A-Z]/g, '').length
    if (!letterCount) return 'Văn bản Playfair cần có ít nhất một chữ cái A–Z.'
    if (mode === 'decrypt' && letterCount % 2 !== 0) {
      return 'Bản mã Playfair phải có số chữ cái chẵn.'
    }
  }
  return ''
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

function det(values, n) {
  if (n === 1) return values[0]
  if (n === 2) return values[0] * values[3] - values[1] * values[2]
  let result = 0
  for (let col = 0; col < n; col++) {
    const minor = []
    for (let row = 1; row < n; row++) {
      for (let c = 0; c < n; c++) if (c !== col) minor.push(values[row * n + c])
    }
    result += (col % 2 ? -1 : 1) * values[col] * det(minor, n - 1)
  }
  return result
}

