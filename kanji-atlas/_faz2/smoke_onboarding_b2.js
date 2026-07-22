/* GATE 2 · Onboarding B2 — TARAYICI smoke (gerçek runtime + state + rota + reload).
   DOM-metin aramaz; window.JYA.state / rota / localStorage-migration / gerçek handler tıklamaları üzerinden doğrular.
   Sunucu: python http.server; URL env SMOKE_URL. */
const { chromium } = require("playwright");
const URL = process.env.SMOKE_URL || "http://127.0.0.1:8899/index.html";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  const perr = [];
  page.on("pageerror", e => perr.push(e.message));

  let pass = 0, fail = 0; const fails = [];
  const ok = (c, m) => { if (c) pass++; else { fail++; fails.push(m); } };

  const ob = () => page.evaluate(() => window.JYA.state.onboarding);
  const scr = () => page.evaluate(() => ({ screen: window.JYA.state.screen, param: window.JYA.state.param }));
  const stage = async () => (await ob()).stage;
  const click = async (sel) => { await page.click(sel, { timeout: 8000 }); await page.waitForTimeout(80); };
  const evalr = (fn, arg) => page.evaluate(fn, arg);
  async function freshLoad() {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
  }
  async function loadBlob(blob) {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
    await page.evaluate(b => localStorage.setItem("kana_state", b), typeof blob === "string" ? blob : JSON.stringify(blob));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(150);
  }
  const V2 = (onb, extra) => Object.assign({ schemaVersion: 2, onboarding: onb, srs: {}, learned: {}, status: {}, kana: {}, userHints: {}, games: {}, settings: {}, cipherLearned: {}, discoveredRules: {}, lastSeenKatakana: [] }, extra || {});

  // ---- 1) Fresh install → Karşılama ----
  await freshLoad();
  let s = await scr(), o = await ob();
  ok(s.screen === "onboarding" && o.stage === "welcome" && o.status === "in-progress", "1 fresh → onboarding/welcome/in-progress");
  ok(await page.locator(".ob-root .ob-title").first().isVisible(), "1 Karşılama başlığı görünür");

  // ---- 2..5) Band akışları (gerçek tıklama) ----
  async function toCompetency() { await freshLoad(); await click('[data-act="ob-continue"]'); }
  async function pickBand(c) { await click('[data-act="ob-competency"][data-comp="' + c + '"]'); }

  // Band 0
  await toCompetency(); ok((await stage()) === "competency", "2 welcome→competency");
  await pickBand(0); o = await ob(); ok(o.stage === "writing-intro" && o.introShown === true, "2 band0 → writing-intro + introShown");
  ok((await evalr(() => window.JYA.state.seenWritingSystem)) !== true, "11 introShown ama tam ders (seenWritingSystem) TRUE olmaz");
  await click('[data-act="ob-continue"]'); ok((await stage()) === "final", "2 band0 → final");
  await click('[data-act="ob-final-start"]'); o = await ob(); s = await scr();
  ok(o.status === "completed" && o.startKey === "kana-a", "2 band0 completed/kana-a");
  ok(s.screen === "kanadetail" && s.param === "あ", "2 band0 rota kanadetail/あ");

  // Band 1
  await toCompetency(); await pickBand(1); o = await ob(); ok(o.stage === "writing-intro", "3 band1 → writing-intro");
  await click('[data-act="ob-continue"]'); await click('[data-act="ob-final-start"]'); o = await ob(); s = await scr();
  ok(o.startKey === "kana-home" && s.screen === "kana", "3 band1 → kana-home / rota kana (あ detay DEĞİL)");

  // Band 2 (intro atlanır)
  await toCompetency(); await pickBand(2); o = await ob(); ok(o.stage === "final", "4 band2 → final (intro ATLANIR)");
  await click('[data-act="ob-final-start"]'); o = await ob(); s = await scr();
  ok(o.startKey === "kanji-ki" && s.screen === "detail" && s.param === "ki", "4 band2 → kanji-ki / rota detail/ki");

  // Band 3 (intro atlanır)
  await toCompetency(); await pickBand(3); o = await ob(); ok(o.stage === "final", "5 band3 → final (intro ATLANIR)");
  await click('[data-act="ob-final-start"]'); o = await ob(); s = await scr();
  ok(o.startKey === "atlas-map" && s.screen === "map", "5 band3 → atlas-map / rota map");

  // ---- 6) Erken "Ana sayfaya geç" → skipped (3 ekranda) ----
  // welcome
  await freshLoad(); await click('[data-act="ob-home"]'); o = await ob(); s = await scr();
  ok(o.status === "skipped" && o.competency === null && o.startKey === null && o.completedAt === null && s.screen === "home", "6a welcome skip → skipped/temiz/home");
  // competency
  await toCompetency(); await click('[data-act="ob-home"]'); o = await ob();
  ok(o.status === "skipped" && o.competency === null && o.startKey === null, "6b competency skip → skipped/temiz");
  // writing-intro (band seçilmiş olsa bile temizlenir)
  await toCompetency(); await pickBand(0); await click('[data-act="ob-home"]'); o = await ob();
  ok(o.status === "skipped" && o.competency === null && o.startKey === null, "6c writing-intro skip → competency/startKey TEMİZ");

  // ---- 7) Final ikincil "Ana sayfaya git" → completed (skip DEĞİL) ----
  await toCompetency(); await pickBand(2); await click('[data-act="ob-home"]'); o = await ob(); s = await scr();
  ok(o.status === "completed" && o.startKey === "kanji-ki" && s.screen === "home", "7 final ikincil → COMPLETED (skip değil) + home");

  // ---- 8) Geri dalları ----
  await toCompetency(); await pickBand(0); // writing-intro
  await click('[data-act="ob-back"]'); ok((await stage()) === "competency", "8a writing-intro→geri→competency");
  await click('[data-act="ob-back"]'); ok((await stage()) === "welcome", "8b competency→geri→welcome");
  await toCompetency(); await pickBand(0); await click('[data-act="ob-continue"]'); // final band0
  await click('[data-act="ob-back"]'); ok((await stage()) === "writing-intro", "8c final(band0)→geri→writing-intro");
  await toCompetency(); await pickBand(2); // final band2
  await click('[data-act="ob-back"]'); ok((await stage()) === "competency", "8d final(band2)→geri→competency (intro yok)");

  // ---- 9) Reload-resume ----
  await toCompetency(); await pickBand(0); // writing-intro
  await page.reload({ waitUntil: "domcontentloaded" }); await page.waitForTimeout(150);
  o = await ob(); s = await scr();
  ok(s.screen === "onboarding" && o.stage === "writing-intro", "9 reload → writing-intro'dan sürer");

  // ---- 10) Final'den geri → competency değiştir → dal yeniden hesaplanır ----
  await toCompetency(); await pickBand(0); await click('[data-act="ob-continue"]'); // final band0
  await click('[data-act="ob-back"]'); // → writing-intro
  await click('[data-act="ob-back"]'); // → competency
  await pickBand(2); ok((await stage()) === "final", "10 competency 0→2 değişince dal yeniden hesaplanır (final, intro yok)");

  // ---- 12) İlk anlamlı eylem marker yazar + Home şeridi boşluksuz gizlenir (gerçek runtime fonksiyonları) ----
  // Band 0 tamamla → Home şeridi görünür (marker yok)
  await toCompetency(); await pickBand(0); await click('[data-act="ob-continue"]'); await click('[data-act="ob-final-start"]');
  await evalr(() => window.JYA.go("home")); await page.waitForTimeout(70);
  ok((await page.locator(".rec-hint").count()) === 1, "12a completed+startKey+marker yok → Home şeridi GÖRÜNÜR");
  // gerçek srsRecord+markLearn (doğru cevap) → marker
  await evalr(() => { const r = window.JYA.srsRecord("あ", true); window.__ob.markLearn(r, true, "quiz"); window.JYA.go("home"); });
  await page.waitForTimeout(70); o = await ob();
  ok(typeof o.firstMeaningfulActionAt === "string", "12b doğru anlamlı eylem → marker yazıldı");
  ok((await page.locator(".rec-hint").count()) === 0, "12c marker sonrası şerit BOŞLUKSUZ gizlendi");

  // ---- 13) Yanlış cevap / başarısız kayıt marker YAZMAZ (gerçek runtime) ----
  await toCompetency(); await pickBand(2); await click('[data-act="ob-final-start"]'); // band2 completed (intro yok), marker yok
  await evalr(() => { const r = window.JYA.srsRecord("ki", false); window.__ob.markLearn(r, false, "quiz"); }); // yanlış
  o = await ob(); ok(o.firstMeaningfulActionAt == null, "13a yanlış cevap → marker YOK");
  await evalr(() => { window.__ob.markLearn({ ok: false }, true, "quiz"); }); o = await ob();
  ok(o.firstMeaningfulActionAt == null, "13b başarısız kayıt (ok=false) → marker YOK");
  await evalr(() => window.JYA.go("home")); await page.waitForTimeout(50);
  ok((await page.locator(".rec-hint").count()) === 1, "13c yanlış/gezinme sonrası şerit HÂLÂ görünür");

  // ---- 15) SRS reset sonrası marker korunur → şerit geri gelmez ----
  await evalr(() => { window.__ob.markFirstMeaningfulLearningAction("known-kana"); window.JYA.state.srs = {}; window.JYA.save(); window.JYA.go("home"); });
  await page.waitForTimeout(60); o = await ob();
  ok(typeof o.firstMeaningfulActionAt === "string" && (await page.locator(".rec-hint").count()) === 0, "15 SRS reset sonrası marker kalır → şerit görünmez");

  // ---- 16) Import: eski correct>0 ama marker yok → şerit gösterilir (loadBlob ile gerçek migration) ----
  await loadBlob(V2({ status: "completed", stage: "final", competency: 0, startKey: "kana-a", firstMeaningfulActionAt: null, completed: true }, { srs: { "ki": { type: "kanji", correct: 6, wrong: 0, mastery: 3, seen: 6, write: 0, last: null, next: null } } }));
  s = await scr(); ok(s.screen === "home", "16a import completed → home");
  ok((await page.locator(".rec-hint").count()) === 1, "16b IMPORT: eski correct>0 + marker yok → şerit GÖSTERİLİR (yeni eyleme kadar)");

  // ---- 17) Restart: ilerleme/name/marker korunur; yeniden tamamlayınca şerit dönmez ----
  await loadBlob(V2({ status: "completed", stage: "final", competency: 0, startKey: "kana-a", firstMeaningfulActionAt: "2026-01-01T00:00:00.000Z", completed: true },
    { userProfile: { name: "Zeynep", level: "beginner", createdAt: "2025-01-01T00:00:00.000Z" }, srs: { "あ": { type: "kana", correct: 2, wrong: 0, mastery: 2, seen: 2, write: 0, last: null, next: null } } }));
  await evalr(() => window.JYA.go("profile")); await page.waitForTimeout(70);
  const hasRestart = await page.locator('[data-act="ob-restart"]').count();
  if (hasRestart) { await click('[data-act="ob-restart"]'); } else { await evalr(() => window.JYA.go("onboarding")); }
  o = await ob();
  ok(o.stage === "welcome" && o.firstMeaningfulActionAt === "2026-01-01T00:00:00.000Z", "17a restart → welcome, marker KORUNUR");
  const up = await evalr(() => window.JYA.state.userProfile); const srsN = await evalr(() => Object.keys(window.JYA.state.srs).length);
  ok(up && up.name === "Zeynep" && srsN >= 1, "17b restart → name + öğrenme ilerlemesi KORUNUR");
  // yeniden tamamla (band0) → marker dolu olduğundan şerit dönmez
  await click('[data-act="ob-continue"]'); await pickBand(0); await click('[data-act="ob-continue"]'); await click('[data-act="ob-final-start"]');
  await evalr(() => window.JYA.go("home")); await page.waitForTimeout(60);
  ok((await page.locator(".rec-hint").count()) === 0, "17c yeniden tamamla → marker dolu → şerit DÖNMEZ");

  // ---- 18) Migration: eski completed / eski incomplete ----
  await loadBlob(V2({ completed: true, step: 8, name: "X", level: "hiragana" }));
  o = await ob(); s = await scr();
  ok(o.status === "completed" && o.competency === null && o.startKey === null && s.screen === "home", "18a eski completed → completed, competency/startKey null, home");
  ok((await page.locator(".rec-hint").count()) === 0, "18b eski completed (startKey yok) → şerit YOK");
  await loadBlob(V2({ completed: false, step: 3 }));
  o = await ob(); s = await scr();
  ok(o.status === "in-progress" && o.stage === "welcome" && s.screen === "onboarding", "18c eski incomplete → in-progress/welcome/onboarding");

  // ---- 19) Bozuk stage/startKey invariant güvenli düşüş ----
  await loadBlob(V2({ status: "completed", stage: "final", competency: 0, startKey: "atlas-map", completed: true }));
  o = await ob(); ok(o.startKey === "kana-a", "19a completed comp0 + yanlış startKey(atlas-map) → kanonik kana-a");
  await loadBlob(V2({ status: "in-progress", stage: "zzz-bozuk", competency: null }));
  o = await ob(); ok(o.stage === "welcome", "19b bozuk stage → welcome güvenli düşüş");

  // ---- 20) t() fallback (gerçek runtime) ----
  const tRes = await evalr(() => ({ hit: window.__ob.t("onboarding.actions.continue"), miss: window.__ob.t("yok.olan.x"), de: window.__ob.t("onboarding.actions.start", "de") }));
  ok(tRes.hit === "Devam" && tRes.miss === "yok.olan.x" && tRes.de === "Başlayalım", "20 t() fallback: locale→tr→key, çökme yok");

  // ---- 21) lang="ja" glifler + ekran geçişinde H1 focus ----
  await toCompetency(); await pickBand(0); // writing-intro (glifler)
  const jaCount = await page.locator('.ob-stage [lang="ja"]').count();
  ok(jaCount >= 3, "21a writing-intro Japonca glifler lang=\"ja\" (>=3)");
  await click('[data-act="ob-continue"]'); // final → afterRender H1 focus
  const activeTag = await evalr(() => document.activeElement && document.activeElement.tagName);
  ok(activeTag === "H1", "21b ekran geçişinde focus H1'e taşınır");

  // ---- 22) 320px yatay taşma yok ----
  await page.setViewportSize({ width: 320, height: 700 });
  await toCompetency(); await pickBand(2); // final band2 (uzun içerik)
  const overflow = await evalr(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 1, "22a 320px final → yatay taşma yok (scrollWidth<=clientWidth), got " + overflow);
  await toCompetency(); // competency (4 uzun kart)
  const overflow2 = await evalr(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow2 <= 1, "22b 320px competency → yatay taşma yok, got " + overflow2);
  await page.setViewportSize({ width: 390, height: 780 });

  // Kanıt ekran görüntüleri
  await freshLoad(); await click('[data-act="ob-continue"]');
  await page.screenshot({ path: "/home/claude/smoke_b2_competency.png" });
  await pickBand(2); await page.screenshot({ path: "/home/claude/smoke_b2_final_band2.png" });

  // pageerror kontrolü
  ok(perr.length === 0, "runtime: JS pageerror yok" + (perr.length ? " :: " + perr.join(" | ") : ""));

  console.log("GATE 2 · smoke_onboarding_b2:  pass=" + pass + "  fail=" + fail + "  pageerrors=" + perr.length);
  if (fail) console.log("FAILURES:\n - " + fails.join("\n - "));
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("SMOKE HARNESS ERROR:", e.message); process.exit(2); });
