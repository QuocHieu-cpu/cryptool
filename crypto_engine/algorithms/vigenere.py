def vigenere_cipher(text: str, key: str, mode: str = "encrypt") -> dict:
    """Vigenere cipher for ASCII A-Z; preserves case and other characters."""
    if mode not in {"encrypt", "decrypt"}:
        return {"success": False, "error": "mode phải là encrypt hoặc decrypt."}
    if not key or not key.isascii() or not key.isalpha():
        return {"success": False, "error": "Khóa Vigenere chỉ được gồm chữ cái A-Z."}

    key_upper = key.upper()
    output = []
    steps = []
    key_index = 0
    for char in text:
        if "A" <= char <= "Z" or "a" <= char <= "z":
            base = ord("A") if char.isupper() else ord("a")
            original = ord(char) - base
            key_char = key_upper[key_index % len(key_upper)]
            shift = ord(key_char) - ord("A")
            signed_shift = shift if mode == "encrypt" else -shift
            encoded = (original + signed_shift) % 26
            result_char = chr(base + encoded)
            output.append(result_char)
            steps.append({
                "index": len(steps),
                "input": char,
                "operation": f"({original} {'+' if signed_shift >= 0 else '-'} {shift}) mod 26 = {encoded}",
                "output": result_char,
            })
            key_index += 1
        else:
            output.append(char)

    return {"success": True, "result": "".join(output), "steps": steps}
