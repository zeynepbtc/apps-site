/* FAZ 2 · Ses manifesti bütünlük harness'ı (saf; çalışan uygulamaya dokunmaz). */
const fs = require("fs");
const REPO = "/home/claude/apps-deploy";
const man = JSON.parse(fs.readFileSync(`${REPO}/kanji-atlas/audio-manifest.json`, "utf-8"));
const flickKana = new Set(fs.readdirSync(`${REPO}/japanese-flick/audio/kana`).map(f => f.replace(/\.mp3$/, "")));
const flickWord = new Set(fs.readdirSync(`${REPO}/japanese-flick/audio/word`).map(f => f.replace(/\.mp3$/, "")));

let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };
const E = man.entries;
const DURUM = new Set(["recorded", "tts", "missing"]);
const KAYNAK = new Set(["flick", "yeni"]);
const KAT = new Set(["kana", "kanji", "word", "sentence"]);

// 1) id benzersiz
{ const ids = E.map(e => e.id); A("1) tüm id benzersiz", new Set(ids).size === ids.length, `${ids.length} kayıt`); }

// 2) zorunlu alanlar + tip
{ let bad = E.filter(e => !e.id || !KAT.has(e.kategori) || typeof e.metin !== "string" || !KAYNAK.has(e.kaynak) || !DURUM.has(e.durum));
  A("2) her kayıt şemaya uygun (id·kategori·metin·kaynak·durum)", bad.length === 0, bad.slice(0,2).map(x=>x.id).join()); }

// 3) durum ↔ ses_dosyası tutarlılığı
{ // recorded → ses_dosyası dolu; missing/tts → null
  let bad = E.filter(e => (e.durum === "recorded") ? !e.ses_dosyasi : (e.ses_dosyasi !== null));
  A("3) recorded→dosya var, missing/tts→dosya yok", bad.length === 0, bad.slice(0,3).map(x=>x.id+":"+x.durum).join()); }

// 4) kaynak ↔ durum
{ let bad = E.filter(e => (e.kaynak === "flick") !== (e.durum === "recorded"));
  A("4) kaynak=flick ⇔ durum=recorded", bad.length === 0, bad.slice(0,3).map(x=>x.id).join()); }

// 5) Flick kaynaklı kayıtlar GERÇEK Flick dosyasına işaret ediyor
{ const flickEntries = E.filter(e => e.kaynak === "flick");
  let bad = flickEntries.filter(e => {
    const m = e.ses_dosyasi.match(/^audio\/(kana|word)\/(.+)\.mp3$/);
    if (!m) return true;
    return m[1] === "kana" ? !flickKana.has(m[2]) : !flickWord.has(m[2]);
  });
  A("5) tüm flick kayıtları GERÇEK Flick dosyasına işaret ediyor", bad.length === 0, bad.slice(0,3).map(x=>x.id+"→"+x.ses_dosyasi).join()); }

// 6) yol şeması: ortak klasör yapısı (tekil word/sentence)
{ let bad = E.filter(e => e.ses_dosyasi && !/^audio\/(kana|kanji|word|sentence)\//.test(e.ses_dosyasi));
  A("6) ses_dosyası ortak klasör yapısında (kana|kanji|word|sentence, tekil)", bad.length === 0, bad.slice(0,3).map(x=>x.ses_dosyasi).join()); }

// 7) sayılar envanterle eşleşiyor
{ const byKat = {}; E.forEach(e => byKat[e.kategori] = (byKat[e.kategori]||0)+1);
  A("7a) kategori sayıları (92/91/78/78)", byKat.kana===92 && byKat.kanji===91 && byKat.word===78 && byKat.sentence===78, JSON.stringify(byKat));
  const rec = E.filter(e=>e.durum==="recorded").length, miss = E.filter(e=>e.durum==="missing").length, tts = E.filter(e=>e.durum==="tts").length;
  A("7b) durum sayıları (214 recorded / 47 missing / 78 tts)", rec===214 && miss===47 && tts===78, `${rec}/${miss}/${tts}`); }

// 8) cümleler tts, ses_dosyası yok
{ const s = E.filter(e=>e.kategori==="sentence"); A("8) tüm cümleler durum=tts", s.every(e=>e.durum==="tts"), `${s.length} cümle`); }

// 9) kanji: temsilî okunuş + Flick eşleşmeleri doğrulanmalı bayraklı
{ const kj = E.filter(e=>e.kategori==="kanji");
  const flaggedRight = kj.filter(e => e.kaynak==="flick").every(e => e.dogrulanmali===true);
  A("9) flick-eşleşen kanjiler 'dogrulanmali' bayraklı (bağlam QA)", flaggedRight, `${kj.filter(e=>e.dogrulanmali).length} bayrak`); }

// 10) _meta pedagojik hüküm var
{ A("10) _meta pedagojik hüküm mevcut", !!(man._meta && man._meta.pedagojik_hukum && /temsili okunus/.test(man._meta.pedagojik_hukum))); }

console.log(fail === 0 ? "\n✅ MANİFEST BÜTÜNLÜK GEÇTİ (0 başarısız)" : "\n❌ " + fail + " başarısız");
process.exit(fail === 0 ? 0 : 1);
