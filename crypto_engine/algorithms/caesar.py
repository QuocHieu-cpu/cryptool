def caesar_cipher(text: str, shift: int, mode: str = "encrypt") -> dict:
    """Caesar cipher for ASCII A-Z; other characters pass through unchanged."""
    if mode not in {"encrypt", "decrypt"}:
        return {"success": False, "error": "mode phải là encrypt hoặc decrypt."}
    try:
        shift = int(shift) % 26
    except (TypeError, ValueError):
        return {"success": False, "error": "Khóa Caesar phải là số nguyên."}
    if mode == "decrypt":
        shift = -shift

    output = []
    steps = []
    for char in text:
        if "A" <= char <= "Z" or "a" <= char <= "z":
            base = ord("A") if char.isupper() else ord("a")
            original = ord(char) - base
            encoded = (original + shift) % 26
            result_char = chr(base + encoded)
            operation = f"({original} + {shift}) mod 26 = {encoded}"
        else:
            result_char = char
            operation = "Giữ nguyên ký tự ngoài A-Z"
        output.append(result_char)
        steps.append({
            "index": len(steps),
            "input": char,
            "operation": operation,
            "output": result_char,
        })

    return {"success": True, "result": "".join(output), "steps": steps}
