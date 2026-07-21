/* FAZ 2 · Storage/Migration — SAF mantık (localStorage'a doğrudan bağlı DEĞİL, test edilebilir).
   İlke: migration kullanıcı verisini DÖNÜŞTÜRÜR, sessizce SIFIRLAMAZ.
   Kapsam: R1 (bozuk JSON'da sessiz sıfırlama YOK) · R2 (schemaVersion) · R3 (kontrollü nested-default).
   P0-5A (v1→v2): srs kayıtlarına type/seen/write; legacy boolean kana → SEED mastery 1 (last/next null);
   forward-schema guard; hash'li backup-gate; merkezi read-only; katı v2 validator. Kana SRS DAVRANIŞI = P0-5B (bu dosyada YOK). */

const SCHEMA_VERSION = 2;

// Uygulamadaki state defaults ile birebir.
const DEFAULT_STATE = {
  schemaVersion: SCHEMA_VERSION,
  screen: "home", stack: [], param: null,
  learned: {}, status: {}, kana: {},
  streak: 1, pathStage: 1, srs: {}, games: {},
  settings: { audio: true, audioMode: "system", autoplay: true, calm: true },
  lastActive: 0, userProfile: null, onboarding: null, _resume: null,
  lastSeenKatakana: [], discoveredRules: {}, cipherLearned: {}, userHints: {}
};

const isPlainObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
const freshState = () => structuredClone(DEFAULT_STATE);

/* ---- P0-5A yardımcılar ---- */
// Deterministik, fixture-testable NON-crypto hash (FNV-1a 32-bit → 8 hex). Amaç: kaynak-blob eşleştirme.
function hashStr(s) {
  s = String(s);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8);
}
const isNonNegInt = n => Number.isInteger(n) && n >= 0;
const intOr0 = n => (Number.isInteger(n) && n >= 0 ? n : 0);
const clampMastery = m => Math.max(0, Math.min(4, Number.isInteger(m) ? m : 0));
const normTs = v => (v === null ? null : (Number.isFinite(v) && v >= 0 ? v : null));

/* Tip çözümleyici — global DATA'ya bağlı DEĞİL; enjekte edilir.
   Uygulamada makeTypeResolver(DATA) ile; testte stub ile. DATA yoksa DEFAULT_RESOLVER (yalnız kana Unicode). */
function isKanaCodepoint(ch) {
  if (typeof ch !== "string" || Array.from(ch).length !== 1) return false;
  const c = ch.codePointAt(0);
  return (c >= 0x3040 && c <= 0x309F) || (c >= 0x30A0 && c <= 0x30FF) || (c >= 0xFF66 && c <= 0xFF9D);
}
const DEFAULT_RESOLVER = {
  resolveType(key) { return isKanaCodepoint(key) ? "kana" : null; }, // DATA yoksa kanji/word ayırt edilemez → quarantine
  isKana: isKanaCodepoint
};
function makeTypeResolver(DATA) {
  const chars = (DATA && DATA.chars) || {};
  const kanaSet = new Set();
  const collect = arr => {
    if (!Array.isArray(arr)) return;
    arr.forEach(row => (Array.isArray(row) ? row : [row]).forEach(x => { if (x && x.character) kanaSet.add(x.character); }));
  };
  collect(DATA && DATA.hiragana); collect(DATA && DATA.katakana);
  const wordIds = new Set();
  const words = (DATA && DATA.words) || [];
  (Array.isArray(words) ? words : Object.values(words)).forEach(w => { if (w && w.id) wordIds.add(w.id); });
  return {
    resolveType(key) {
      if (chars[key]) return chars[key].type || "kanji";   // kanji | radical
      if (wordIds.has(key)) return "word";
      if (kanaSet.has(key)) return "kana";
      return null;                                          // çözülemez → quarantine
    },
    isKana(key) { return kanaSet.has(key); }
  };
}

/* Katı v2 srs kayıt doğrulaması. -2 / 1.5 / NaN / Infinity ELENİR. */
function validSrsRecord(r) {
  if (!isPlainObject(r)) return false;
  if (["kanji", "radical", "word", "kana"].indexOf(r.type) < 0) return false;
  if (!(Number.isInteger(r.mastery) && r.mastery >= 0 && r.mastery <= 4)) return false;
  if (!isNonNegInt(r.correct) || !isNonNegInt(r.wrong) || !isNonNegInt(r.seen) || !isNonNegInt(r.write)) return false;
  if (!(r.last === null || (Number.isFinite(r.last) && r.last >= 0))) return false;
  if (!(r.next === null || (Number.isFinite(r.next) && r.next >= 0))) return false;
  if (r.seen < r.correct + r.wrong) return false;          // invariant: seen ≥ correct+wrong
  return true;
}
function validateV2Shape(state) {
  if (!isPlainObject(state) || !isPlainObject(state.srs)) return false;
  const s = state.srs;
  for (const k of Object.keys(s)) { if (!validSrsRecord(s[k])) return false; }
  return true;
}

