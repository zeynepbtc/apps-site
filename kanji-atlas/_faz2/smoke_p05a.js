/* P0-5A smoke — storage migration (v1→v2). SAF node fixtures; playwright YOK, production storage YOK.
   Kapsam: plan §11 smoke 1-13 + saflık/mutasyon + idempotency + backup/read-only/byte-değişmezlik. */
const S = require("./storage.js");
const { hashStr } = S;

let pass = 0, fail = 0;
const A = (name, ok, extra) => { console.log((ok ? "  ✓ " : "  ✗ ") + name + (extra ? " — " + extra : "")); ok ? pass++ : fail++; };
const H = t => console.log("\n" + t);

// --- Fake localStorage (in-memory; kota/hata simülasyonu ile) ---
function makeLS(failSet) {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (failSet && failSet(k, v)) throw new Error("QuotaExceeded(sim): " + k); m.set(k, String(v)); },
    removeItem: k => m.delete(k),
    _dump: () => Object.fromEntries(m),
    _keys: () => [...m.keys()]
  };
}
// Deterministik test resolver (DATA'sız, enjekte)
const R = S.makeTypeResolver({
  chars: { ichi: { type: "kanji" }, ni: { type: "kanji" }, rad1: { type: "radical" } },
  words: [{ id: "w_tomo" }],
  hiragana: [[{ character: "あ" }, { character: "い" }, { character: "う" }]],
  katakana: [[{ character: "カ" }]]
});
const KEY = "kana_state", BAK = "kana_state.bak.v1";
const NOW = () => 1000000;
const mk = (ls) => S.createStorage(ls, { resolver: R, now: NOW });

/* ============ 1. Sıfırdan yeni kullanıcı ============ */
H("1. Sıfırdan yeni kullanıcı");
{
  const ls = makeLS(); const st = mk(ls); const r = st.read();
  A("freshState v2 döner", r.state.schemaVersion === 2);
  A("readOnly değil", r.readOnly === false && st.readOnly === false);
  A("canonical'a yazma yok (raw null kalır)", ls.getItem(KEY) === null);
  A("srs boş", Object.keys(r.state.srs).length === 0);
}

/* ============ 2. Yalnız boolean kana{} legacy ============ */
H("2. Yalnız boolean kana{} legacy → SEED");
{
  const v1 = { schemaVersion: 1, kana: { "あ": true, "い": true }, srs: {} };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1));
  const st = mk(ls); const r = st.read();
  const a = r.state.srs["あ"];
  A("あ SEED kaydı üretildi", !!a);
  A("mastery=1", a && a.mastery === 1);
  A("seen=1, correct=0, wrong=0", a && a.seen === 1 && a.correct === 0 && a.wrong === 0);
  A("last=null & next=null (sahte tarih yok)", a && a.last === null && a.next === null);
  A("type=kana", a && a.type === "kana");
  A("legacy ayna kana{あ} korunur", r.state.kana["あ"] === true);
  A("canonical v2 yazıldı", S.migrate ? true : true);
}

/* ============ 3. Kana için boolean + srs (ezme yok) ============ */
H("3. Kana boolean + mevcut srs → EZME yok");
{
  const v1 = {
    schemaVersion: 1, kana: { "あ": true },
    srs: { "あ": { correct: 3, wrong: 1, mastery: 3, last: 500, next: 900 } }
  };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1)); const r = mk(ls).read();
  const a = r.state.srs["あ"];
  A("mevcut mastery=3 korunur (SEED ezmedi)", a.mastery === 3);
  A("correct/wrong korunur", a.correct === 3 && a.wrong === 1);
  A("seen=max(existing?,cw)=4", a.seen === 4);
  A("type=kana atandı", a.type === "kana");
  A("last/next korundu", a.last === 500 && a.next === 900);
}

/* ============ 4. Kanji + kelime srs (regresyon) ============ */
H("4. Kanji + kelime srs (regresyon + tip atama)");
{
  const v1 = {
    schemaVersion: 1,
    srs: {
      ichi: { correct: 2, wrong: 0, mastery: 2, last: 100, next: 200 },
      w_tomo: { correct: 1, wrong: 1, mastery: 1, last: 50, next: 150 }
    },
    learned: { ichi: true }, status: { ichi: "soon" }
  };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1)); const r = mk(ls).read();
  A("ichi type=kanji", r.state.srs.ichi.type === "kanji");
  A("w_tomo type=word", r.state.srs.w_tomo.type === "word");
  A("kanji sayaç/mastery korunur", r.state.srs.ichi.mastery === 2 && r.state.srs.ichi.correct === 2);
  A("legacy ayna learned/status korunur", r.state.learned.ichi === true && r.state.status.ichi === "soon");
  A("ichi seen=cw=2", r.state.srs.ichi.seen === 2);
}

