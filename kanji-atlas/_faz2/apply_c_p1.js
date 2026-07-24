/* FAZ2-FIX C · P1 düzeltmeleri (SADECE aşağıdaki kayıtlar).
   Yapısal: 国 (囗→口 gloss düzeltme), 玉 (象形, folk köken → pending).
   Okuma: official/taught/deferred. taught = kart-içi örnek tutarsızlığını gideren çekirdek N5 okumalar.
   deferred = official ama öğretilmez (足 た-りる N4; 男 ナン N4) veya taught kararı pedagojik QA'da (人 ニン, 大 タイ).
   Türetilmiş: components/component_meanings (国/玉) + onyomi/kunyomi (taughtOn/Kun'dan). Yeni köken/mnemonic YAZILMAZ. */
const fs = require("fs"), path = require("path");
const INDEX = path.join(__dirname, "..", "index.html");
let src = fs.readFileSync(INDEX, "utf8");
const DATA = JSON.parse(src.match(/const DATA = (\{.*?\});/s)[1]);

// Yapısal (国/玉)
const STRUCT = {
  kuni: { ft: "会意", st: [["囗", "semantic", "sınır / çerçeve"], ["玉", "semantic", "değerli taş"]], koken: "keep" },
  tama: { ft: "象形", st: [], koken: "pending" },
};
// Okuma: officialOn, officialKun, taughtOn, taughtKun, deferred[]
const READ = {
  tsuki:  { oon: ["ゲツ", "ガツ"], okun: ["つき"], ton: ["ゲツ", "ガツ"], tkun: ["つき"], def: [] },
  kyuu:   { oon: ["キュウ", "ク"], okun: ["ここの(つ)"], ton: ["キュウ", "ク"], tkun: ["ここの(つ)"], def: [] },
  yon:    { oon: ["シ"], okun: ["よん", "よ(つ)"], ton: ["シ"], tkun: ["よん", "よ(つ)"], def: [] },
  ato:    { oon: ["ゴ"], okun: ["あと", "うし(ろ)"], ton: ["ゴ"], tkun: ["あと", "うし(ろ)"], def: [] },
  sei:    { oon: ["セイ"], okun: ["い(きる)", "う(まれる)"], ton: ["セイ"], tkun: ["い(きる)", "う(まれる)"], def: [] },
  hanasu: { oon: ["ワ"], okun: ["はな(す)", "はなし"], ton: ["ワ"], tkun: ["はな(す)", "はなし"], def: [] },
  nani:   { oon: ["カ"], okun: ["なに", "なん"], ton: ["カ"], tkun: ["なに", "なん"], def: [] },
  // deferred: official ama taught değil
  ashi:   { oon: ["ソク"], okun: ["あし", "た(りる)"], ton: ["ソク"], tkun: ["あし"], def: [{ reading: "た(りる)", reason: "N4; farklı anlam kümesi (yetmek); örnek 足りる authoring incelemesine", recommend: "defer" }] },
  hito:   { oon: ["ジン", "ニン"], okun: ["ひと"], ton: ["ジン"], tkun: ["ひと"], def: [{ reading: "ニン", reason: "çok yaygın (三人/人気); taught kararı pedagojik QA", recommend: "taught" }] },
  dai:    { oon: ["ダイ", "タイ"], okun: ["おお(きい)"], ton: ["ダイ"], tkun: ["おお(きい)"], def: [{ reading: "タイ", reason: "çok yaygın (大変/大切); taught kararı pedagojik QA", recommend: "taught" }] },
  otoko:  { oon: ["ダン", "ナン"], okun: ["おとこ"], ton: ["ダン"], tkun: ["おとこ"], def: [{ reading: "ナン", reason: "N4 (長男); taught değil", recommend: "defer" }] },
};

const report = [];
const ids = [...new Set([...Object.keys(STRUCT), ...Object.keys(READ)])];
for (const id of ids) {
  const rec = DATA.chars[id];
  if (!rec) throw new Error("kayıt yok: " + id);
  const oldSub = JSON.stringify(rec);
  if (!src.includes(oldSub)) throw new Error("bulunamadı: " + id);
  const patch = {};
  const r = { id, char: rec.character, changes: [] };

  if (STRUCT[id]) {
    const f = STRUCT[id];
    const components = f.st.map(x => x[0]);
    const component_meanings = {};
    for (const x of f.st) if (x[2] !== null) component_meanings[x[0]] = x[2];
    patch.components = components;
    patch.component_meanings = component_meanings;
    patch.parent_components = f.st.length === 0 ? [] : rec.parent_components;
    patch.structure = { components: f.st.map(x => ({ glyph: x[0], role: x[1], labelTr: x[2] })), qaStatus: "reviewed" };
    patch.etymology = { formationType: f.ft, formationTypeSource: "Kanjipedia", confidence: "A", qaStatus: f.koken === "pending" ? "pending" : "reviewed" };
    r.changes.push(`comps ${JSON.stringify(rec.components)}→${JSON.stringify(components)} · ${f.ft} · köken:${f.koken}`);
  }
  if (READ[id]) {
    const R = READ[id];
    const onyomi = R.ton.join("・");
    const kunyomi = R.tkun.join("・");
    patch.readings = { officialOn: R.oon, officialKun: R.okun, taughtOn: R.ton, taughtKun: R.tkun, deferred: R.def, source: "文化庁 常用漢字表 / jitenon", qaStatus: "reviewed" };
    patch.onyomi = onyomi;
    patch.kunyomi = kunyomi;
    const onCh = onyomi !== rec.onyomi ? `on ${JSON.stringify(rec.onyomi)}→${JSON.stringify(onyomi)}` : "on=";
    const kunCh = kunyomi !== rec.kunyomi ? `kun ${JSON.stringify(rec.kunyomi)}→${JSON.stringify(kunyomi)}` : "kun=";
    const defStr = R.def.length ? ` · deferred: ${R.def.map(d => d.reading + "(" + d.recommend + ")").join(",")}` : "";
    r.changes.push(`${onCh} ${kunCh}${defStr}`);
  }
  const mutated = Object.assign({}, rec, patch);
  src = src.replace(oldSub, JSON.stringify(mutated));
  report.push(r);
}
fs.writeFileSync(INDEX, src);
console.log(`${ids.length} kayıt güncellendi (C/P1).\n`);
for (const r of report) console.log(`${r.char} (${r.id}): ${r.changes.join(" | ")}`);
