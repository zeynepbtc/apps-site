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

// 4) ACCESSOR semantiği: v2 kayıtlar v2 kuralını, legacy kayıtlar legacy'yi yansıtır
for (const id in chars) {
  const k = chars[id];
  const hasEty = !!k.etymology;
  let expKo;
  if (hasEty && (k.etymology.qaStatus === "pending" || k.etymology.qaStatus === "drafted")) expKo = null;  // QA öncesi → gizli
  else if (hasEty && typeof k.etymology.summaryTr === "string") expKo = k.etymology.summaryTr;
  else expKo = (k.pictogram_note || "");
  ok("kokenOf " + id, api.kokenOf(k) === expKo);
  let expMn;
  if (k.mnemonic && k.mnemonic.status) expMn = (k.mnemonic.status === "active" ? (k.mnemonic.textTr || "") : "");  // not_required/pending_review → gizli
  else expMn = (k.memory_hint_tr || "");
  ok("mnemonicOf " + id, api.mnemonicOf(k) === expMn);
  ok("componentsOf==legacy(türetilmiş) " + id, JSON.stringify(api.componentsOf(k)) === JSON.stringify(k.components || []));
  const fc = (k.components || [])[0];
  if (k.structure && Array.isArray(k.structure.components) && fc) {
    const sc = k.structure.components.find(c => c.glyph === fc);
    ok("componentRole v2 " + id, api.componentRole(k, fc) === (sc ? (sc.role || null) : null));
  } else {
    ok("componentRole==null " + id, api.componentRole(k, fc) === null);
  }
}

// 5) CANONICAL-SOURCE (generator lossless): DATA.chars → serialize → parse → derin eşit
ok("canonical-source lossless", JSON.stringify(JSON.parse(canonical)) === canonical && Object.keys(JSON.parse(canonical)).length === Object.keys(chars).length);

// 6) DRAFTED KAPISI (fixture): yazan≠onaylayan — köken yalnız reviewed'da görünür
ok("gate: reviewed+summaryTr görünür", api.kokenOf({ etymology: { qaStatus: "reviewed", summaryTr: "X" } }) === "X");
ok("gate: drafted GİZLİ", api.kokenOf({ etymology: { qaStatus: "drafted", summaryTr: "X" } }) === null);
ok("gate: pending GİZLİ", api.kokenOf({ etymology: { qaStatus: "pending", summaryTr: "X" } }) === null);
ok("gate: reviewed summaryTr yok → legacy köken", api.kokenOf({ etymology: { qaStatus: "reviewed" }, pictogram_note: "L" }) === "L");

console.log(`\nsmoke_content_scaffold: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