/* migrateV0ToV1 — idempotent, deterministik; yalnız bildiği alanı dönüştürür;
   bilinmeyen kullanıcı alanını SEBEPSİZ SİLMEZ; storage'a yazmaz. */
function migrateV0ToV1(s) {
  const out = { ...s };
  if (isPlainObject(out.settings) && !out.settings.audioMode)
    out.settings = { ...out.settings, audioMode: out.settings.audio === false ? "off" : "system" };
  if (!isPlainObject(out.onboarding)) {
    out.onboarding = isPlainObject(out.userProfile)
      ? { completed: true, step: 8, name: out.userProfile.name || "", motivation: "", level: out.userProfile.level || "", style: "", startedAt: out.userProfile.createdAt || null, completedAt: out.userProfile.createdAt || null }
      : { completed: false, step: 1, name: "", motivation: "", level: "", style: "", startedAt: null, completedAt: null };
  }
  out.schemaVersion = 1;
  return out;
}

/* migrateV1ToV2 — SAF: girdi nesnesini MUTATE ETMEZ, yeni nesne döndürür. resolver enjekte.
   srs normalize (type/seen/write) · type-null → quarantine (kayıpsız) · legacy boolean kana → SEED.
   Kana SRS DAVRANIŞI değişmez (bu yalnız veri şekli). */
function migrateV1ToV2(state, resolver) {
  resolver = resolver || DEFAULT_RESOLVER;
  const src = isPlainObject(state) ? state : {};
  const out = { ...src };
  out.schemaVersion = 2;

  const srcSrs = isPlainObject(src.srs) ? src.srs : {};
  const newSrs = {};
  const quarantine = isPlainObject(src._migrationQuarantine) ? { ...src._migrationQuarantine } : {};
  const qSrs = isPlainObject(quarantine.srs) ? { ...quarantine.srs } : {};

  for (const key of Object.keys(srcSrs)) {
    const rec = srcSrs[key];
    if (!isPlainObject(rec)) { qSrs[key] = rec; continue; }       // bozuk kayıt → quarantine
    const type = resolver.resolveType(key);
    if (type == null) { qSrs[key] = rec; continue; }             // çözülemez tip → quarantine
    const correct = intOr0(rec.correct), wrong = intOr0(rec.wrong), mastery = clampMastery(rec.mastery);
    const cw = correct + wrong;
    let seen;
    if (isNonNegInt(rec.seen)) seen = Math.max(rec.seen, cw);    // existing valid → max (invariant korunur)
    else if (cw > 0) seen = cw;
    else if (mastery > 0) seen = 1;                              // pozitif mastery eski sistemden kanıt
    else seen = 0;                                               // hiç görülmemiş → 0 (sahte seen YOK)
    const write = isNonNegInt(rec.write) ? rec.write : 0;
    newSrs[key] = { type, correct, wrong, mastery, seen, write, last: normTs(rec.last), next: normTs(rec.next) };
  }

  // legacy boolean-only kana (kana[char]===true, srs kaydı YOK) → SEED mastery 1, last/next null
  const kanaMap = isPlainObject(src.kana) ? src.kana : {};
  for (const ch of Object.keys(kanaMap)) {
    if (kanaMap[ch] === true && !newSrs[ch] && !qSrs[ch] && resolver.isKana(ch)) {
      newSrs[ch] = { type: "kana", correct: 0, wrong: 0, mastery: 1, seen: 1, write: 0, last: null, next: null };
    }
  }

  out.srs = newSrs;
  if (Object.keys(qSrs).length) { quarantine.srs = qSrs; out._migrationQuarantine = quarantine; }
  // legacy aynalar (kana/learned/status) …src ile korunur (okuma-kaynağı P0-5B'de değişir; burada değil)
  return out;
}

function migrate(parsed, resolver) {
  const ver = (typeof parsed.schemaVersion === "number") ? parsed.schemaVersion : 0;
  let s = parsed;
  if (ver < 1) s = migrateV0ToV1(s);
  if (ver < 2) s = migrateV1ToV2(s, resolver || DEFAULT_RESOLVER);
  return s;
}

/* safeMerge — KÖR deep-merge DEĞİL: yalnız bilinen iç nesneler kontrollü tamamlanır,
   yanlış tipler (settings:null, srs:"x", userHints:[]) defaults'a düşürülür.
   Bilinmeyen ekstra alanlar KORUNUR (…parsed). */