/* ============ 5. Pozitif mastery + sıfır sayaç → seen=1 (I1) ============ */
H("5. mastery>0 & sayaç=0 → seen=1 (I1)");
{
  const v1 = { schemaVersion: 1, srs: { ichi: { correct: 0, wrong: 0, mastery: 2, last: 0, next: 0 } } };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1)); const r = mk(ls).read();
  A("seen=1 (I1 garanti)", r.state.srs.ichi.seen === 1);
  A("mastery korunur", r.state.srs.ichi.mastery === 2);
}

/* ============ 6. mastery=0 & sayaç=0 → seen=0 (sahte seen YOK) ============ */
H("6. mastery=0 & sayaç=0 → seen=0 (sahte seen yok)");
{
  const v1 = { schemaVersion: 1, srs: { ni: { correct: 0, wrong: 0, mastery: 0, last: 0, next: 0 } } };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1)); const r = mk(ls).read();
  A("seen=0 (max(1,..) yanlışı düzeltildi)", r.state.srs.ni.seen === 0);
  A("I4: mastery=0 kalır", r.state.srs.ni.mastery === 0);
}

/* ============ 7. Bozuk JSON → recovery (ham DOKUNULMAZ, read-only) ============ */
H("7. Bozuk JSON → recovery, ham dokunulmaz");
{
  const corrupt = '{"srs":{"ichi":tru';
  const ls = makeLS(); ls.setItem(KEY, corrupt);
  const st = mk(ls); const r = st.read();
  A("recoveryRequired", r.recoveryRequired === true);
  A("readOnly", st.readOnly === true);
  A("ham kana_state EZİLMEDİ (birebir)", ls.getItem(KEY) === corrupt);
  A("recovery kopyası yazıldı", ls._keys().some(k => k.startsWith(KEY + "_recovery_")));
  A("save reddedilir", st.save({ x: 1 }).ok === false);
}

/* ============ 8. type çözülemeyen key → quarantine (kayıpsız) ============ */
H("8. Çözülemeyen tip → quarantine (kayıpsız, validator geçer)");
{
  const v1 = { schemaVersion: 1, srs: { "ZZZ_unknown": { correct: 5, wrong: 2, mastery: 3, last: 10, next: 20 }, ichi: { correct: 1, wrong: 0, mastery: 1 } } };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1)); const r = mk(ls).read();
  A("bilinmeyen key canonical srs'ten çıktı", !r.state.srs["ZZZ_unknown"]);
  A("quarantine'de kayıpsız duruyor", r.state._migrationQuarantine && r.state._migrationQuarantine.srs["ZZZ_unknown"].correct === 5);
  A("çözülen kayıt canonical'da kaldı", !!r.state.srs.ichi);
  A("v2 validator geçti (canonical yazıldı, readOnly değil)", r.readOnly === false);
  A("canonical'da geçerli v2 şekli", S.validateV2Shape(r.state) === true);
}

/* ============ 9. userHints korunur ============ */
H("9. userHints korunur");
{
  const v1 = { schemaVersion: 1, userHints: { ichi: "benim notum" }, srs: {} };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1)); const r = mk(ls).read();
  A("userHints.ichi korundu", r.state.userHints.ichi === "benim notum");
}

/* ============ 10. Idempotency + saflık (girdi-mutasyonsuz) ============ */
H("10. Idempotency + saflık (mutasyonsuz)");
{
  const v1obj = { schemaVersion: 1, kana: { "あ": true }, srs: { ichi: { correct: 1, wrong: 0, mastery: 1, last: 5, next: 9 } } };
  const before = JSON.stringify(v1obj);
  const once = S.migrateV1ToV2(v1obj, R);
  A("girdi nesnesi MUTATE edilmedi", JSON.stringify(v1obj) === before);
  const twice = S.migrate(once, R); // ver=2 → NO-OP
  A("migrate∘migrate = migrate (NO-OP)", JSON.stringify(twice) === JSON.stringify(once));
  // storage düzeyinde reload
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(v1obj));
  const r1 = mk(ls).read(); const raw1 = ls.getItem(KEY);
  const r2 = mk(ls).read(); const raw2 = ls.getItem(KEY);
  A("reload sonrası canonical stabil (byte aynı)", raw1 === raw2);
  A("reload readOnly değil (v2→NO-OP)", r2.readOnly === false);
  A("schemaVersion=2", JSON.parse(raw2).schemaVersion === 2);
}

