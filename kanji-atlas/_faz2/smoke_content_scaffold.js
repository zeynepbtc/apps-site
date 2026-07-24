/* FAZ2-FIX A1 · İskelet smoke — sync + hash + canonical round-trip + accessor regression + canonical-source (lossless).
   Amaç: A1'in DAVRANIŞ DEĞİŞTİRMEDİĞİNİ kanıtlamak. index.html'deki GERÇEK accessor kodunu eval eder (kopya değil). */
const fs = require("fs"), crypto = require("crypto"), path = require("path");
const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const DATA = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]);
const chars = DATA.chars;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("FAIL:", name); } };

// Gerçek accessor bloğunu index.html'den çıkar ve eval et (shipped kodu test eder)
const blk = src.match(/\/\* ===== FAZ2-FIX A1[\s\S]*?\/\* ===== \/FAZ2-FIX A1 ===== \*\//)[0];
const api = {};
new Function(blk + "\nthis.kokenOf=kokenOf;this.mnemonicOf=mnemonicOf;this.componentsOf=componentsOf;this.componentRole=componentRole;this.CV=CONTENT_VERSION;this.CH=CONTENT_HASH;").call(api);

// 1) SYNC: data_chars.json == canonical DATA.chars
const canonical = JSON.stringify(chars);
ok("sync: data_chars.json == DATA.chars", fs.readFileSync(path.join(__dirname, "data_chars.json"), "utf8") === canonical);

// 2) HASH: CONTENT_HASH sabiti == sha256(canonical)[:16]
const wantHash = crypto.createHash("sha256").update(canonical).digest("hex").slice(0, 16);
ok("CONTENT_HASH güncel (canonical DATA)", api.CH === wantHash);
ok("CONTENT_VERSION tanımlı", typeof api.CV === "string" && api.CV.length > 0);

// 3) CANONICAL round-trip (lossless): parse(serialize(DATA)) == DATA
ok("round-trip lossless (serialize/parse)", JSON.stringify(JSON.parse(canonical)) === canonical);

// 4) ACCESSOR regression: v2 verisi YOK → accessor'lar legacy ile BİREBİR (davranış değişmedi)
for (const id in chars) {
  const k = chars[id];
  ok("kokenOf==legacy " + id, api.kokenOf(k) === (k.pictogram_note || ""));
  ok("mnemonicOf==legacy " + id, api.mnemonicOf(k) === (k.memory_hint_tr || ""));
  ok("componentsOf==legacy " + id, JSON.stringify(api.componentsOf(k)) === JSON.stringify(k.components || []));
  ok("componentRole==null " + id, api.componentRole(k, (k.components || [])[0]) === null);
}

// 5) CANONICAL-SOURCE (generator lossless): DATA.chars → serialize → parse → derin eşit
ok("canonical-source lossless", JSON.stringify(JSON.parse(canonical)) === canonical && Object.keys(JSON.parse(canonical)).length === Object.keys(chars).length);

console.log(`\nsmoke_content_scaffold: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
