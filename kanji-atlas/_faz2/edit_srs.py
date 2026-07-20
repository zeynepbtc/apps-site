f = "/home/claude/atlas_drive_may30.html"; h = open(f, encoding="utf-8").read()

# ---- A) Kanonik saf selector + wrapper + diagnostic'i dueItems'tan HEMEN SONRA ekle ----
anchor = """function dueItems(){
  const now=Date.now();
  return Object.keys(state.srs).filter(k=>state.srs[k].next && state.srs[k].next<=now);
}"""
assert h.count(anchor) == 1, "dueItems anchor bulunamadı"
INJECT = anchor + """
/* FAZ 2 · Kana Review / SRS tutarlılığı — TEK kanonik due kaynağı (kapsam A: yalnız kanji, kesin zaman-temelli).
   SAF: state+data+now ENJEKTE; yan etki yok, giriş mutasyonu yok. Test edilen fonksiyon buildKanjiReviewQueue. */
function inKanjiReviewScope(data, key){
  const item = data && data.chars ? data.chars[key] : null;
  return Boolean(item && item.type === "kanji");
}
function buildKanjiReviewQueue(state, data, now){
  if(!Number.isFinite(now)) return [];                          // now doğrulaması → risksiz boş kuyruk
  return Object.entries((state && state.srs) || {})
    .filter(([id, rec]) =>
      inKanjiReviewScope(data, id) &&
      Number.isFinite(rec && rec.next) &&                       // string/null/NaN/Infinity ELENİR
      rec.next <= now)
    .sort(([idA, a], [idB, b]) =>
      (a.next - b.next) ||                                      // 1) en eski next önce
      ((Number.isFinite(a.mastery) ? a.mastery : 0) -
       (Number.isFinite(b.mastery) ? b.mastery : 0)) ||         // 2) düşük mastery önce
      idA.localeCompare(idB))                                   // 3) ID tie-break → deterministik
    .map(([id]) => id);
}
function currentKanjiReviewQueue(now){ return buildKanjiReviewQueue(state, DATA, (now===undefined?Date.now():now)); }
function dueCount(now){ return currentKanjiReviewQueue(now).length; }
/* Yan etkisiz teşhis — storage'dan SİLMEZ, yalnız raporlar (harness/debug). */
function inspectKanjiReviewData(state, data){
  const unknownKeys=[], invalidNext=[];
  for(const [id, rec] of Object.entries((state && state.srs) || {})){
    if(!inKanjiReviewScope(data, id)) unknownKeys.push(id);
    else if(!Number.isFinite(rec && rec.next)) invalidNext.push(id);
  }
  return { unknownKeys, invalidNext };
}
if(typeof window!=="undefined") window.__srs = { inKanjiReviewScope, buildKanjiReviewQueue, currentKanjiReviewQueue, dueCount, inspectKanjiReviewData };"""
h = h.replace(anchor, INJECT, 1)

# ---- B) Review başlığı: birleşim → kanonik kuyruk; metin "N kanji tekrar bekliyor" ----
b_old = '''  const due=[...new Set([...dueItems().filter(k=>ch(k)), ...reviewQueue()])];
  return `<div class="stagger">
  <div class="card" style="background:linear-gradient(135deg,#fff,#FBF4EC)">
    <div class="row between"><div><div style="font-weight:700;font-size:15px">${due.length} karakter tekrar bekliyor</div>'''
b_new = '''  const now=Date.now();
  const due=buildKanjiReviewQueue(state, DATA, now);   // TEK kanonik kaynak (kapsam A · kesin zaman-temelli)
  return `<div class="stagger">
  <div class="card" style="background:linear-gradient(135deg,#fff,#FBF4EC)">
    <div class="row between"><div><div style="font-weight:700;font-size:15px">${due.length} kanji tekrar bekliyor</div>'''
assert h.count(b_old) == 1, "Review başlığı bloğu bulunamadı"
h = h.replace(b_old, b_new, 1)

# ---- C) review-start: reviewQueue → kanonik kuyruk (tıklama anında yeniden snapshot) ----
c_old = '  else if(act==="review-start"){\n    const due=reviewQueue(); if(!due.length) return;\n    state.param=due[0]; go("quiz",due[0]); \n  }'
c_new = '''  else if(act==="review-start"){
    const due=currentKanjiReviewQueue(); if(!due.length) return;   // tıklama anında kanonik snapshot
    state.param=due[0]; go("quiz",due[0]);
  }'''
assert h.count(c_old) == 1, "review-start bloğu bulunamadı"
h = h.replace(c_old, c_new, 1)

# ---- D) Profil "Bugün tekrar" → dueCount + metin "Kanji tekrarı" ----
d_old = '''      <div class="s"><div class="n">${dueItems().length}</div><div class="l">Bugün tekrar</div></div>'''
d_new = '''      <div class="s"><div class="n">${dueCount()}</div><div class="l">Kanji tekrarı</div></div>'''
assert h.count(d_old) == 1, "Profil Bugün tekrar bulunamadı"
h = h.replace(d_old, d_new, 1)

# ---- E) Progress statline "Tekrar": reviewQueue().length → dueCount (kısa etiket korunur) ----
e_old = '''  const q = reviewQueue();
  const statlineHtml = `<div class="statline" style="margin-top:6px">
    <div class="s"><div class="n">${learnedCount}</div><div class="l">Karakter</div></div>
    <div class="s"><div class="n">${masteredComponents()}</div><div class="l">Kök</div></div>
    <div class="s"><div class="n">${q.length}</div><div class="l">Tekrar</div></div>'''
e_new = '''  const q = reviewQueue();
  const statlineHtml = `<div class="statline" style="margin-top:6px">
    <div class="s"><div class="n">${learnedCount}</div><div class="l">Karakter</div></div>
    <div class="s"><div class="n">${masteredComponents()}</div><div class="l">Kök</div></div>
    <div class="s"><div class="n">${dueCount()}</div><div class="l">Tekrar</div></div>'''
assert h.count(e_old) == 1, "Progress statline bloğu bulunamadı"
h = h.replace(e_old, e_new, 1)

open(f, "w", encoding="utf-8").write(h)
print("SRS kanonik selector enjekte edildi + 4 tüketici rewire edildi")
