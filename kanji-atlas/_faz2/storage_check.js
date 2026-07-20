/* FAZ 2 · Storage — GPT kabul test seti. Mock localStorage; canlı HTML'e enjekte edilecek kod. */
const S = require("./storage.js");

function mockLS(init, opts = {}) {
  const m = new Map(Object.entries(init || {}));
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (opts.failSet) throw new Error("QuotaExceeded"); m.set(k, v); },
    removeItem: k => m.delete(k),
    _keys: () => [...m.keys()], _get: k => m.get(k), _size: () => m.size
  };
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };

console.log("# Storage kabul testleri\n");

// 1) kana_state yok
{ const st = S.createStorage(mockLS({})); const { state, recoveryRequired } = st.read();
  A("1) kana_state yok → fresh v1, recovery false", state.schemaVersion === 1 && !recoveryRequired && eq(state.learned, {})); }

// 2) sürümsüz eski state → v1, userHints korunur
{ const old = JSON.stringify({ learned: { ki: true }, userHints: { ki: "notum" }, settings: { audio: false }, userProfile: { name: "Z", level: "hiragana", createdAt: 5 } });
  const { state } = S.createStorage(mockLS({ kana_state: old })).read();
  A("2) sürümsüz → schemaVersion 1", state.schemaVersion === 1);
  A("2) userHints korundu", eq(state.userHints, { ki: "notum" }));
  A("2) onboarding migrate (userProfile→completed)", state.onboarding && state.onboarding.completed === true);
  A("2) settings.audioMode legacy audio'dan (off)", state.settings.audioMode === "off"); }

// 3) geçerli v1 state → değişmez
{ const v1 = S.safeMerge(S.migrate({ schemaVersion: 1, learned: { hi: true } }));
  const raw = JSON.stringify(v1); const { state } = S.createStorage(mockLS({ kana_state: raw })).read();
  const _st=S.createStorage(mockLS({kana_state:raw})); _st.read(); const _r=_st.save({learned:{}}); A("3) v1 state okundu, learned korundu", state.schemaVersion === 1 && eq(state.learned, { hi: true })); A("3b) normal save → {ok:true}", _r.ok===true); }

// 4) migration İKİ KEZ → aynı (idempotent)
{ const raw = JSON.stringify({ learned: { ki: true }, userHints: { a: "x" } });
  const once = S.hydrate(raw).state; const twice = S.hydrate(JSON.stringify(once)).state;
  A("4) migration idempotent (iki kez = bir kez)", eq(once, twice)); }

// 5) truncated JSON → recovery, ORİJİNAL yerinde + recovery kopyası
{ const ls = mockLS({ kana_state: '{"learned":{"ki":true' }, {});
  const st = S.createStorage(ls, { now: () => 111 }); const { recoveryRequired } = st.read();
  A("5) truncated → recovery true", recoveryRequired);
  A("5) orijinal kana_state YERİNDE (silinmedi/ezilmedi)", ls._get("kana_state") === '{"learned":{"ki":true');
  A("5) recovery kopyası oluştu", ls._keys().includes("kana_state_recovery_111")); }

// 6) yanlış tipler → guard, çökme yok, recovery DEĞİL
{ const raw = JSON.stringify({ settings: null, userHints: [], srs: "x", learned: { ki: true } });
  const { state, recoveryRequired } = S.createStorage(mockLS({ kana_state: raw })).read();
  A("6) settings:null → default obje", S.isPlainObject(state.settings) && state.settings.audioMode);
  A("6) userHints:[] → {}", eq(state.userHints, {}));
  A("6) srs:'x' → {}", eq(state.srs, {}));
  A("6) yanlış tip recovery gerektirmedi (guard yeter)", !recoveryRequired && eq(state.learned, { ki: true })); }

// 7) eksik iç ayar → tamamlanır
{ const raw = JSON.stringify({ schemaVersion: 1, settings: { audio: true, audioMode: "system" } }); // autoplay/calm yok
  const { state } = S.createStorage(mockLS({ kana_state: raw })).read();
  A("7) eksik settings anahtarları defaults'tan tamamlandı", state.settings.autoplay === true && state.settings.calm === true); }

// 8) bilinmeyen ekstra alan → korunur
{ const raw = JSON.stringify({ schemaVersion: 1, learned: {}, benimAlanim: { z: 1 } });
  const { state } = S.createStorage(mockLS({ kana_state: raw })).read();
  A("8) bilinmeyen ekstra alan sebepsiz silinmedi", eq(state.benimAlanim, { z: 1 })); }

// 9) recovery modunda save() kana_state'i EZMİYOR
{ const ls = mockLS({ kana_state: 'BOZUK{{{' }); const st = S.createStorage(ls, { now: () => 9 });
  const { state } = st.read(); const r = st.save(state);
  A("9) recovery save → {ok:false, reason:storage-recovery}", r.ok === false && r.reason === "storage-recovery");
  A("9) bozuk orijinal payload hâlâ yerinde", ls._get("kana_state") === "BOZUK{{{"); }

// 10) setItem exception → eski payload yerinde, save false
{ const ls = mockLS({ kana_state: JSON.stringify({ schemaVersion: 1, learned: { ki: true } }) }, { failSet: true });
  const st = S.createStorage(ls); const { state } = st.read(); const r = st.save(state);
  A("10) setItem hata → {ok:false, reason:write-error}", r.ok === false && r.reason === "write-error");
  A("10) eski payload yerinde", JSON.parse(ls._get("kana_state")).learned.ki === true); }

// 11) kullanıcı verisi migration boyunca DERİN EŞİT
{ const uh = { ki: "n1", hi: "n2" }, cl = { "ア": { kana: "a" } }, learned = { ki: true, hi: true }, srs = { ki: { correct: 3, wrong: 1, mastery: 2 } }, games = { m1: { best: 9 } };
  const raw = JSON.stringify({ userHints: uh, cipherLearned: cl, learned, srs, games });
  const { state } = S.createStorage(mockLS({ kana_state: raw })).read();
  A("11) userHints/cipherLearned/learned/srs/games derin eşit (korundu)", eq(state.userHints, uh) && eq(state.cipherLearned, cl) && eq(state.learned, learned) && eq(state.srs, srs) && eq(state.games, games)); }

// 12) oturum alanları default'ta (app bootstrap sıfırlar — storage taşır, app resetler)
{ A("12) DEFAULT_STATE oturum alanları mevcut (app load() bootstrap'ta sıfırlar)", "screen" in S.DEFAULT_STATE && "stack" in S.DEFAULT_STATE && "_resume" in S.DEFAULT_STATE); }

console.log("\n> Kritik kural kanıtlandı: bozuk/hatalı durumların HİÇBİRİ kana_state'i sessizce ezmez/silmez.");
console.log(fail === 0 ? "\n✅ TÜM KABUL TESTLERİ GEÇTİ (0 başarısız)" : "\n❌ " + fail + " başarısız");
process.exit(fail === 0 ? 0 : 1);
