"use strict";

const ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

function validateMode(mode) {
  if (mode !== "encrypt" && mode !== "decrypt") {
    throw new Error("mode phải là encrypt hoặc decrypt.");
  }
}

function caesarCipher(text, key, mode) {
  validateMode(mode);
  if (key === "" || key === null || key === undefined || !Number.isInteger(Number(key))) {
    throw new Error("Khóa Caesar phải là số nguyên.");
  }

  const shift = ((Number(key) % 26) + 26) % 26 * (mode === "decrypt" ? -1 : 1);
  const output = [];
  const steps = [];
  for (const char of text) {
    if (/^[A-Za-z]$/.test(char)) {
      const base = char === char.toUpperCase() ? 65 : 97;
      const original = char.charCodeAt(0) - base;
      const encoded = ((original + shift) % 26 + 26) % 26;
      const resultChar = String.fromCharCode(base + encoded);
      output.push(resultChar);
      steps.push({
        index: steps.length,
        input: char,
        operation: `(${original} ${shift >= 0 ? "+" : "-"} ${Math.abs(shift)}) mod 26 = ${encoded}`,
        output: resultChar,
      });
    } else {
      output.push(char);
      steps.push({ index: steps.length, input: char, operation: "Giữ nguyên ký tự ngoài A-Z", output: char });
    }
  }
  return { result: output.join(""), steps };
}

function vigenereCipher(text, key, mode) {
  validateMode(mode);
  if (typeof key !== "string" || !/^[A-Za-z]+$/.test(key)) {
    throw new Error("Khóa Vigenere chỉ được gồm chữ cái A-Z.");
  }

  const keyUpper = key.toUpperCase();
  const output = [];
  const steps = [];
  let keyIndex = 0;
  for (const char of text) {
    if (/^[A-Za-z]$/.test(char)) {
      const base = char === char.toUpperCase() ? 65 : 97;
      const original = char.charCodeAt(0) - base;
      const keyShift = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65;
      const signedShift = mode === "encrypt" ? keyShift : -keyShift;
      const encoded = ((original + signedShift) % 26 + 26) % 26;
      const resultChar = String.fromCharCode(base + encoded);
      output.push(resultChar);
      steps.push({
        index: steps.length,
        input: char,
        operation: `(${original} ${signedShift >= 0 ? "+" : "-"} ${keyShift}) mod 26 = ${encoded}`,
        output: resultChar,
      });
      keyIndex += 1;
    } else {
      output.push(char);
    }
  }
  return { result: output.join(""), steps };
}

function playfairMatrix(key) {
  if (typeof key !== "string" || !/^[A-Za-z]+$/.test(key)) {
    throw new Error("Khóa Playfair chỉ được gồm chữ cái A-Z.");
  }
  const chars = [];
  for (const char of (key.toUpperCase().replaceAll("J", "I") + ALPHABET)) {
    if (ALPHABET.includes(char) && !chars.includes(char)) chars.push(char);
  }
  return Array.from({ length: 5 }, (_, row) => chars.slice(row * 5, row * 5 + 5));
}

function playfairCipher(text, key, mode) {
  validateMode(mode);
  const matrix = playfairMatrix(key);
  const clean = Array.from(text.toUpperCase().replaceAll("J", "I"))
    .filter((char) => ALPHABET.includes(char));
  if (!clean.length) throw new Error("Văn bản Playfair cần có ít nhất một chữ cái A-Z.");

  const pairs = [];
  if (mode === "decrypt") {
    if (clean.length % 2) throw new Error("Bản mã Playfair phải có số chữ cái chẵn.");
    for (let i = 0; i < clean.length; i += 2) pairs.push([clean[i], clean[i + 1]]);
  } else {
    for (let i = 0; i < clean.length;) {
      const first = clean[i];
      if (i + 1 >= clean.length || clean[i + 1] === first) {
        pairs.push([first, first === "X" ? "Q" : "X"]);
        i += 1;
      } else {
        pairs.push([first, clean[i + 1]]);
        i += 2;
      }
    }
  }

  const position = (char) => {
    const index = matrix.flat().indexOf(char);
    if (index < 0) throw new Error(`Ký tự ${JSON.stringify(char)} không nằm trong bảng Playfair.`);
    return [Math.floor(index / 5), index % 5];
  };
  const direction = mode === "encrypt" ? 1 : -1;
  const steps = [];
  const output = pairs.map(([first, second]) => {
    const [row1, col1] = position(first);
    const [row2, col2] = position(second);
    let out1;
    let out2;
    let operation;
    if (row1 === row2) {
      out1 = matrix[row1][(col1 + direction + 5) % 5];
      out2 = matrix[row2][(col2 + direction + 5) % 5];
      operation = direction === 1 ? "Cùng hàng: dịch phải" : "Cùng hàng: dịch trái";
    } else if (col1 === col2) {
      out1 = matrix[(row1 + direction + 5) % 5][col1];
      out2 = matrix[(row2 + direction + 5) % 5][col2];
      operation = direction === 1 ? "Cùng cột: dịch xuống" : "Cùng cột: dịch lên";
    } else {
      out1 = matrix[row1][col2];
      out2 = matrix[row2][col1];
      operation = "Hình chữ nhật: đổi cột";
    }
    const resultPair = out1 + out2;
    steps.push({ index: steps.length, input: first + second, operation, output: resultPair });
    return resultPair;
  });

  return {
    result: output.join(""),
    steps,
    matrix,
    note: "Playfair bỏ dấu câu/khoảng trắng, gộp J thành I. Khi mã hóa có thể thêm X/Q làm ký tự đệm; bản giải mã có thể còn ký tự đệm cần đối chiếu thủ công.",
  };
}

const algorithms = {
  caesar: caesarCipher,
  vigenere: vigenereCipher,
  playfair: playfairCipher,
};

function processCrypto({ algorithm, mode, text, key }) {
  const handler = algorithms[algorithm];
  if (!handler) throw new Error("Thuật toán không được backend hỗ trợ.");
  if (typeof text !== "string" || !text.trim()) throw new Error("Cần có văn bản và khóa.");
  if (key === undefined || key === null || String(key) === "") throw new Error("Cần có văn bản và khóa.");
  return { success: true, algorithm, mode, ...handler(text, key, mode) };
}

module.exports = { algorithms, processCrypto };
