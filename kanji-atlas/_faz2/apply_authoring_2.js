/* AUTHORING Parti 2 · 王 玉 季 東 — DRAFTED köken (kalan pending; qaStatus:drafted → GİZLİ). formationType zaten set. */
const fs = require("fs"), path = require("path");
const INDEX = path.join(__dirname, "..", "index.html");
let src = fs.readFileSync(INDEX, "utf8");
const DATA = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]);

const DRAFT = {
  ou: {
    sum: "Dik duran büyük bir baltanın resmidir. Balta güç ve otorite simgesi olduğu için \"kral, hükümdar\" anlamına gelmiştir.",
    src: ["https://www.kanjipedia.jp/kanji/0000504100"],
    dis: "Klasik/Konfüçyüsçü halk yorumu üç yatay çizgiyi (gök-insan-yer) birleştiren dikey çizgiyi 'kral' sayar; bu arkeolojik köken değildir, kullanıcı metnine konmadı.",
  },
  tama: {
    sum: "Bir ipe dizilmiş birkaç yeşim taşının resmidir. Yazıda 王 (kral) ile karışmaması için sonradan bir nokta eklenmiştir.",
    src: ["https://www.kanjipedia.jp/kanji/0001584900"], dis: null,
  },
  ki2: {
    sum: "\"Çocuk\" anlamındaki 子 ile \"genç/körpe\" demek olan 稚'nin kısaltılmış biçimi 禾'den oluşur. İlk anlamı \"en küçük çocuk\"tu; buradan \"genç\", sonra \"mevsim\" anlamına genişledi.",
    src: ["https://www.kanjipedia.jp/kanji/0001206800"], dis: null,
  },
  higashi: {
    sum: "İki ucundan bağlanmış bir torbanın resmidir. Bu şekil, sesi uygun düştüğü için sonradan \"doğu\" yönü anlamında ödünç alınmıştır; \"doğu\" anlamının torbayla bir bağı yoktur.",
    src: ["https://www.kanjipedia.jp/kanji/0005164200"],
    dis: "Klasik/halk etimolojisi (Shuowen) 木+日 = 'ağacın ardından doğan güneş' der; Kanjipedia ve modern görüş torba + ses ödünçlemesi verir. Folk okuma kullanıcı metnine konmadı.",
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
console.log("Parti 2 drafted (4). qaStatus=drafted → köken GİZLİ.\n");
for (const r of report) { console.log(`${r.char} (${r.id}) · ${r.ft} · ${r.conf}`); console.log(`   ${r.sum}`); console.log(`   disagreement: ${r.dis || "yok"}\n`); }
