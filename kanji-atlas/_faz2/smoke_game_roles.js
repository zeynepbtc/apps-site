/* FAZ2-FIX A2 · Oyun rol-politikası smoke.
   (1) LEGACY REGRESSION: 91 gerçek kanjide havuz üyeliği A1-öncesi filtreyle BİREBİR (davranış korunur).
   (2) FIXTURE MATRIS: v2 role fixture'larında matris doğru uygulanıyor (phonetic/uncertain/indicative).
   (3) POOL SIZE: oyun başına eski/yeni havuz sayısı (raporlanır).
   (4) FAMILIES: hito ailesinden yanlış üye (onna) çıkarıldı.
   index.html'deki GERÇEK A1+A2 fonksiyonlarını eval eder (kopya değil). */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const DATA = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]);
const kanji = Object.values(DATA.chars).filter(v => v.type === "kanji");
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("FAIL:", name); } };

// Gerçek A1+A2 bloklarını eval et
const blkA1 = src.match(/\/\* ===== FAZ2-FIX A1[\s\S]*?\/\* ===== \/FAZ2-FIX A1 ===== \*\//)[0];
const blkA2 = src.match(/\/\* ===== FAZ2-FIX A2[\s\S]*?\/\* ===== \/FAZ2-FIX A2 ===== \*\//)[0];
const api = {};
new Function("DATA", blkA1 + "\n" + blkA2 + "\nthis.eligibleForGame=eligibleForGame;this.roleAllowedInGame=roleAllowedInGame;this.hasV2Roles=hasV2Roles;").call(api, DATA);

const GAMES = ["comp-meaning", "atolye", "structure", "comp-select"];
// A1-öncesi orijinal filtreler (regression referansı)
function legacyFilter(k, g) {
  const c = k.components || [];
  if (g === "comp-meaning" || g === "atolye") return c.length >= 2 && k.component_meanings && c.every(x => k.component_meanings[x]);
  if (g === "structure") return c.length >= 2;
  if (g === "comp-select") return c.length >= 1;
  return false;
}

// (1) POOL SIZE (eski → yeni) + çıkanlar + legacy-regression (yalnız v2 OLMAYAN kayıtlar birebir korunur)
console.log("Oyun havuzu — eski → yeni (çıkan kanji):");
for (const g of GAMES) {
  let legacyN = 0, newN = 0, left = [], legMismatch = 0;
  for (const k of kanji) {
    const a = legacyFilter(k, g), b = api.eligibleForGame(k, g);
    if (a) legacyN++; if (b) newN++;
    if (a && !b) left.push(k.character);
    if (!api.hasV2Roles(k) && a !== b) legMismatch++;   // v2 olmayanlar A1-öncesiyle birebir
  }
  console.log(`  ${g.padEnd(13)}: ${legacyN} → ${newN}  (çıkan: ${left.join("") || "-"})`);
  ok(`legacy (v2 olmayan) regression korundu: ${g}`, legMismatch === 0);
}

// (1b) V2 BEKLENTİSİ — 8 形声 comp-meaning/atolye'den çıkar, structure/comp-select'te kalır; 大/王 tüm havuzlardan çıkar
const byId = Object.fromEntries(kanji.map(k => [k.id, k]));
for (const id of ["toki", "gengo", "gakkou", "hareru", "hanasu", "yomu", "kiku", "nani"]) {
  const k = byId[id];
  ok(`${id} 形声 → comp-meaning ✗`, api.eligibleForGame(k, "comp-meaning") === false);
  ok(`${id} 形声 → atolye ✗`, api.eligibleForGame(k, "atolye") === false);
  ok(`${id} 形声 → structure ✓`, api.eligibleForGame(k, "structure") === true);
  ok(`${id} 形声 → comp-select ✓`, api.eligibleForGame(k, "comp-select") === true);
}
for (const id of ["dai", "ou"]) {
  const k = byId[id];
  ok(`${id} 象形 → tüm bileşen oyunlarından çıktı`, GAMES.every(g => api.eligibleForGame(k, g) === false));
}
// C/P1: 国 (囗+玉, ikisi de semantic) tüm havuzlarda; 玉 (象形, structure=[]) hiçbir havuzda
if (byId.kuni) GAMES.forEach(g => ok(`kuni 会意 → ${g} ✓`, api.eligibleForGame(byId.kuni, g) === true));
if (byId.tama) ok("tama 象形 → tüm bileşen oyunlarından çıktı", GAMES.every(g => api.eligibleForGame(byId.tama, g) === false));

// (2) FIXTURE MATRIS — v2 role kayıtları
const mk = (roles) => ({
  components: roles.map((_, i) => "c" + i),
  component_meanings: Object.fromEntries(roles.map((_, i) => ["c" + i, "m"])),
  structure: { components: roles.map((r, i) => ({ glyph: "c" + i, role: r })) }
});
const kSem = mk(["semantic", "semantic"]);
const kPhon = mk(["semantic", "phonetic"]);
const kUnc = mk(["semantic", "uncertain"]);
const kInd = mk(["semantic", "indicative"]);

ok("semantic → comp-meaning ✓", api.eligibleForGame(kSem, "comp-meaning") === true);
ok("semantic → atolye ✓", api.eligibleForGame(kSem, "atolye") === true);
ok("semantic → structure ✓", api.eligibleForGame(kSem, "structure") === true);
ok("semantic → comp-select ✓", api.eligibleForGame(kSem, "comp-select") === true);

ok("phonetic → comp-meaning ✗", api.eligibleForGame(kPhon, "comp-meaning") === false);
ok("phonetic → atolye ✗", api.eligibleForGame(kPhon, "atolye") === false);
ok("phonetic → structure ✓", api.eligibleForGame(kPhon, "structure") === true);
ok("phonetic → comp-select ✓", api.eligibleForGame(kPhon, "comp-select") === true);

ok("uncertain → comp-meaning ✗", api.eligibleForGame(kUnc, "comp-meaning") === false);
ok("uncertain → structure ✗ (fail-closed)", api.eligibleForGame(kUnc, "structure") === false);
ok("uncertain → comp-select ✗ (fail-closed)", api.eligibleForGame(kUnc, "comp-select") === false);

ok("indicative → comp-meaning ✗ (anlam iddiası)", api.eligibleForGame(kInd, "comp-meaning") === false);
ok("indicative → atolye ✗", api.eligibleForGame(kInd, "atolye") === false);
ok("indicative → structure ✓", api.eligibleForGame(kInd, "structure") === true);
ok("indicative → comp-select ✓", api.eligibleForGame(kInd, "comp-select") === true);

// geçersiz role adı → fail-closed
ok("geçersiz role → fail-closed", api.roleAllowedInGame("banana", "structure") === false);

// (4) FAMILIES — hito ailesinden onna çıkarıldı
const famSrc = src.match(/const FAMILIES=(\[[\s\S]*?\n\]);/)[1];
const FAMILIES = new Function("return " + famSrc)();
const hito = FAMILIES.find(f => f.root === "hito");
ok("FAMILIES hito var", !!hito);
ok("FAMILIES hito onna İÇERMİYOR", hito && !hito.members.includes("onna"));
ok("FAMILIES hito yasumu koruyor (亻 gerçek)", hito && hito.members.includes("yasumu"));

console.log(`\nsmoke_game_roles: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
