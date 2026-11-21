export const codeSamples = {
  caesar: {
    lines: [
      'function caesar(text, k) {',
      "  let result = ''",
      '  for (const ch of text) {',
      '    if (isLetter(ch)) {',
      '      const out = shift(ch, k)',
      '      result += out',
      '    } else result += ch',
      '  }',
      '  return result',
      '}',
    ],
    phases: [3, 4, 5, 6], // số dòng (tính từ 1) sáng lần lượt trong mỗi bước
  },
  vigenere: {
    lines: [
      'function vigenere(text, key) {',
      "  let result = '', j = 0",
      '  for (const ch of text) {',
      '    if (isLetter(ch)) {',
      '      const s = key[j % key.length] - "A"',
      '      result += shift(ch, s)',
      '      j++',
      '    } else result += ch',
      '  }',
      '  return result',
      '}',
    ],
    phases: [3, 4, 5, 6, 7],
  },
}