function safeMerge(parsed) {
  const d = DEFAULT_STATE;
  const obj = (v) => isPlainObject(v) ? v : null;
  const arr = (v, def) => Array.isArray(v) ? v : def;
  return {
    ...d, ...parsed,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...d.settings, ...(obj(parsed.settings) || {}) },
    userProfile: parsed.userProfile === null ? null : (obj(parsed.userProfile) ? { ...parsed.userProfile } : d.userProfile),
    onboarding: obj(parsed.onboarding) || d.onboarding,
    learned: obj(parsed.learned) || {},
    status: obj(parsed.status) || {},
    kana: obj(parsed.kana) || {},
    srs: obj(parsed.srs) || {},
    games: obj(parsed.games) || {},
    discoveredRules: obj(parsed.discoveredRules) || {},
    cipherLearned: obj(parsed.cipherLearned) || {},
    userHints: obj(parsed.userHints) || {},
    lastSeenKatakana: arr(parsed.lastSeenKatakana, [])
  };
}

/* hydrate — ham string → {state, recoveryRequired, unsupported?}. Bozuk/eksik → recovery (ham DOKUNULMAZ).
   Forward-schema guard: storedVer > SCHEMA_VERSION → migrate/safeMerge YOK, state DÖNÜŞTÜRÜLMEZ (unsupported). */
function hydrate(raw, resolver) {
  resolver = resolver || DEFAULT_RESOLVER;
  if (raw == null) return { state: freshState(), recoveryRequired: false };
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return { state: freshState(), recoveryRequired: true }; }
  if (!isPlainObject(parsed)) return { state: freshState(), recoveryRequired: true };
  const storedVer = (typeof parsed.schemaVersion === "number") ? parsed.schemaVersion : 0;
  if (storedVer > SCHEMA_VERSION) {
    // İleri sürüm: veriyi DEĞİŞTİRME, downgrade etme. Read-only sunulacak.
    return { state: parsed, recoveryRequired: false, unsupported: true };
  }
  const merged = safeMerge(migrate(parsed, resolver));
  // kritik alan + katı v2-şekil doğrulaması (bump ÖNCESİ)
  const ok = isPlainObject(merged.learned) && isPlainObject(merged.srs) && isPlainObject(merged.userHints) && validateV2Shape(merged);
  if (!ok) return { state: freshState(), recoveryRequired: true };
  return { state: merged, recoveryRequired: false };
}

/* createStorage — localStorage sarmalayıcı. Recovery/unsupported/backup-fail → read-only; kana_state ASLA ezilmez.
   İki aşamalı commit: (1) hash'li doğrulanmış backup (2) atomik canonical v2 yazımı. */
