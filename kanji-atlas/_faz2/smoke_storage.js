const { chromium } = require("playwright");
const FILE = "file:///home/claude/atlas_drive_may30.html";

(async () => {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/i.test(m.text())) errors.push("console.error: " + m.text()); });
  await page.goto(FILE);
  await page.waitForFunction(() => typeof window.STORE !== "undefined", { timeout: 15000 });

  let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };

  // ---- B: sürümsüz eski kayıt → v1 göç + userHints korunur ----
  await page.evaluate(() => localStorage.setItem("kana_state", JSON.stringify({ learned: { ki: true }, userHints: { ki: "notum" }, settings: { audio: false }, userProfile: { name: "Z", level: "hiragana", createdAt: 3 } })));
  await page.reload(); await page.waitForFunction(() => typeof window.STORE !== "undefined");
  const B = await page.evaluate(() => { window.save(); const s = JSON.parse(localStorage.getItem("kana_state")); return { rec: window.STORE.recoveryMode, ver: s.schemaVersion, uh: s.userHints && s.userHints.ki, am: s.settings && s.settings.audioMode, learned: s.learned && s.learned.ki, screen: !!document.querySelector(".screen") || !!document.querySelector(".app") || document.body.children.length > 0 }; });
  console.log("=== B: sürümsüz göç ===");
  A("recovery değil (geçerli kayıt)", B.rec === false);
  A("schemaVersion=1'e göç edildi", B.ver === 1);
  A("userHints KORUNDU (ki='notum')", B.uh === "notum");
  A("settings.audioMode legacy audio'dan (off)", B.am === "off");
  A("learned korundu", B.learned === true);

  // ---- A: bozuk JSON → recovery; kana_state EZİLMEZ; save reddedilir ----
  const CORRUPT = '{"learned":{"ki":tru';
  await page.evaluate((c) => localStorage.setItem("kana_state", c), CORRUPT);
  await page.reload(); await page.waitForFunction(() => typeof window.STORE !== "undefined");
  const Abefore = await page.evaluate(() => ({ rec: window.STORE.recoveryMode, raw: localStorage.getItem("kana_state"), recKey: Object.keys(localStorage).some(k => k.startsWith("kana_state_recovery_")), rendered: document.body.children.length > 0 }));
  const Asave = await page.evaluate(() => { const r = window.save(); return { kana: localStorage.getItem("kana_state"), ok: r.ok, reason: r.reason }; });
  console.log("=== A: bozuk JSON recovery ===");
  A("recovery modu aktif", Abefore.rec === true);
  A("bozuk kana_state YERİNDE (ezilmedi)", Abefore.raw === CORRUPT, Abefore.raw);
  A("recovery kopyası oluştu (kana_state_recovery_*)", Abefore.recKey);
  A("uygulama açıldı (çökmedi)", Abefore.rendered);
  A("recovery save() bozuk kaydı EZMEDİ", Asave.kana === CORRUPT);
  A("recovery save() görünür sözleşme döndü {ok:false, reason:storage-recovery}", Asave.ok === false && Asave.reason === "storage-recovery");

  console.log("=== SAĞLIK ===");
  A("yeni JS exception yok", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
  console.log(fail === 0 ? "\n✅ STORAGE SMOKE GEÇTİ (0 başarısız)" : "\n❌ " + fail + " başarısız");
  console.log("EXIT-CARD: Recovery modunda uygulama açıldıktan sonra hiçbir otomatik akış kana_state üzerine yazamadı — " + (fail === 0 ? "DOĞRULANDI" : "BAŞARISIZ"));
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("SMOKE HATASI:", e); process.exit(2); });
