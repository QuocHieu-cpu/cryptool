ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXYZ"


def generate_playfair_matrix(key: str) -> list:
    key_letters = key.upper().replace("J", "I")
    matrix_chars = []
    for char in key_letters + ALPHABET:
        if char in ALPHABET and char not in matrix_chars:
            matrix_chars.append(char)
    return [matrix_chars[index:index + 5] for index in range(0, 25, 5)]


def _position(matrix: list, char: str):
    for row in range(5):
        for col in range(5):
            if matrix[row][col] == char:
                return row, col
    raise ValueError(f"Ký tự {char!r} không nằm trong bảng Playfair.")


def _clean_text(text: str) -> str:
    return "".join(char for char in text.upper().replace("J", "I") if char in ALPHABET)


def _prepare_pairs(text: str) -> list:
    pairs = []
    index = 0
    while index < len(text):
        first = text[index]
        if index + 1 >= len(text):
            pairs.append((first, "Q" if first == "X" else "X"))
            index += 1
        elif text[index + 1] == first:
            pairs.append((first, "Q" if first == "X" else "X"))
            index += 1
        else:
            pairs.append((first, text[index + 1]))
            index += 2
    return pairs


def playfair_cipher(text: str, key: str, mode: str = "encrypt") -> dict:
    if mode not in {"encrypt", "decrypt"}:
        return {"success": False, "error": "mode phải là encrypt hoặc decrypt."}
    if not key or not key.isascii() or not key.isalpha():
        return {"success": False, "error": "Khóa Playfair chỉ được gồm chữ cái A-Z."}

    matrix = generate_playfair_matrix(key)
    clean_text = _clean_text(text)
    if not clean_text:
        return {"success": False, "error": "Văn bản Playfair cần có ít nhất một chữ cái A-Z."}
    if mode == "decrypt":
        if len(clean_text) % 2:
            return {"success": False, "error": "Bản mã Playfair phải có số chữ cái chẵn."}
        pairs = [(clean_text[i], clean_text[i + 1]) for i in range(0, len(clean_text), 2)]
    else:
        pairs = _prepare_pairs(clean_text)

    output = []
    steps = []
    direction = 1 if mode == "encrypt" else -1
    for first, second in pairs:
        row1, col1 = _position(matrix, first)
        row2, col2 = _position(matrix, second)
        if row1 == row2:
            out1 = matrix[row1][(col1 + direction) % 5]
            out2 = matrix[row2][(col2 + direction) % 5]
            rule = "Cùng hàng: dịch phải" if direction == 1 else "Cùng hàng: dịch trái"
        elif col1 == col2:
            out1 = matrix[(row1 + direction) % 5][col1]
            out2 = matrix[(row2 + direction) % 5][col2]
            rule = "Cùng cột: dịch xuống" if direction == 1 else "Cùng cột: dịch lên"
        else:
            out1 = matrix[row1][col2]
            out2 = matrix[row2][col1]
            rule = "Hình chữ nhật: đổi cột"

        output_pair = out1 + out2
        output.append(output_pair)
        steps.append({
            "index": len(steps),
            "input": first + second,
            "operation": rule,
            "output": output_pair,
        })

    result = "".join(output)
    note = (
        "Playfair bỏ dấu câu/khoảng trắng, gộp J thành I. Khi mã hóa có thể thêm X/Q làm ký tự đệm; "
        "bản giải mã có thể còn ký tự đệm cần đối chiếu thủ công."
    )
    return {"success": True, "result": result, "steps": steps, "matrix": matrix, "note": note}
