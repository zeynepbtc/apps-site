/* CSS ölü-sınıf tarayıcı v3 — KESİN yöntem.
   USED  = sınıf adı kodda TAM SÖZCÜK olarak herhangi bir yerde geçiyor (ternary literal, classList,
           attribute, template — hepsi metin olarak görünür). Bu, v1'in doğru tarafı.
   KAÇAK = yalnız `prefix${...}` ile üretilen sınıflar (tam ad metinde YOK). Bunları class-attribute
           bağlamından çıkarılan dinamik prefix'lerle yakalayıp TUT (t1-t4 dersi).
   Aday  = tanımlı ∧ USED değil ∧ dinamik-prefix eşleşmiyor. Şüphede TUT. */
const fs = require("fs");
const src = fs.readFileSync("/home/claude/apps-deploy/kanji-atlas/index.html", "utf-8");
const s0 = src.indexOf("<style>"), s1 = src.indexOf("</style>");
const css = src.slice(s0, s1);
const code = src.slice(0, s0) + src.slice(s1);

const defs = new Set(); let m;
const dr = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;
while ((m = dr.exec(css))) defs.add(m[1]);

// dinamik prefix'ler — YALNIZ class/className/cls attribute değerlerinden
const dynPrefixes = new Set();
const attrRe = /(?:class|className|cls)\s*=\s*[`"']([^`"']*)[`"']/g;
while ((m = attrRe.exec(code))) {
  for (const tok of m[1].split(/\s+/)) {
    const i = tok.indexOf("${");
    if (i > 0) dynPrefixes.add(tok.slice(0, i));       // "t${t}" -> "t"
  }
}

const kept = [], candidates = [];
for (const c of [...defs].sort()) {
  const wb = new RegExp("(?<![A-Za-z0-9_-])" + c.replace(/-/g, "\\-") + "(?![A-Za-z0-9_-])");
  if (wb.test(code)) continue;                          // USED (tam sözcük metinde var)
  let dyn = false;
  for (const pre of dynPrefixes) if (pre && c.startsWith(pre) && c.length > pre.length) { dyn = true; break; }
  if (dyn) { kept.push(c); continue; }                  // dinamik-prefix kaçağı → TUT
  candidates.push(c);
}

console.log("Tanımlı:", defs.size, "| dinamik-prefix:", [...dynPrefixes].sort().join(",") || "(yok)");
console.log("\n### Dinamik-prefix ile TUTULAN:", kept.length, "→", kept.map(x => "." + x).join("  "));
console.log("\n### CSS ölü-sınıf adayları (KESİN liste):", candidates.length);
candidates.forEach(x => console.log("  ." + x));
fs.writeFileSync("/tmp/css_candidates.json", JSON.stringify(candidates));
