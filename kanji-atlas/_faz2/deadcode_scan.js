/* FAZ 2 · Ölü kod TARAYICI (yalnız ADAY üretir — silmez, karar vermez).
   İlke: "çalışanı silme". Bu araç yalnız hiçbir yerde referansı olmayan adayları listeler;
   her aday elle doğrulanır (dinamik/string referans olabilir). Muhafazakâr: şüphede TUT. */
const fs = require("fs");
const F = "/home/claude/apps-deploy/kanji-atlas/index.html";
const src = fs.readFileSync(F, "utf-8");

// --- CSS bloğu vs kod bloğu ayır ---
const styleStart = src.indexOf("<style>"), styleEnd = src.indexOf("</style>");
const cssBlock = src.slice(styleStart, styleEnd);
const codeBlock = src.slice(0, styleStart) + src.slice(styleEnd); // CSS dışındaki her şey (HTML+JS)

// ============ 1) CSS SINIFLARI ============
// .class-name tanımlarını topla (pseudo, birleşik seçicilerden ayıkla)
const classDefs = new Set();
const re = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;
let m;
while ((m = re.exec(cssBlock))) classDefs.add(m[1]);

// Her sınıf: CSS DIŞINDA herhangi bir yerde (word-boundary) geçiyor mu?
const cssUnused = [];
for (const cls of [...classDefs].sort()) {
  // word-boundary: sınıf adı tam sözcük olarak kod içinde (class="...", cls=, template, classList)
  const wb = new RegExp("(?<![A-Za-z0-9_-])" + cls.replace(/[-]/g, "\\-") + "(?![A-Za-z0-9_-])");
  if (!wb.test(codeBlock)) {
    // ayrıca prefix olarak string-concat ihtimali (örn "kgrid-"+x) — parça eşleşmesi varsa TUT
    const prefixHit = new RegExp('["\'`][^"\'`]*' + cls.split("-")[0] + '-').test(codeBlock);
    cssUnused.push({ cls, prefixSuspect: prefixHit });
  }
}

// ============ 2) JS FONKSİYONLARI ============
// function NAME( tanımları
const fnDefs = [];
const fnRe = /function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
while ((m = fnRe.exec(src))) fnDefs.push({ name: m[1], idx: m.index });

const fnUnused = [];
for (const { name } of fnDefs) {
  const wb = new RegExp("(?<![A-Za-z0-9_$])" + name.replace(/\$/g, "\\$") + "(?![A-Za-z0-9_$])", "g");
  const hits = (src.match(wb) || []).length; // tanım dahil
  if (hits <= 1) fnUnused.push({ name, hits });
}

// ============ 3) TOP-LEVEL const AD (veri/sabit) ============
// satır başı "const NAME =" (girinti yok = üst seviye) — fonksiyon-içi const'ları dışla
const constDefs = [];
const cRe = /^const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/gm;
while ((m = cRe.exec(src))) constDefs.push(m[1]);
const constUnused = [];
for (const name of constDefs) {
  const wb = new RegExp("(?<![A-Za-z0-9_$])" + name.replace(/\$/g, "\\$") + "(?![A-Za-z0-9_$])", "g");
  const hits = (src.match(wb) || []).length;
  if (hits <= 1) constUnused.push({ name, hits });
}

// ============ RAPOR ============
console.log("### CSS — referanssız sınıf adayları (" + cssUnused.length + " / " + classDefs.size + " tanım)");
cssUnused.forEach(x => console.log("  ." + x.cls + (x.prefixSuspect ? "   ⚠ prefix-string şüphesi (TUT)" : "")));
console.log("\n### JS — çağrılmayan fonksiyon adayları (" + fnUnused.length + " / " + fnDefs.length + " tanım)");
fnUnused.forEach(x => console.log("  " + x.name + "()  [" + x.hits + " geçiş]"));
console.log("\n### const — referanssız üst-seviye sabit adayları (" + constUnused.length + " / " + constDefs.length + " tanım)");
constUnused.forEach(x => console.log("  " + x.name + "  [" + x.hits + " geçiş]"));

console.log("\n— NOT: Bunlar ADAY. Her biri elle doğrulanacak (dinamik/string/HTML-attr referans olabilir). Şüphede TUT.");
