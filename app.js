"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const cryptoEngine = require("./crypto_engine");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");
const ENGINE_ALGORITHMS = [
  { id: "caesar", name: "Caesar", keyType: "number" },
  { id: "vigenere", name: "Vigenère", keyType: "text" },
  { id: "playfair", name: "Playfair", keyType: "text" },
];
const allowedOrigins = new Set([
  ...(process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("Origin không được phép."));
  },
}));
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", engine: "crypto_engine (Node.js)" }));
app.get("/api/algorithms", (_req, res) => res.json(ENGINE_ALGORITHMS));

function processCrypto(req, res) {
  const { algorithm, mode, text, key } = req.body || {};
  if (!ENGINE_ALGORITHMS.some((item) => item.id === algorithm)) {
    return res.status(400).json({ success: false, error: "Thuật toán không được backend hỗ trợ." });
  }
  if (!["encrypt", "decrypt"].includes(mode)) {
    return res.status(400).json({ success: false, error: "mode phải là encrypt hoặc decrypt." });
  }
  if (typeof text !== "string" || !text.trim() || key === undefined || key === null || String(key) === "") {
    return res.status(400).json({ success: false, error: "Cần có văn bản và khóa." });
  }

  try {
    return res.json(cryptoEngine.processCrypto({ algorithm, mode, text, key }));
  } catch (error) {
    return res.status(422).json({ success: false, error: error.message || "Dữ liệu đầu vào không hợp lệ." });
  }
}

app.post(["/api/crypto", "/api/crypto/process"], processCrypto);

if (fs.existsSync(path.join(FRONTEND_DIST, "index.html"))) {
  app.use(express.static(FRONTEND_DIST, { index: false }));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(FRONTEND_DIST, "index.html")));
} else {
  app.get("/", (_req, res) => res.status(503).send(
    "Frontend chưa được build. Chạy npm run build trong thư mục frontend trước khi dùng cổng này làm trang web.",
  ));
}

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Không tìm thấy đường dẫn." });
});

app.use((error, _req, res, _next) => {
  console.error(error.message);
  res.status(500).json({ success: false, error: "Lỗi máy chủ." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CryptoTool API chạy tại http://localhost:${PORT}`);
  console.log("Crypto engine: tích hợp sẵn trong Node.js");
});
