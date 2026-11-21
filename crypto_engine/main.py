"""Small HTTP adapter for the CryptoTool Python algorithms (standard library only)."""
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

from algorithms.caesar import caesar_cipher
from algorithms.playfair import playfair_cipher
from algorithms.vigenere import vigenere_cipher


MAX_BODY_BYTES = 64 * 1024
HANDLERS = {
    "caesar": caesar_cipher,
    "vigenere": vigenere_cipher,
    "playfair": playfair_cipher,
}


class CryptoHandler(BaseHTTPRequestHandler):
    def _json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if urlparse(self.path).path == "/healthz":
            return self._json(200, {"ok": True, "service": "crypto-engine"})
        return self._json(404, {"success": False, "error": "Không tìm thấy endpoint."})

    def do_POST(self):
        algorithm = urlparse(self.path).path.strip("/")
        handler = HANDLERS.get(algorithm)
        if handler is None:
            return self._json(404, {"success": False, "error": "Thuật toán không được engine hỗ trợ."})

        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return self._json(400, {"success": False, "error": "Content-Length không hợp lệ."})
        if size <= 0 or size > MAX_BODY_BYTES:
            return self._json(413 if size > MAX_BODY_BYTES else 400, {"success": False, "error": "Dữ liệu gửi lên trống hoặc quá lớn."})

        try:
            payload = json.loads(self.rfile.read(size).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return self._json(400, {"success": False, "error": "JSON không hợp lệ."})
        if not isinstance(payload, dict):
            return self._json(400, {"success": False, "error": "Nội dung phải là một JSON object."})

        mode = payload.get("mode")
        text = payload.get("text")
        key = payload.get("key")
        if mode not in {"encrypt", "decrypt"}:
            return self._json(400, {"success": False, "error": "mode phải là encrypt hoặc decrypt."})
        if not isinstance(text, str) or not text.strip() or key is None or str(key) == "":
            return self._json(400, {"success": False, "error": "Cần có văn bản và khóa."})

        try:
            if algorithm == "caesar":
                result = handler(text, int(key), mode)
            else:
                result = handler(text, str(key), mode)
        except (TypeError, ValueError) as error:
            return self._json(400, {"success": False, "error": str(error) or "Dữ liệu đầu vào không hợp lệ."})

        if not result.get("success", False):
            return self._json(422, result)
        return self._json(200, result)

    def log_message(self, format_string, *args):
        print(f"{self.client_address[0]} - {format_string % args}")


def main():
    host = os.environ.get("ENGINE_HOST", "127.0.0.1")
    port = int(os.environ.get("ENGINE_PORT", "8000"))
    server = ThreadingHTTPServer((host, port), CryptoHandler)
    print(f"Crypto engine chạy tại http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nĐang dừng crypto engine...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
