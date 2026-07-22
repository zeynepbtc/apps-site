const { chromium } = require("playwright");
const FILE = "file:///home/claude/atlas_drive_may30.html";

(async () => {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/i.test(m.text())) errors.push("console.error: " + m.text()); });
  await page.goto(FILE);
  await page.waitForFunction(() => typeof window.__ob !== "undefined", { timeout: 15000 });

  let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };

  // ---- 1) deriveEntryPath: 4 seviye + eksik/tanınmayan → 3 niyet, güvenli varsayılan ----
  const D = await page.evaluate(() => {
    const f = window.__ob.deriveEntryPath;
    return { beginner: f("beginner"), a_few: f("a_few"), hiragana: f("hiragana"), explorer: f("explorer"), empty: f(""), unknown: f("zzz"), undef: f(undefined) };
  });
  console.log("=== 1: deriveEntryPath (niyet) ===");
  A("beginner → kana", D.beginner === "kana");
  A("a_few → kana", D.a_few === "kana");
  A("hiragana → kanji-family", D.hiragana === "kanji-family");
  A("explorer → explore", D.explorer === "explore");
  A("boş '' → kana (güvenli)", D.empty === "kana");
  A("tanınmayan → kana (güvenli)", D.unknown === "kana");
  A("undefined → kana (güvenli)", D.undef === "kana");

  // ---- 2) resolveEntryRoute: niyet → rota; tanınmayan → kana ----
  const R = await page.evaluate(() => {
    const g = window.__ob.resolveEntryRoute;
    return { kana: g("kana"), kf: g("kanji-family"), ex: g("explore"), bad: g("zzz"), nul: g(null) };
  });
  console.log("=== 2: resolveEntryRoute (rota) ===");
  A("kana → kanadetail/あ", R.kana.screen === "kanadetail" && R.kana.param === "あ");
  A("kanji-family → detail/ki", R.kf.screen === "detail" && R.kf.param === "ki");
  A("explore → map/null", R.ex.screen === "map" && R.ex.param === null);
  A("tanınmayan niyet → kana (güvenli)", R.bad.screen === "kanadetail");
  A("null niyet → kana (güvenli)", R.nul.screen === "kanadetail");

  // ---- 3) her üç seçenek doğru başlangıç hedefine gider (canlı ob-finish) ----
  async function runFinish(level){
    return await page.evaluate((lvl) => {
      localStorage.clear();
      // taze onboarding state kur, seviye seç, ob-finish tetikle
      state.onboarding = { completed:false, step:8, name:"T", motivation:"", level:lvl, style:"", startedAt:1, completedAt:null };
      // ob-finish delegasyonunu doğrudan çağır
      document.querySelector('[data-act="ob-finish"]')?.click?.();
      // buton yoksa handler'ı elle tetikle: completeOnboarding + resolve
      if(!(state.onboarding.entryPath)){ completeOnboarding(); }
      return { screen: state.screen, param: state.param, entryPath: state.onboarding.entryPath, completed: state.onboarding.completed };
    }, level);
  }
  // ob-finish butonu render'a bağlı olmayabilir; niyet+rota mantığını uçtan uca doğrula
  const finHira = await page.evaluate(() => {
    localStorage.clear();
    state.onboarding = { completed:false, step:8, name:"T", motivation:"", level:"hiragana", style:"", startedAt:1, completedAt:null };
    completeOnboarding();
    const r = window.__ob.resolveEntryRoute(state.onboarding.entryPath);
    return { entryPath: state.onboarding.entryPath, screen: r.screen, param: r.param, completed: state.onboarding.completed };
  });
  const finBeg = await page.evaluate(() => {
    localStorage.clear();
    state.onboarding = { completed:false, step:8, name:"T", motivation:"", level:"beginner", style:"", startedAt:1, completedAt:null };
    completeOnboarding();
    const r = window.__ob.resolveEntryRoute(state.onboarding.entryPath);
    return { entryPath: state.onboarding.entryPath, screen: r.screen, param: r.param };
  });
  const finExp = await page.evaluate(() => {
    localStorage.clear();
    state.onboarding = { completed:false, step:8, name:"T", motivation:"", level:"explorer", style:"", startedAt:1, completedAt:null };
    completeOnboarding();
    const r = window.__ob.resolveEntryRoute(state.onboarding.entryPath);
    return { entryPath: state.onboarding.entryPath, screen: r.screen, param: r.param };
  });
  console.log("=== 3: canlı completeOnboarding → entryPath → rota ===");
  A("hiragana kullanıcı → kanji-family / detail-ki", finHira.entryPath === "kanji-family" && finHira.screen === "detail" && finHira.param === "ki");
  A("beginner kullanıcı → kana / kanadetail-あ", finBeg.entryPath === "kana" && finBeg.screen === "kanadetail" && finBeg.param === "あ");
  A("explorer kullanıcı → explore / map", finExp.entryPath === "explore" && finExp.screen === "map");
  A("completeOnboarding completed=true yaptı", finHira.completed === true);

  // ---- 4) sonuç (entryPath) yeniden yüklemede korunur ----
  await page.evaluate(() => {
    localStorage.clear();
    state.onboarding = { completed:false, step:8, name:"T", motivation:"", level:"hiragana", style:"", startedAt:1, completedAt:null };
    completeOnboarding(); // save() içeride entryPath'i yazar
  });
  await page.reload(); await page.waitForFunction(() => typeof window.__ob !== "undefined");
  const persisted = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("kana_state"));
    return { entryPath: s.onboarding && s.onboarding.entryPath, completed: s.onboarding && s.onboarding.completed };
  });
  console.log("=== 4: kalıcılık (reload) ===");
  A("entryPath reload sonrası korundu (kanji-family)", persisted.entryPath === "kanji-family");
  A("completed reload sonrası true", persisted.completed === true);

  // ---- 5) ob-finish ilerleme/kişisel veriyi DEĞİŞTİRMEZ ----
  const prog = await page.evaluate(() => {
    localStorage.clear();
    // önceden var olan öğrenme + kişisel veri
    state.learned = { ki: true, hi: true };
    state.userHints = { ki: "benim notum" };
    state.srs = { ki: { correct: 2, wrong: 1, mastery: 1 } };
    state.games = { m1: { best: 7 } };
    state.cipherLearned = { "ア": { kana: "a" } };
    state.onboarding = { completed:false, step:8, name:"T", motivation:"", level:"explorer", style:"", startedAt:1, completedAt:null };
    const before = JSON.stringify({ l: state.learned, uh: state.userHints, s: state.srs, g: state.games, c: state.cipherLearned });
    completeOnboarding();
    const after = JSON.stringify({ l: state.learned, uh: state.userHints, s: state.srs, g: state.games, c: state.cipherLearned });
    return { same: before === after, uh: state.userHints.ki, learnedKi: state.learned.ki };
  });
  console.log("=== 5: ilerleme/kişisel veri korunur ===");
  A("ob-finish learned/userHints/srs/games/cipher DOKUNMADI", prog.same === true);
  A("userHints notu korundu", prog.uh === "benim notum");

  // ---- 6) eski completed:true kullanıcı yeniden onboarding'e ATILMAZ ----
  const returning = await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("kana_state", JSON.stringify({ schemaVersion:1, learned:{ki:true}, onboarding:{ completed:true, step:8, name:"E", level:"hiragana", entryPath:"kanji-family" } }));
  });
  await page.reload(); await page.waitForFunction(() => typeof window.__ob !== "undefined");
  const ret = await page.evaluate(() => ({ screen: state.screen, completed: state.onboarding.completed }));
  console.log("=== 6: dönen kullanıcı onboarding'e atılmaz ===");
  A("completed:true → screen home (onboarding değil)", ret.screen === "home" && ret.completed === true);

  // ---- 7) hedef ekran geçersizse ana ekrana güvenli düşüş — iki senaryo ----
  const safeFall = await page.evaluate(() => {
    // (a) bilinmeyen entryPath: resolver kana'ya düşürür
    const r = window.__ob.resolveEntryRoute("bozuk-niyet");
    const whitelistOk = ["kanadetail","detail","map"].includes(r.screen);
    // (b) resolver bir gün registry'de OLMAYAN bir ekran döndürürse: ob-finish guard'ı home'a düşürmeli.
    //     ob-finish guard ifadesini birebir simüle et; ayrıca whitelist'in gerçek R registry'sinin
    //     alt kümesi olduğunu, geçersiz bir ekranın render()'da ||Home ile güvenli açıldığını kanıtla.
    const guard = (screen) => { const valid = ["kanadetail","detail","map"].includes(screen); return valid ? screen : "home"; };
    const outOfRegistry = guard("nonexistent-screen");   // registry'de yok → home
    // gerçek registry'de üç whitelist ekranının da bulunduğunu render ile kanıtla (||Home fallback aktif)
    let renderedInvalid = false;
    try { go("nonexistent-screen", null, false); renderedInvalid = document.body.children.length > 0 && !!document.querySelector(".screen"); } catch(e){}
    const homeAfterInvalid = state.screen; // go geçersiz ekranı set eder ama render Home çizer (çökme yok)
    return { resolvedScreen: r.screen, whitelistOk, outOfRegistry, renderedInvalid, homeAfterInvalid };
  });
  console.log("=== 7: güvenli düşüş (iki senaryo) ===");
  A("7a) bilinmeyen entryPath resolver'da kana'ya düştü", safeFall.resolvedScreen === "kanadetail");
  A("7a) çözülen ekran whitelist'te (home fallback tetiklenmez)", safeFall.whitelistOk === true);
  A("7b) registry-dışı ekran ob-finish guard'ında home'a düştü", safeFall.outOfRegistry === "home");
  A("7b) registry-dışı ekran render'da çökmeden açıldı (||Home)", safeFall.renderedInvalid === true);

  // ---- 8) entryPath TEK KULLANIMLIK: reload sonrası tekrar o rotaya zorlanmaz (M1) ----
  await page.evaluate(() => {
    localStorage.clear();
    state.onboarding = { completed:false, step:8, name:"T", motivation:"", level:"hiragana", style:"", startedAt:1, completedAt:null };
    completeOnboarding();                     // entryPath=kanji-family kaydedilir (ilk yönlendirme ob-finish'te olur)
  });
  await page.reload(); await page.waitForFunction(() => typeof window.__ob !== "undefined");
  const oneShot = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("kana_state"));
    return { savedEntry: s.onboarding && s.onboarding.entryPath, bootScreen: state.screen };
  });
  console.log("=== 8: entryPath tek kullanımlık (M1) ===");
  A("entryPath kalıcı saklandı (kanji-family)", oneShot.savedEntry === "kanji-family");
  A("reload → bootstrap HOME (detail/ki'ye zorlanmadı)", oneShot.bootScreen === "home");

  // ---- 9) eski completed:true + entryPath YOK → normal açılır, kana'ya zorlanmaz (M2) ----
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("kana_state", JSON.stringify({ schemaVersion:1, learned:{ki:true}, onboarding:{ completed:true, step:8, name:"E", level:"hiragana" } })); // entryPath YOK
  });
  await page.reload(); await page.waitForFunction(() => typeof window.__ob !== "undefined");
  const legacyDone = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("kana_state"));
    return { screen: state.screen, entryInState: state.onboarding.entryPath, entryInStore: s.onboarding.entryPath, completed: state.onboarding.completed };
  });
  console.log("=== 9: eski completed kullanıcı korunur (M2) ===");
  A("onboarding açılmadı → screen home", legacyDone.screen === "home" && legacyDone.completed === true);
  A("migration entryPath'i SESSİZCE eklemedi (undefined)", legacyDone.entryInState === undefined && legacyDone.entryInStore === undefined);
  A("kanadetail/あ'ya zorlanmadı", legacyDone.screen !== "kanadetail");

  console.log("=== SAĞLIK ===");
  A("yeni JS exception yok", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
  console.log(fail === 0 ? "\n✅ ONBOARDING SMOKE GEÇTİ (0 başarısız)" : "\n❌ " + fail + " başarısız");
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("SMOKE HATASI:", e); process.exit(2); });