function createStorage(ls, opts = {}) {
  const KEY = "kana_state";
  const BAK = "kana_state.bak.v1";
  const now = opts.now || (() => Date.now());
  const resolver = opts.resolver || DEFAULT_RESOLVER;
  let recoveryMode = false;
  let readOnly = false;

  const tryGet = k => { try { return ls.getItem(k); } catch (e) { return null; } };
  const trySet = (k, v) => { try { ls.setItem(k, v); return true; } catch (e) { return false; } };
  const versionOf = raw => { try { const p = JSON.parse(raw); return (p && typeof p.schemaVersion === "number") ? p.schemaVersion : 0; } catch (e) { return 0; } };

  // Kaynak-blob'a bağlı, geri-okunup doğrulanan backup. true = güncel backup kaynak blob ile eşleşiyor.
  function ensureBackup(raw) {
    const sourceHash = hashStr(raw);
    let cur = null; try { cur = JSON.parse(tryGet(BAK)); } catch (e) {}
    if (isPlainObject(cur) && cur.sourceHash === sourceHash && cur.raw === raw) return true; // zaten eşleşiyor
    if (!trySet(BAK, JSON.stringify({ sourceHash, createdAt: now(), raw }))) return false;   // backup yazımı başarısız
    let rb = null; try { rb = JSON.parse(tryGet(BAK)); } catch (e) {}                          // geri-oku + doğrula
    return !!(isPlainObject(rb) && rb.sourceHash === sourceHash && rb.raw === raw);
  }

  return {
    read() {
      const raw = tryGet(KEY);
      const h = hydrate(raw, resolver);

      // Forward-schema: byte-değişmez, HİÇBİR yazma yok, read-only.
      if (h.unsupported) {
        readOnly = true;
        h.state.storageReadOnly = true; h.state.storageUnsupported = true;
        return { state: h.state, recoveryRequired: false, readOnly: true, unsupported: true };
      }
      // Bozuk/eksik: recovery → read-only; ham KOPYALANIR, orijinal SİLİNMEZ.
      if (h.recoveryRequired) {
        recoveryMode = true; readOnly = true;
        if (raw != null) trySet(KEY + "_recovery_" + now(), raw);
        h.state.storageRecoveryRequired = true; h.state.storageReadOnly = true;
        return { state: h.state, recoveryRequired: true, readOnly: true };
      }
      // Migration commit — yalnız stored sürüm < güncel iken; backup-gate.
      if (raw != null && versionOf(raw) < SCHEMA_VERSION) {
        if (!ensureBackup(raw)) {                         // BACKUP ZORUNLU KAPI
          readOnly = true; h.state.storageReadOnly = true; h.state.storageBackupFailed = true;
          return { state: h.state, recoveryRequired: false, readOnly: true, backupFailed: true };
        }
        h.state._migratedFrom = hashStr(raw);
        if (!trySet(KEY, JSON.stringify(h.state))) {      // atomik canonical v2 yazımı
          readOnly = true; h.state.storageReadOnly = true; h.state.storageCommitFailed = true;
          return { state: h.state, recoveryRequired: false, readOnly: true, commitFailed: true };
        }
      }
      return { state: h.state, recoveryRequired: false, readOnly: false };
    },
    // MERKEZİ read-only kilit: srsRecord/reset/onboarding/userHint/oyun — hepsi buradan geçer.
    save(state) {
      if (readOnly || recoveryMode) {
        try { if (typeof console !== "undefined") console.warn("[storage] save reddedildi — " + (recoveryMode ? "recovery" : "read-only") + " (kana_state korunuyor)"); } catch (e) {}
        return { ok: false, reason: recoveryMode ? "storage-recovery" : "read-only" };
      }
      state.schemaVersion = SCHEMA_VERSION;
      if (trySet(KEY, JSON.stringify(state))) return { ok: true, reason: null };
      try { if (typeof console !== "undefined") console.warn("[storage] save başarısız — yazma hatası (eski kayıt yerinde)"); } catch (e) {}
      return { ok: false, reason: "write-error" };
    },
    /* Tam profil sıfırlama — MERKEZİ, sonuç döndürür. Handler doğrudan localStorage'a DOKUNMAZ.
       KİLİTLİ invariant: readOnly||recoveryMode → canonical'a set/remove YOK (byte-değişmez).
       removeItem KULLANILMAZ: temiz v2 state doğrulanıp tek atomik setItem ile yazılır; yazma başarısızsa eski kayıt YERİNDE.
       Politika (full reset = temiz sayfa): srs/kana/learned/userHints/_migrationQuarantine/_migratedFrom hepsi sıfırlanır;
       .bak.v1 ve recovery kopyaları best-effort temizlenir. (Progress-only reset AYRI: userHints korur.) */
    resetCanonical() {
      if (readOnly || recoveryMode) {
        try { if (typeof console !== "undefined") console.warn("[storage] full reset reddedildi — " + (recoveryMode ? "recovery" : "read-only") + " (kana_state korunuyor)"); } catch (e) {}
        return { ok: false, reason: recoveryMode ? "storage-recovery" : "read-only" };
      }
      const clean = freshState(); // v2 fresh (DEFAULT_STATE): srs/kana/learned/userHints boş; quarantine/_migratedFrom yok
      clean.schemaVersion = SCHEMA_VERSION;
      const okShape = isPlainObject(clean.learned) && isPlainObject(clean.srs) && isPlainObject(clean.userHints) && validateV2Shape(clean);
      if (!okShape) return { ok: false, reason: "validate-error" };           // teoride olmaz; savunma
      if (!trySet(KEY, JSON.stringify(clean))) return { ok: false, reason: "write-error" }; // eski canonical YERİNDE
      // best-effort temizlik (başarısızlığı reset'i bozmaz)
      try { ls.removeItem(BAK); } catch (e) {}
      try {
        if (typeof ls.length === "number" && typeof ls.key === "function") {
          const rm = [];
          for (let i = 0; i < ls.length; i++) { const k = ls.key(i); if (k && k.indexOf(KEY + "_recovery_") === 0) rm.push(k); }
          rm.forEach(k => { try { ls.removeItem(k); } catch (e) {} });
        }
      } catch (e) {}
      return { ok: true, reason: null, state: clean };
    },
    get recoveryMode() { return recoveryMode; },
    get readOnly() { return readOnly; }
  };
}

if (typeof module !== "undefined") module.exports = {
  SCHEMA_VERSION, DEFAULT_STATE, isPlainObject, freshState,
  hashStr, isKanaCodepoint, DEFAULT_RESOLVER, makeTypeResolver,
  validSrsRecord, validateV2Shape,
  migrateV0ToV1, migrateV1ToV2, migrate, safeMerge, hydrate, createStorage
};
