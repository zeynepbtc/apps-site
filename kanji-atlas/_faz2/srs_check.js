/* FAZ 2 · SRS kanonik selector — SAF harness (shipped kaynaktan çıkarılmış fonksiyonlar). */
const S = require("./srs_selector.extracted.js");
const DATA = { chars: {
  ki:   { type:"kanji" }, hi:{ type:"kanji" }, hon:{ type:"kanji" }, hayashi:{ type:"kanji" },
  moku: { type:"radical" },              // kanji DEĞİL → kapsam dışı
  // sıralama/geçersiz-next testleri için ek kapsam-içi kanji id'leri:
  old:  { type:"kanji" }, beta:{ type:"kanji" }, alpha:{ type:"kanji" }, zebra:{ type:"kanji" }
}};
const eq = (a,b) => JSON.stringify(a)===JSON.stringify(b);
let fail=0; const A=(n,ok,x)=>{ console.log((ok?"✓":"✗")+" "+n+(x?" — "+x:"")); if(!ok) fail++; };
const NOW = 1_000_000_000_000;                       // sabit now (Date.now yok)
const rec = (next, mastery=0, correct=0, wrong=0) => ({ next, mastery, correct, wrong, last:0 });

console.log("# SRS selector saf kabul testleri\n");

// 1) boş
A("1) boş srs → []", eq(S.buildKanjiReviewQueue({srs:{}}, DATA, NOW), []));

// 2) zaman-due kanji
A("2) next<=now kanji → kuyrukta", eq(S.buildKanjiReviewQueue({srs:{ ki:rec(NOW-1) }}, DATA, NOW), ["ki"]));

// 3) learning ama zamanı gelmemiş (status due kaynağı DEĞİL — selector status'a bakmaz)
A("3) next gelecekte → due değil", eq(S.buildKanjiReviewQueue({srs:{ ki:rec(NOW+5000) }}, DATA, NOW), []));

// 4) mastered ama zaman-due → yine due (ölü buton çözümü)
A("4) mastery 4 + next<=now → due", eq(S.buildKanjiReviewQueue({srs:{ ki:rec(NOW-1,4) }}, DATA, NOW), ["ki"]));

// 5) kana due → kapsam dışı (kana DATA.chars'ta yok)
A("5) kana anahtarı 'あ' → elenir", eq(S.buildKanjiReviewQueue({srs:{ "あ":rec(NOW-1) }}, DATA, NOW), []));

// 6) hayalet/tanınmayan → elenir + diagnostic raporlar
{ const st={srs:{ silinmis_id:rec(NOW-1), ki:rec(NOW-1) }};
  A("6) tanınmayan id kuyruğa girmez", eq(S.buildKanjiReviewQueue(st, DATA, NOW), ["ki"]));
  const d=S.inspectKanjiReviewData(st, DATA);
  A("6b) diagnostic unknownKeys=[silinmis_id]", eq(d.unknownKeys, ["silinmis_id"]) && eq(d.invalidNext, [])); }

// 10) next === now → due (sınır dahil)
A("10) next===now → due", eq(S.buildKanjiReviewQueue({srs:{ ki:rec(NOW) }}, DATA, NOW), ["ki"]));

// 11) next string/null/NaN/Infinity → due değil + invalidNext (kapsam-içi kanji anahtarlarıyla)
{ const st={srs:{ hi:rec("999"), hon:rec(null), hayashi:rec(NaN), old:rec(Infinity), ki:rec(NOW) }};
  A("11) string/null/NaN/Infinity next → elenir", eq(S.buildKanjiReviewQueue(st, DATA, NOW), ["ki"]));
  const d=S.inspectKanjiReviewData(st, DATA);
  A("11b) invalidNext = [hayashi,hi,hon,old] (kanji ama bozuk next)", eq([...d.invalidNext].sort(), ["hayashi","hi","hon","old"]) && eq(d.unknownKeys, [])); }
// now geçersizse → boş
A("11c) now NaN → []", eq(S.buildKanjiReviewQueue({srs:{ ki:rec(NOW) }}, DATA, NaN), []));
A("11d) now Infinity → []", eq(S.buildKanjiReviewQueue({srs:{ ki:rec(NOW) }}, DATA, Infinity), []));

// 12) aynı state + aynı now → aynı deterministik sıra (iki çağrı eş)
{ const st={srs:{ hon:rec(NOW-10,2), ki:rec(NOW-10,1), hi:rec(NOW-20,3) }};
  const r1=S.buildKanjiReviewQueue(st,DATA,NOW), r2=S.buildKanjiReviewQueue(st,DATA,NOW);
  A("12) iki çağrı byte-eş (deterministik)", eq(r1,r2)); }

// 13) en eski next ilk; eşitlikte düşük mastery; sonra ID
{ const st={srs:{
    zebra: rec(NOW-5, 1),      // next -5
    alpha: rec(NOW-5, 1),      // next -5, mastery eş → ID: alpha < zebra
    beta:  rec(NOW-5, 0),      // next -5, mastery 0 → önce
    old:   rec(NOW-99, 3) }};  // en eski next → en başta
  A("13) sıra: old, beta, alpha, zebra",
    eq(S.buildKanjiReviewQueue(st, DATA, NOW), ["old","beta","alpha","zebra"])); }

// 14) selector giriş state'ini ve DATA'yı DEĞİŞTİRMEZ
{ const st={srs:{ ki:rec(NOW-1,2), "あ":rec(NOW-1) }};
  const stCopy=JSON.parse(JSON.stringify(st)), dataCopy=JSON.parse(JSON.stringify(DATA));
  S.buildKanjiReviewQueue(st, DATA, NOW); S.inspectKanjiReviewData(st, DATA);
  A("14) state mutasyonu yok", eq(st, stCopy));
  A("14b) DATA mutasyonu yok", eq(DATA, dataCopy)); }

// radikal de kapsam dışı (yalnız type==='kanji')
A("+ radikal 'moku' → elenir", eq(S.buildKanjiReviewQueue({srs:{ moku:rec(NOW-1) }}, DATA, NOW), []));

console.log(fail===0 ? "\n✅ SRS SELECTOR SAF TESTLERİ GEÇTİ (0 başarısız)" : "\n❌ "+fail+" başarısız");
process.exit(fail===0?0:1);
