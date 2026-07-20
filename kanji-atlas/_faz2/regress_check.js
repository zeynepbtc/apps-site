const { chromium } = require("playwright");
const PRE = "file:///home/claude/faz2/atlas_pre_familystrip.html";
const POST = "file:///home/claude/atlas_drive_may30.html";

async function open(browser, url) {
  const errs = [];
  const p = await browser.newPage();
  p.on("pageerror", e => errs.push("pageerror: " + e.message));
  p.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/i.test(m.text())) errs.push("console.error: " + m.text()); });
  await p.goto(url);
  await p.waitForFunction(() => typeof window.go === "function", { timeout: 15000 });
  return { p, errs };
}
async function strip(pg, id) {
  await pg.evaluate(cid => window.go("detail", cid), id);
  await pg.waitForTimeout(100);
  return pg.evaluate(() => { const s = document.querySelector(".screen .fam-strip"); return s ? s.outerHTML : null; });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const post = await open(browser, POST);
  const pre = await open(browser, PRE);

  // 1) kanonik-DIŞI, legacy aile şeridi OLAN bir kontrol karakteri bul (post sayfasında)
  const controlId = await post.p.evaluate(() => {
    const ids = Object.keys(DATA.chars).filter(k => DATA.chars[k].type === "kanji");
    for (const id of ids) {
      if (FR.familyStripData(id)) continue;            // kanonik olanları atla
      const html = legacyFamilyStrip(DATA.chars[id], id);
      if (html && html.length) return id;               // legacy şeridi dolu ilk aday
    }
    return null;
  });

  let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };

  console.log("=== PARİTE: kanonik-dışı aile şeridi DEĞİŞMEDİ ===");
  if (controlId) {
    const postHTML = await strip(post.p, controlId);
    const preHTML = await strip(pre.p, controlId);
    A(`kontrol karakteri '${controlId}' şeridi eski==yeni`, postHTML === preHTML, postHTML === preHTML ? "birebir aynı" : "FARK VAR");
  } else {
    A("kontrol karakteri bulundu", false, "kanonik-dışı legacy aile bulunamadı");
  }

  console.log("=== YAN ETKİ: diğer yollar çöküyor mu ===");
  const paths = [["kana", null], ["words", null], ["quiz", "ki"], ["review", null], ["drill", "ki"], ["map", null], ["progress", null], ["kanadetail", "あ"]];
  for (const [scr, param] of paths) {
    const ok = await post.p.evaluate(([s, pr]) => { try { window.go(s, pr); return !!document.querySelector(".screen"); } catch (e) { return false; } }, [scr, param]);
    await post.p.waitForTimeout(60);
    A(`${scr} ekranı render (çökme yok)`, ok, "");
  }

  console.log("=== KONSOL ===");
  A("post: yeni JS exception yok", post.errs.length === 0, post.errs.slice(0, 3).join(" | "));

  await browser.close();
  console.log(fail === 0 ? "\n✅ REGRESYON TEMİZ" : "\n❌ " + fail + " başarısız");
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("HATA:", e); process.exit(2); });