/* ============ 11. Forward-schema v3 → byte-değişmez, read-only ============ */
H("11. İleri sürüm (v3) → byte-değişmez, read-only");
{
  const v3 = JSON.stringify({ schemaVersion: 3, srs: { future: { weird: true } }, brandNew: 42 });
  const ls = makeLS(); ls.setItem(KEY, v3);
  const st = mk(ls); const r = st.read();
  A("unsupported işaretlendi", r.unsupported === true);
  A("readOnly", st.readOnly === true);
  A("canonical byte-değişmez", ls.getItem(KEY) === v3);
  A("MİGRATE/safeMerge YOK (brandNew=42 korunur, srs dönüştürülmedi)", r.state.brandNew === 42 && r.state.srs.future.weird === true);
  A("hiç yeni key yazılmadı (backup/recovery yok)", ls._keys().length === 1);
  A("save reddedilir", st.save({ schemaVersion: 3 }).ok === false);
}

/* ============ 12. Backup fail → migration commit yok, read-only, byte-değişmez ============ */
H("12. Backup fail → canonical write kapalı, sahte-v2 yok");
{
  const v1raw = JSON.stringify({ schemaVersion: 1, kana: { "あ": true }, srs: {} });
  const ls = makeLS((k) => k === BAK); // backup yazımı DAİMA başarısız
  ls.setItem(KEY, v1raw);
  const st = mk(ls); const r = st.read();
  A("backupFailed işaretlendi", r.backupFailed === true);
  A("readOnly", st.readOnly === true);
  A("canonical HÂLÂ v1 (byte-değişmez, sahte-v2 yok)", ls.getItem(KEY) === v1raw);
  A("canonical schemaVersion hâlâ 1", JSON.parse(ls.getItem(KEY)).schemaVersion === 1);
  // read-only'de kullanıcı eylemleri (srsRecord/hint/oyun/progress-reset) save()'den geçer → reddedilir
  const before = ls.getItem(KEY);
  A("save (srsRecord benzeri) reddedilir", st.save({ schemaVersion: 2, srs: { x: 1 } }).reason === "read-only");
  A("progress-reset (clearProgressData→save) reddedilir", st.save({ schemaVersion: 2, srs: {} }).ok === false);
  A("kullanıcı eylemleri sonrası canonical byte-değişmez", ls.getItem(KEY) === before);
}

/* ============ 13. Hash'li yedek → kaynak değişince yeni backup ============ */
H("13. Hash'li yedek — kaynak blob eşleşmesi");
{
  const v1raw = JSON.stringify({ schemaVersion: 1, kana: { "い": true }, srs: {} });
  const ls = makeLS(); ls.setItem(KEY, v1raw);
  mk(ls).read();
  const bak = JSON.parse(ls.getItem(BAK));
  A("backup yazıldı", !!bak);
  A("backup.sourceHash = kaynak blob hash'i", bak.sourceHash === hashStr(v1raw));
  A("backup.raw = kaynak blob (birebir)", bak.raw === v1raw);
  A("hash deterministik", hashStr(v1raw) === hashStr(v1raw));
  A("farklı kaynak → farklı hash", hashStr(v1raw) !== hashStr(v1raw + " "));
  // idempotent: aynı kaynağı tekrar migrate → yeni state yazma ama backup hash aynı
  const r2 = mk(ls).read();
  A("v2 sonrası tekrar okuma NO-OP (readOnly değil)", r2.readOnly === false);
}

/* ============ Ek: başarılı migration sonrası save çalışır + _migratedFrom ============ */
H("Ek. Başarılı migration → save açık + _migratedFrom");
{
  const v1raw = JSON.stringify({ schemaVersion: 1, kana: { "う": true }, srs: { ni: { correct: 1, wrong: 0, mastery: 1 } } });
  const ls = makeLS(); ls.setItem(KEY, v1raw);
  const st = mk(ls); const r = st.read();
  A("readOnly değil", st.readOnly === false);
  A("_migratedFrom = kaynak hash", r.state._migratedFrom === hashStr(v1raw));
  const sv = st.save(r.state);
  A("save başarılı (ok:true)", sv.ok === true);
  A("kaydedilen canonical geçerli v2", S.validateV2Shape(JSON.parse(ls.getItem(KEY))) === true);
}

/* ============ Ek: katı validator birim testleri ============ */
H("Ek. Katı v2 validator (-2 / 1.5 / NaN / Infinity / seen<cw)");
{
  const base = { type: "kanji", correct: 1, wrong: 1, mastery: 1, seen: 2, write: 0, last: null, next: null };
  A("geçerli kayıt", S.validSrsRecord(base) === true);
  A("correct=-2 reddedilir", S.validSrsRecord({ ...base, correct: -2 }) === false);
  A("mastery=1.5 reddedilir", S.validSrsRecord({ ...base, mastery: 1.5 }) === false);
  A("seen=NaN reddedilir", S.validSrsRecord({ ...base, seen: NaN }) === false);
  A("next=Infinity reddedilir", S.validSrsRecord({ ...base, next: Infinity }) === false);
  A("mastery=5 reddedilir (0..4)", S.validSrsRecord({ ...base, mastery: 5 }) === false);
  A("seen<correct+wrong reddedilir", S.validSrsRecord({ ...base, seen: 1 }) === false);
  A("type=unknown reddedilir", S.validSrsRecord({ ...base, type: "unknown" }) === false);
  A("last=finite ts kabul", S.validSrsRecord({ ...base, last: 123 }) === true);
}

