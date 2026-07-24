/* FAZ2-FIX B · Canonical→legacy türetme tutarlılığı (R3):
   structure.components CANONICAL; legacy components/component_meanings ONDAN türetilmiş — elle sapma OLMAMALI.
   Ayrıca: phonetic/indicative parçalar legacy component_meanings'te MEANING taşımamalı (oyuna yanlış anlam sızmasın). */
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const chars = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]).chars;
let pass = 0, fail = 0;
const ok = (n, c) => { if (c) pass++; else { fail++; console.log("FAIL:", n); } };

let v2count = 0;
for (const id in chars) {
  const k = chars[id];
  if (!k.structure || !Array.isArray(k.structure.components)) continue;   // yalnız v2 kayıtlar
  v2count++;
  const derivedComps = k.structure.components.map(c => c.glyph);
  const derivedCM = {};
  for (const c of k.structure.components) if (c.labelTr != null) derivedCM[c.glyph] = c.labelTr;
  ok("components == türetilmiş: " + id, JSON.stringify(k.components || []) === JSON.stringify(derivedComps));
  ok("component_meanings == türetilmiş: " + id, JSON.stringify(k.component_meanings || {}) === JSON.stringify(derivedCM));
  for (const c of k.structure.components) {
    if (c.role === "phonetic" || c.role === "indicative")
      ok(`${id}: ${c.glyph} (${c.role}) legacy meaning taşımıyor`, !(k.component_meanings && k.component_meanings[c.glyph]));
  }
}
// READINGS türetmesi: onyomi/kunyomi == taughtOn/taughtKun ("・" ile), deferred official∖taught
let rcount = 0;
for (const id in chars) {
  const k = chars[id];
  if (!k.readings) continue;
  rcount++;
  if (k.readings.taughtOn) ok("onyomi == taughtOn: " + id, k.onyomi === k.readings.taughtOn.join("・"));
  if (k.readings.taughtKun) ok("kunyomi == taughtKun: " + id, k.kunyomi === k.readings.taughtKun.join("・"));
  // deferred okuma taught'ta OLMAMALI (official ama öğretilmiyor)
  for (const d of (k.readings.deferred || []))
    ok(`${id}: deferred ${d.reading} taught'ta değil`, !(k.readings.taughtOn || []).includes(d.reading) && !(k.readings.taughtKun || []).includes(d.reading));
  // jukujikun düzensiz okuma taught'a SIZMAMALI (kanji okuması kazandırmaz)
  for (const w of (k.readings.irregularWords || [])) {
    ok(`${id}: irregular ${w.word} taughtOn'a sızmadı`, !(k.readings.taughtOn || []).includes(w.reading));
    ok(`${id}: irregular ${w.word} taughtKun'a sızmadı`, !(k.readings.taughtKun || []).includes(w.reading));
  }
}
console.log(`v2 struct kayıt: ${v2count} · v2 readings kayıt: ${rcount}`);
console.log(`smoke_legacy_derived: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
