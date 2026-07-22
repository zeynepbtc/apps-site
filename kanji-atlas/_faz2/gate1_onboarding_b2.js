/* GATE 1 · Onboarding B2 — SAF mantık fixture'ı (non-shipping).
   ADIM 7 mantığını shipped index.html'den ÇIKARIR (kaynak = gerçek), node'da test eder.
   Kapsam: normalizeOnboarding (migration + invariant) · startDescriptorFor · competency eşleme ·
   t() fallback · zaman damgası · rollback-compat (legacy completed aynası) · marker idempotent · userProfile koruma. */
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

const START = "const I18N = {";
const END = 'if(typeof window!=="undefined") window.__ob';
const s = html.indexOf(START), e = html.indexOf(END, s);
if (s < 0 || e < 0) { console.error("EXTRACT FAIL (markers not found)"); process.exit(1); }
const src = html.slice(s, e);

// Harness globalleri — uygulamayla uyumlu isPlainObject; state/save enjekte edilir.
const isPlainObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
const factory = new Function("isPlainObject", "state", "save", src +
  "\nreturn { I18N, t, OB_BANDS, OB_STAGES, VALID_START_KEYS, START_DESCRIPTORS, startDescriptorFor, startKeyForCompetency, competencyNeedsIntro, competencyToLegacyLevel, competencyShowAdvanced, normalizeOnboarding, completeOnboarding, skipOnboarding, markFirstMeaningfulLearningAction, hasMeaningfulLearning };");

const state = { settings: {}, srs: {}, userProfile: null, onboarding: null };
let saveCount = 0;
const save = () => { saveCount++; return { ok: true }; };
const API = factory(isPlainObject, state, save);

let pass = 0, fail = 0; const fails = [];
const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + " :: got " + JSON.stringify(a) + " want " + JSON.stringify(b));

/* 1) descriptor + competency eşleme */
eq(API.startDescriptorFor("kana-a"), { route: "kanadetail", param: "あ", labelKey: "home.rec.kana.label", reasonKey: "home.rec.kana.reason", ctaKey: "onboarding.final.band0.cta" }, "descriptor kana-a");
ok(API.startDescriptorFor("nope") === null, "descriptor invalid → null");
eq([0, 1, 2, 3].map(API.startKeyForCompetency), ["kana-a", "kana-home", "kanji-ki", "atlas-map"], "startKeyForCompetency");
eq([0, 1, 2, 3].map(API.competencyToLegacyLevel), ["beginner", "a_few", "hiragana", "hiragana"], "competency→legacy level (explorer YOK)");
eq([0, 1, 2, 3].map(API.competencyShowAdvanced), [false, false, true, true], "showAdvanced 0/1 false 2/3 true");
eq([0, 1, 2, 3].map(API.competencyNeedsIntro), [true, true, false, false], "intro yalnız 0/1");

/* 2) t() fallback zinciri */
ok(API.t("onboarding.actions.continue") === "Devam", "t existing tr");
ok(API.t("onboarding.actions.continue", "de") === "Devam", "t unsupported locale → tr");
ok(API.t("yok.olan.anahtar") === "yok.olan.anahtar", "t missing key → key adı (çökme yok)");
state.settings.locale = "xx"; ok(API.t("onboarding.actions.start") === "Başlayalım", "bozuk locale → tr"); delete state.settings.locale;

/* 3) normalizeOnboarding — migration */
let n = API.normalizeOnboarding(null);
ok(n.status === "in-progress" && n.stage === "welcome" && n.competency === null && n.startKey === null && n.completed === false, "normalize null → fresh");
n = API.normalizeOnboarding({ completed: true, step: 8, level: "hiragana", completedAt: "2026-01-01T00:00:00.000Z" });
ok(n.status === "completed" && n.competency === null && n.startKey === null && n.completed === true && n.completedAt === "2026-01-01T00:00:00.000Z", "legacy completed → completed, competency TÜRETİLMEZ, completedAt korunur");
n = API.normalizeOnboarding({ completed: false, step: 3, level: "beginner" });
ok(n.status === "in-progress" && n.stage === "welcome" && n.competency === null, "legacy incomplete → in-progress/welcome");

