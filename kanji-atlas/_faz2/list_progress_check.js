/* FAZ 2 · Kalem 1 — familyList + familyProgress SAF VERİ doğrulaması (UI'a bağlanmaz).
   GPT kriterleri: deterministik sıra · duplicate yok · 休 çift-sayılmıyor · fallback açık · boş veride çökme yok. */
const fs = require("fs");
const { FAMILIES, makeResolver } = require("./families.js");
const chars = JSON.parse(fs.readFileSync(__dirname + "/data_chars.json", "utf8"));
const R = makeResolver(chars);

let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

console.log("# familyList + familyProgress saf veri doğrulama\n");

// 1) DETERMİNİSTİK SIRA
const l1 = R.familyList(), l2 = R.familyList();
A("familyList deterministik (iki çağrı birebir)", eq(l1, l2), l1.map(f => f.id).join(","));
A("famNodes deterministik", eq(R.famNodes(FAMILIES.tree), R.famNodes(FAMILIES.tree)));

// 2) DUPLICATE YOK
A("familyList'te duplicate aile yok", new Set(l1.map(f => f.id)).size === l1.length);
["tree", "person"].forEach(fid => { const ids = R.famNodes(FAMILIES[fid]).map(n => n.id); A(`[${fid}] famNodes'ta duplicate karakter yok`, new Set(ids).size === ids.length); });

// 3) 休 ÇİFT-SAYILMIYOR
// tek kanji ilerleme kaydı (learnedSet); her aile ONU referanslar. 休 iki ailede DE üye ama kayıt TEK.
const learned = new Set(["ki", "hayashi", "yasumu"]); // kullanıcı: 木,林,休 öğrendi
const pt = R.familyProgress("tree", learned), pp = R.familyProgress("person", learned);
A("familyProgress per-aile doğru (tree 3/5 · person 1/5 — 木,林 person'da değil)", pt.learned === 3 && pt.total === 5 && pp.learned === 1 && pp.total === 5, `tree ${pt.learned}/${pt.total} · person ${pp.learned}/${pp.total}`);
// GLOBAL toplam = BENZERSİZ kanji (ailelerin toplamı DEĞİL). 休 iki ailede sayılırsa çift-sayım olur.
const naiveSum = pt.learned + pp.learned;                 // = 5 (休 iki kez!)
const uniqueLearned = new Set([...learned].filter(id => R.familiesOf(id).length)).size; // benzersiz
A("çift-sayım tuzağı görünür: naif toplam(4) ≠ benzersiz(3) — 休 iki ailede; global=benzersiz kullanılmalı", naiveSum === 4 && uniqueLearned === 3, `naif=${naiveSum} benzersiz=${uniqueLearned}`);

// 4) FALLBACK / KANONİK-DIŞI açık
A("familyProgress(bilinmeyen aile) → null (çökme yok)", R.familyProgress("yok", learned) === null);
A("kanonik-dışı karakter (校) hiçbir ailede değil → familiesOf boş", R.familiesOf("gakkou").length === 0);

// 5) BOŞ / EKSİK VERİDE ÇÖKME YOK
let ok5 = true, d = {};
try {
  const Rempty = makeResolver(chars, {});               // hiç aile yok
  d.list = Rempty.familyList();                          // [] beklenir
  d.prog = Rempty.familyProgress("tree", learned);       // null beklenir
  d.emptyLearned = R.familyProgress("tree", new Set());  // learned 0
} catch (e) { ok5 = false; d.err = String(e); }
A("boş FAMILIES + boş learnedSet → çökme yok", ok5 && eq(d.list, []) && d.prog === null && d.emptyLearned.learned === 0, ok5 ? "" : d.err);

console.log("\n> familyList/familyProgress SAF VERİ olarak doğrulandı; UI bağlaması Faz 3'e ait (sahte tüketici üretilmedi).");
console.log(fail === 0 ? "\n✅ 0 başarısız" : "\n❌ " + fail + " başarısız");
process.exit(fail === 0 ? 0 : 1);
