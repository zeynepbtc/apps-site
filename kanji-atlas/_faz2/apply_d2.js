/* FAZ2-FIX D2 · P2 (kısım 2): katman-çökmesi mnemonic.status + jukujikun irregularWords etiketleri.
   YAZILMAZ: yeni mnemonic, yeni köken. DEĞİŞMEZ: taught/official okumalar, onyomi/kunyomi.
   mnemonic.status: köken görünen (kokenOf!=null) → not_required; köken gizli (pending) → pending_review. textTr EKLENMEZ. */
const fs = require("fs"), path = require("path");
const INDEX = path.join(__dirname, "..", "index.html");
let src = fs.readFileSync(INDEX, "utf8");
const DATA = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]);

// gerçek kokenOf'u eval et (köken görünür mü?)
const a1 = src.match(/\/\* ===== FAZ2-FIX A1[\s\S]*?A1 ===== \*\//)[0];
const api = {};
new Function(a1 + "\nthis.kokenOf=kokenOf;").call(api);

// 32 katman-çökmesi (köken≈hatırlatıcı) — karakterle
const COLLAPSE = "山 十 雨 男 目 手 上 下 中 小 東 名 見 聞 話 買 国 車 電 時 林 大 休 日 学 晴 口 夫 天 明 木 本".split(" ");
// 7 jukujikun 付表: karakter -> [word, reading]
const JUKU = {
  "人": ["大人", "おとな"], "明": ["明日", "あす"], "今": ["今日", "きょう"],
  "母": ["お母さん", "かあさん"], "父": ["お父さん", "とうさん"], "手": ["上手", "じょうず"], "下": ["下手", "へた"],
};

const byChar = {};
for (const id in DATA.chars) byChar[DATA.chars[id].character] = id;

const patches = {};   // id -> patch
const get = id => (patches[id] = patches[id] || {});

// (1) mnemonic.status
const dist = { not_required: [], pending_review: [] };
for (const ch of COLLAPSE) {
  const id = byChar[ch]; const k = DATA.chars[id];
  const status = api.kokenOf(k) === null ? "pending_review" : "not_required";
  get(id).mnemonic = { status };   // textTr YOK
  dist[status].push(ch);
}
// (2) irregularWords
const irr = [];
for (const ch in JUKU) {
  const id = byChar[ch]; const k = DATA.chars[id];
  const [word, reading] = JUKU[ch];
  const entry = { word, reading, note: "付表 (jukujikun) — kelimeye özgü düzensiz okuma; kanjinin okuması değil" };
  const R = Object.assign({}, k.readings || {});   // varsa mevcut readings korunur
  R.irregularWords = [...(R.irregularWords || []), entry];
  if (!R.qaStatus) R.qaStatus = "reviewed";
  get(id).readings = R;
  irr.push(`${ch}:${word}(${reading})`);
}

// uygula (kayıt başına tek replace)
for (const id in patches) {
  const rec = DATA.chars[id];
  const oldSub = JSON.stringify(rec);
  if (!src.includes(oldSub)) throw new Error("bulunamadı: " + id);
  src = src.replace(oldSub, JSON.stringify(Object.assign({}, rec, patches[id])));
}
fs.writeFileSync(INDEX, src);

console.log(`D2 uygulandı. ${Object.keys(patches).length} kayıt.\n`);
console.log(`mnemonic not_required (${dist.not_required.length}): ${dist.not_required.join(" ")}`);
console.log(`mnemonic pending_review (${dist.pending_review.length}): ${dist.pending_review.join(" ")}`);
console.log(`irregularWords (${irr.length}): ${irr.join(" ")}`);