/* 4) normalizeOnboarding — invariant + güvenli düşüş */
n = API.normalizeOnboarding({ status: "completed", stage: "final", competency: 2, startKey: "kanji-ki" });
ok(n.startKey === "kanji-ki" && n.stage === "final" && n.completed === true, "completed comp2 → kanji-ki");
n = API.normalizeOnboarding({ status: "completed", competency: 0, startKey: "atlas-map" });
ok(n.startKey === "kana-a", "completed uyumsuz startKey → kanonik eşleme (kana-a)");
n = API.normalizeOnboarding({ status: "completed", competency: null, startKey: "kana-a" });
ok(n.startKey === null, "completed competency null → startKey null (sahte rota yok)");
n = API.normalizeOnboarding({ status: "in-progress", stage: "writing-intro", competency: 3 });
ok(n.stage === "final" && n.startKey === null, "writing-intro+comp3 → final (intro yalnız 0/1), startKey null");
n = API.normalizeOnboarding({ status: "in-progress", stage: "final", competency: null });
ok(n.stage === "competency", "final+comp null → competency");
n = API.normalizeOnboarding({ status: "skipped", competency: 2, startKey: "kanji-ki" });
ok(n.status === "skipped" && n.competency === null && n.startKey === null && n.completed === true, "skipped → competency/startKey null; legacy completed=true");
n = API.normalizeOnboarding({ status: "completed", stage: "zzz-bozuk", competency: 1, startKey: "kana-home" });
ok(n.stage === "final", "bozuk stage completed → final");
n = API.normalizeOnboarding({ status: "in-progress", stage: "zzz-bozuk", competency: null });
ok(n.stage === "welcome", "bozuk stage in-progress → welcome güvenli düşüş");

/* 5) completeOnboarding — zaman damgası + rollback aynası + userProfile koruma */
state.userProfile = { name: "Zeynep", createdAt: "2025-01-01T00:00:00.000Z", showAdvanced: true, motivation: "travel" };
state.onboarding = { status: "in-progress", stage: "final", competency: 2, startKey: null };
API.completeOnboarding();
ok(state.onboarding.status === "completed" && state.onboarding.completed === true, "complete → completed + legacy ayna true");
ok(state.onboarding.startKey === "kanji-ki", "complete → startKey kanji-ki");
ok(typeof state.onboarding.completedAt === "string" && state.onboarding.skippedAt === null, "complete → completedAt set, skippedAt null");
ok(state.userProfile.name === "Zeynep", "complete → userProfile.name KORUNUR (ezilmez)");
ok(state.userProfile.level === "hiragana" && state.userProfile.showAdvanced === true, "complete → level/showAdvanced competency'den");
ok(state.userProfile.createdAt === "2025-01-01T00:00:00.000Z" && state.userProfile.motivation === "travel", "complete → createdAt + metadata korunur");

/* 6) skipOnboarding — sahte completedAt YOK */
state.onboarding = { status: "in-progress", stage: "competency", competency: 1 };
API.skipOnboarding();
ok(state.onboarding.status === "skipped" && state.onboarding.completed === true, "skip → skipped + legacy true");
ok(state.onboarding.completedAt === null && typeof state.onboarding.skippedAt === "string", "skip → completedAt YOK, skippedAt set");
ok(state.onboarding.competency === null && state.onboarding.startKey === null, "skip → competency/startKey temiz");

/* 7) marker idempotent + hasMeaningfulLearning */
state.onboarding = { status: "completed", competency: 0, startKey: "kana-a", firstMeaningfulActionAt: null };
state.srs = {};
ok(API.hasMeaningfulLearning() === false, "hasMeaningful false (no correct, no damga)");
API.markFirstMeaningfulLearningAction("known-kana");
const t1 = state.onboarding.firstMeaningfulActionAt;
ok(typeof t1 === "string", "marker → firstMeaningfulActionAt set");
API.markFirstMeaningfulLearningAction("known-kana");
ok(state.onboarding.firstMeaningfulActionAt === t1, "marker idempotent (ikinci çağrı değiştirmez)");
ok(API.hasMeaningfulLearning() === true, "hasMeaningful true (damga sonrası)");
state.onboarding.firstMeaningfulActionAt = null; state.srs = { "ki": { correct: 0, wrong: 2 } };
ok(API.hasMeaningfulLearning() === false, "yanlış-only (correct=0) → anlamlı DEĞİL");
state.srs = { "ki": { correct: 1, wrong: 0 } };
ok(API.hasMeaningfulLearning() === true, "correct>0 → anlamlı");

/* 8) rollback-compat: yeni state'in legacy `completed` alanı eski runtime için doğru */
n = API.normalizeOnboarding({ status: "in-progress", stage: "competency", competency: null });
ok(n.completed === false, "rollback ayna: in-progress → completed=false");
n = API.normalizeOnboarding({ status: "completed", competency: 3, startKey: "atlas-map" });
ok(n.completed === true, "rollback ayna: completed → completed=true");

console.log("GATE 1 · onboarding-b2:  pass=" + pass + "  fail=" + fail);
if (fail) { console.log("FAILURES:\n - " + fails.join("\n - ")); process.exit(1); }
console.log("ALL GREEN (" + pass + " assertions)");
