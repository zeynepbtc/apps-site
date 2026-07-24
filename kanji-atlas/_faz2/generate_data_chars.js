/* FAZ2-FIX A1 · CANONICAL GENERATOR — index.html DATA.chars → _faz2/data_chars.json (+ content_manifest.json)
   Kural: data_chars.json CANONICAL DEĞİL, index.html DATA.chars'tan TÜRETİLİR. ELLE DÜZENLENMEZ.
   Deterministik/idempotent: aynı DATA → aynı çıktı (iki çalıştırma = diff yok).
   Ayrıca CONTENT_HASH sabitini de günceller (index.html'e enjekte eder) — sürüm artırmayı unutma riskini kapatır.
   Kullanım: node _faz2/generate_data_chars.js   (--check ile sadece doğrular, yazmaz) */
const fs = require("fs"), crypto = require("crypto"), path = require("path");
const ROOT = path.join(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");
const CHECK = process.argv.includes("--check");

const src = fs.readFileSync(INDEX, "utf8");
const m = src.match(/const DATA = (\{.*?\});/s);
if (!m) { console.error("HATA: DATA bulunamadı"); process.exit(2); }
const DATA = JSON.parse(m[1]);

const canonical = JSON.stringify(DATA.chars);                       // deterministik: DATA'daki anahtar sırası
const hash = crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 16);
const cv = (src.match(/const CONTENT_VERSION = "([^"]+)"/) || [])[1] || null;
const manifest = JSON.stringify({
  contentVersion: cv, contentHash: hash,
  charCount: Object.keys(DATA.chars).length,
  generatedFrom: "index.html DATA.chars", note: "TÜRETİLMİŞ — elle düzenleme"
}, null, 2);

if (CHECK) {
  const cur = fs.existsSync(path.join(__dirname, "data_chars.json")) ? fs.readFileSync(path.join(__dirname, "data_chars.json"), "utf8") : "";
  const constHash = (src.match(/const CONTENT_HASH = "([^"]+)"/) || [])[1];
  const okSync = cur === canonical, okHash = constHash === hash;
  console.log("data_chars.json senkron:", okSync, "| CONTENT_HASH güncel:", okHash, "| hash:", hash);
  process.exit(okSync && okHash ? 0 : 1);
}

fs.writeFileSync(path.join(__dirname, "data_chars.json"), canonical);
fs.writeFileSync(path.join(__dirname, "content_manifest.json"), manifest);
// CONTENT_HASH sabitini index.html'de güncelle (yalnız sabit satırı; DATA'ya DOKUNMAZ)
const src2 = src.replace(/const CONTENT_HASH = "[^"]*";/, `const CONTENT_HASH = "${hash}";`);
if (src2 !== src) { fs.writeFileSync(INDEX, src2); console.log("CONTENT_HASH güncellendi ->", hash); }
console.log("Üretildi: data_chars.json (" + Object.keys(DATA.chars).length + " kayıt) + content_manifest.json. hash:", hash);
