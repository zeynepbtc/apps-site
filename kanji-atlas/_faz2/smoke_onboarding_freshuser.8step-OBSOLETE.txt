/* FAZ 2 · REGRESYON: tam temiz kullanıcı (boş localStorage) onboarding'i baştan sona yürütebilmeli.
   Bug: DEFAULT onboarding=null + freshState migrate'i atlar → ob-next/ob-* guard'ları akışı öldürür. */
const { chromium } = require("playwright");
const FILE = "file:///home/claude/atlas_drive_may30.html";

(async () => {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/i.test(m.text())) errors.push("console.error: " + m.text()); });
  await page.goto(FILE);
  await page.waitForFunction(() => typeof window.JYA !== "undefined", { timeout: 15000 });

  let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };

  // TAM temiz kullanıcı
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForFunction(() => typeof window.JYA !== "undefined");

  const fresh = await page.evaluate(() => ({
    obIsObject: window.JYA.state.onboarding !== null && typeof window.JYA.state.onboarding === "object",
    completed: window.JYA.state.onboarding && window.JYA.state.onboarding.completed,
    step: window.JYA.state.onboarding && window.JYA.state.onboarding.step,
    screen: window.JYA.state.screen
  }));
  console.log("=== temiz kullanıcı bootstrap ===");
  A("onboarding taze NESNE (null değil)", fresh.obIsObject === true);
  A("completed=false, step=1, screen=onboarding", fresh.completed === false && fresh.step === 1 && fresh.screen === "onboarding");

  // "Başlayalım" (ob-next) intro'yu ilerletir (bildirilen bug)
  const introAdvance = await page.evaluate(() => {
    const s0 = window.JYA.state.onboarding.step;
    document.querySelector('[data-act="ob-next"]').click();
    return { from: s0, to: window.JYA.state.onboarding.step };
  });
  console.log("=== bildirilen bug: Başlayalım ===");
  A("Başlayalım step 1→2 ilerletti (buton artık ölü değil)", introAdvance.from === 1 && introAdvance.to === 2);

  // Tam akışı sonuna kadar yürü: her render'da mevcut birincil CTA'ya bas
  const walk = await page.evaluate(async () => {
    const clickFirst = (sels) => { for (const s of sels){ const el=document.querySelector(s); if(el){ el.click(); return s; } } return null; };
    const trail = [];
    for (let i=0;i<12;i++){
      if (window.JYA.state.onboarding.completed) break;
      // seçim ekranlarında bir kart seç, sonra ilerlet; öncelik: finish > next > name-skip > seç
      const picked = clickFirst([
        '[data-act="ob-finish"]',
        '[data-act="ob-select-level"]',
        '[data-act="ob-select-motivation"]',
        '[data-act="ob-select-style"]',
        '[data-act="ob-name-skip"]',
        '[data-act="ob-next"]'
      ]);
      trail.push({ step: window.JYA.state.onboarding.step, picked });
      await new Promise(r=>setTimeout(r,30));
    }
    return { trail, completed: window.JYA.state.onboarding.completed, screen: window.JYA.state.screen, entryPath: window.JYA.state.onboarding.entryPath };
  });
  console.log("=== tam akış yürüyüşü ===");
  console.log("iz:", JSON.stringify(walk.trail));
  A("onboarding tamamlandı (completed=true)", walk.completed === true);
  A("bitişte geçerli ekrana gidildi (onboarding değil)", walk.screen !== "onboarding" && ["home","kanadetail","detail","map"].includes(walk.screen), walk.screen);
  A("entryPath üretildi", ["kana","kanji-family","explore"].includes(walk.entryPath), walk.entryPath);

  // reload sonrası completed kullanıcı home (tekrar onboarding'e atılmaz)
  await page.reload(); await page.waitForFunction(() => typeof window.JYA !== "undefined");
  const after = await page.evaluate(() => ({ screen: window.JYA.state.screen, completed: window.JYA.state.onboarding.completed }));
  A("reload → tamamlanmış kullanıcı home", after.screen === "home" && after.completed === true);

  console.log("=== SAĞLIK ===");
  A("yeni JS exception yok", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
  console.log(fail === 0 ? "\n✅ TEMİZ KULLANICI ONBOARDING REGRESYON GEÇTİ (0 başarısız)" : "\n❌ " + fail + " başarısız");
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("SMOKE HATASI:", e); process.exit(2); });
