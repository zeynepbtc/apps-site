/* AUTHORING Parti 1B · 語 校 読 何 — DRAFTED köken (qaStatus:drafted → GİZLİ; reviewed 2. tur onayında). */
const fs = require("fs"), path = require("path");
const INDEX = path.join(__dirname, "..", "index.html");
let src = fs.readFileSync(INDEX, "utf8");
const DATA = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]);

const DRAFT = {
  gengo: {
    sum: "言 söz ve konuşma anlamı verir. 吾 ise anlamıyla değil, okunuşuyla katkı yapar ve ゴ sesini verir.",
    src: ["https://www.kanjipedia.jp/kanji/0002110200"], dis: null,
  },
  gakkou: {
    sum: "木 ağaç anlamı verir. 交 ise anlamıyla değil, okunuşuyla katkı yapar ve コウ sesini verir.",
    src: ["https://www.kanjipedia.jp/kanji/0002236900"], dis: null,
  },
  yomu: {
    sum: "言 söz/okuma anlamı verir. Sağdaki parça ise anlamıyla değil, okunuşuyla katkı yapar ve ドク sesini verir.",
    src: ["https://www.kanjipedia.jp/kanji/0005324000"],
    dis: "Eski biçim 讀'nin fonetiği 𧶠 (イク→トク); modern 読 bunu 売 (shinjitai) olarak yazar — görünen 売 orijinal fonetik değil, 'satmak' anlamı da taşımaz.",
  },
  nani: {
    sum: "Aslen sırtında yük taşıyan bir insanı gösteriyordu: 亻 insan, 可 ise カ okunuşunu verir. Bugünkü \"ne?\" anlamı sonradan sese göre ödünç alınmıştır; taşıma kökeniyle bağı yoktur.",
    src: ["https://www.kanjipedia.jp/kanji/0000641500"], dis: null,
  },
};

const report = [];
for (const id of Object.keys(DRAFT)) {
  const rec = DATA.chars[id];
  const oldSub = JSON.stringify(rec);
  if (!src.includes(oldSub)) throw new Error("bulunamadı: " + id);
  const d = DRAFT[id];
  const ety = Object.assign({}, rec.etymology, { summaryTr: d.sum, sources: d.src, disagreementNote: d.dis, qaStatus: "drafted" });
  src = src.replace(oldSub, JSON.stringify(Object.assign({}, rec, { etymology: ety })));
  report.push({ char: rec.character, id, ft: ety.formationType, conf: ety.confidence, sum: d.sum, dis: d.dis });
}
fs.writeFileSync(INDEX, src);
console.log("Parti 1B drafted (4). qaStatus=drafted → köken GİZLİ.\n");
for (const r of report) { console.log(`${r.char} (${r.id}) · ${r.ft} · ${r.conf}`); console.log(`   ${r.sum}`); console.log(`   disagreement: ${r.dis || "yok"}\n`); }
