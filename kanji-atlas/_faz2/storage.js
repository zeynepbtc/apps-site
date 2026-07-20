/* FAZ 2 · Storage/Migration — SAF mantık (localStorage'a doğrudan bağlı DEĞİL, test edilebilir).
   İlke: migration kullanıcı verisini DÖNÜŞTÜRÜR, sessizce SIFIRLAMAZ.
   Kapsam: R1 (bozuk JSON'da sessiz sıfırlama YOK) · R2 (schemaVersion) · R3 (kontrollü nested-default).
   Export/import ve her-save yedek KAPSAM DIŞI (sonraki storage işi). */

const SCHEMA_VERSION = 1;

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
function migrate(parsed) {
  const ver = (typeof parsed.schemaVersion === "number") ? parsed.schemaVersion : 0;
  let s = parsed;
  if (ver < 1) s = migrateV0ToV1(s);
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

/* hydrate — ham string → {state, recoveryRequired}. Bozuk/eksik → recovery (ham DOKUNULMAZ). */
function hydrate(raw) {
  if (raw == null) return { state: freshState(), recoveryRequired: false };
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return { state: freshState(), recoveryRequired: true }; }
  if (!isPlainObject(parsed)) return { state: freshState(), recoveryRequired: true };
  const merged = safeMerge(migrate(parsed));
  // kritik alan doğrulaması
  const ok = isPlainObject(merged.learned) && isPlainObject(merged.srs) && isPlainObject(merged.userHints);
  if (!ok) return { state: freshState(), recoveryRequired: true };
  return { state: merged, recoveryRequired: false };
}

/* createStorage — localStorage sarmalayıcı. Recovery modunda kana_state ASLA ezilmez. */
function createStorage(ls, opts = {}) {
  const KEY = "kana_state";
  const now = opts.now || (() => Date.now());
  let recoveryMode = false;
  return {
    read() {
      let raw = null; try { raw = ls.getItem(KEY); } catch (e) {}
      const { state, recoveryRequired } = hydrate(raw);
      if (recoveryRequired) {
        recoveryMode = true;
        try { if (raw != null) ls.setItem(KEY + "_recovery_" + now(), raw); } catch (e) {} // KOPYALA, orijinali silME
        state.storageRecoveryRequired = true;
      }
      return { state, recoveryRequired };
    },
    save(state) {
      // GÖRÜNÜR SÖZLEŞME: {ok, reason}. Sessiz başarısızlık yok.
      if (recoveryMode) {
        try { if (typeof console !== "undefined") console.warn("[storage] save reddedildi — recovery modu (kana_state korunuyor)"); } catch (e) {}
        return { ok: false, reason: "storage-recovery" };   // recovery: kana_state ezilmez
      }
      try { state.schemaVersion = SCHEMA_VERSION; ls.setItem(KEY, JSON.stringify(state)); return { ok: true, reason: null }; }
      catch (e) {
        try { if (typeof console !== "undefined") console.warn("[storage] save başarısız — yazma hatası (eski kayıt yerinde)"); } catch (_) {}
        return { ok: false, reason: "write-error" };         // setItem hata → eski payload yerinde
      }
    },
    get recoveryMode() { return recoveryMode; }
  };
}

if (typeof module !== "undefined") module.exports = { SCHEMA_VERSION, DEFAULT_STATE, isPlainObject, freshState, migrateV0ToV1, migrate, safeMerge, hydrate, createStorage };