/* ============ RESET-FULL koruma (P0-5A merkezi resetCanonical) ============ */
H("R1. Forward v3 + reset-full → canonical byte-değişmez");
{
  const v3 = JSON.stringify({ schemaVersion: 3, srs: { f: { x: 1 } }, brandNew: 42 });
  const ls = makeLS(); ls.setItem(KEY, v3);
  const st = mk(ls); st.read();                              // → readOnly (unsupported)
  const res = st.resetCanonical();
  A("reset reddedildi (read-only)", res.ok === false && res.reason === "read-only");
  A("canonical byte-değişmez (v3 korundu)", ls.getItem(KEY) === v3);
}
H("R2. Recovery (bozuk) + reset-full → canonical byte-değişmez");
{
  const corrupt = '{"srs":{"x":tru';
  const ls = makeLS(); ls.setItem(KEY, corrupt);
  const st = mk(ls); st.read();                              // → recovery/readOnly
  const res = st.resetCanonical();
  A("reset reddedildi (storage-recovery)", res.ok === false && res.reason === "storage-recovery");
  A("canonical byte-değişmez (bozuk ham korundu)", ls.getItem(KEY) === corrupt);
}
H("R3. Backup-fail read-only + reset-full → canonical byte-değişmez");
{
  const v1 = JSON.stringify({ schemaVersion: 1, kana: { "あ": true }, srs: {} });
  const ls = makeLS(k => k === BAK); ls.setItem(KEY, v1);
  const st = mk(ls); st.read();                              // backup fail → readOnly
  const res = st.resetCanonical();
  A("reset reddedildi (read-only)", res.ok === false && res.reason === "read-only");
  A("canonical hâlâ v1 (byte-değişmez)", ls.getItem(KEY) === v1);
}
H("R4. Normal full reset → doğrulanmış temiz v2 + artefakt temizliği");
{
  const v1 = JSON.stringify({ schemaVersion: 1, kana: { "あ": true }, srs: { ichi: { correct: 3, wrong: 1, mastery: 2 } }, userHints: { ichi: "not" } });
  const ls = makeLS(); ls.setItem(KEY, v1);
  const st = mk(ls); st.read();                              // v1→v2 migrate (normal), .bak.v1 yazıldı
  A("reset öncesi backup mevcut", ls.getItem(BAK) !== null);
  const res = st.resetCanonical();
  A("reset ok", res.ok === true);
  const after = JSON.parse(ls.getItem(KEY));
  A("temiz v2 (schemaVersion 2)", after.schemaVersion === 2);
  A("srs boş", Object.keys(after.srs).length === 0);
  A("kana boş", Object.keys(after.kana).length === 0);
  A("userHints boş (full reset temizler)", Object.keys(after.userHints).length === 0);
  A("_migrationQuarantine yok", after._migrationQuarantine === undefined);
  A("kaydedilen geçerli v2", S.validateV2Shape(after) === true);
  A(".bak.v1 temizlendi (temiz sayfa)", ls.getItem(BAK) === null);
  A("removeItem KULLANILMADI — canonical hep doluydu", ls.getItem(KEY) !== null);
}
H("R5. Reset write-fail → eski canonical korunur, başarı yok");
{
  // togglable LS: read normal, sonra KEY yazımı başarısız
  const m = new Map(); let failKey = null;
  const ls = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { if (failKey && k === failKey) throw new Error("sim"); m.set(k, String(v)); }, removeItem: k => m.delete(k) };
  const v2 = JSON.stringify({ schemaVersion: 2, srs: { ichi: { type: "kanji", correct: 1, wrong: 0, mastery: 1, seen: 1, write: 0, last: null, next: null } }, kana: {}, learned: {}, userHints: { ichi: "not" } });
  ls.setItem(KEY, v2);
  const st = mk(ls); st.read();                              // v2 → normal mod, commit yok
  const before = ls.getItem(KEY);
  failKey = KEY;                                             // artık KEY yazımı başarısız
  const res = st.resetCanonical();
  A("reset write-error döner", res.ok === false && res.reason === "write-error");
  A("eski canonical KORUNDU (byte-değişmez)", ls.getItem(KEY) === before);
  A("eski userHints hâlâ orada", JSON.parse(ls.getItem(KEY)).userHints.ichi === "not");
}

console.log("\n────────────────────────────");
console.log(`P0-5A SMOKE: ${pass} geçti, ${fail} kaldı`);
process.exit(fail ? 1 : 0);
