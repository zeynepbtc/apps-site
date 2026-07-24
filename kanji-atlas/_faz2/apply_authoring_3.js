/* AUTHORING Parti 3 · 目 耳 手 足 — boş/basit 象形 köken (DRAFTED). Yeni etymology objesi eklenir (yoktu).
   Not: 目/手 zaten legacy köken'e sahipti → drafted sırasında geçici gizli, reviewed'da yeni metin açılır. 耳/足 boştu. */
const fs = require("fs"), path = require("path");
const INDEX = path.join(__dirname, "..", "index.html");
let src = fs.readFileSync(INDEX, "utf8");
const DATA = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]);
const byChar = {}; for (const id in DATA.chars) byChar[DATA.chars[id].character] = id;

const DRAFT = {
  "目": { sum: "Bir gözün resmidir. Başta yatay çizilen bu şekil sonradan dikey hâle getirilmiştir.", src: ["https://www.kanjipedia.jp/kanji/0006740200"] },
  "耳": { sum: "Bir kulağın resmidir.", src: ["https://www.kanjipedia.jp/kanji/0002848100"] },
  "手": { sum: "Açılmış bir elin (avuç içi) resmidir.", src: ["https://www.kanjipedia.jp/kanji/0003028800"] },
  "足": { sum: "Dizden ayak bileğine kadar uzanan bacak kısmının resmidir.", src: ["https://www.kanjipedia.jp/kanji/0004335700"] },
};

const report = [];
for (const ch of Object.keys(DRAFT)) {
  const id = byChar[ch]; const rec = DATA.chars[id];
  const oldSub = JSON.stringify(rec);
  if (!src.includes(oldSub)) throw new Error("bulunamadı: " + ch);
  const d = DRAFT[ch];
  const hadLegacy = !!(rec.pictogram_note && rec.pictogram_note.trim());
  const ety = { formationType: "象形", formationTypeSource: "Kanjipedia", confidence: "A", summaryTr: d.sum, sources: d.src, disagreementNote: null, qaStatus: "drafted" };
  src = src.replace(oldSub, JSON.stringify(Object.assign({}, rec, { etymology: ety })));
  report.push({ ch, id, sum: d.sum, hadLegacy, legacy: rec.pictogram_note || "" });
}
fs.writeFileSync(INDEX, src);
console.log("Parti 3 drafted (4 · 目耳手足). qaStatus=drafted → köken GİZLİ.\n");
for (const r of report) console.log(`${r.ch} (${r.id}) · ${r.hadLegacy ? "legacy köken vardı: \"" + r.legacy + "\" (drafted'da geçici gizli)" : "boştu"}\n   yeni: ${r.sum}\n`);
