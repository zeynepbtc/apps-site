const { chromium } = require("playwright");
const FILE = "file:///home/claude/atlas_drive_may30.html";

(async () => {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  // Gerçek JS hatası sayılır; offline CDN font/kaynak yükleme hataları ORTAMSAL, sayılmaz.
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/i.test(m.text())) errors.push("console.error: " + m.text()); });

  await page.goto(FILE);
  await page.waitForFunction(() => typeof window.go === "function", { timeout: 15000 });

  const results = {};
  async function visit(id) {
    await page.evaluate(cid => window.go("detail", cid), id);
    await page.waitForTimeout(120);
    results[id] = await page.evaluate(() => {
      const strip = document.querySelector(".screen .fam-strip") || document.querySelector(".fam-strip");
      let header = "", lead = "";
      if (strip) {
        const leadEl = strip.previousElementSibling;              // .lead
        lead = leadEl ? leadEl.textContent.trim() : "";
        const secEl = leadEl ? leadEl.previousElementSibling : null; // .section-t
        header = secEl ? secEl.textContent.trim() : "";
      }
      // ekranda "Ağaç ailesi" / "İnsan ailesi" başlığı geçiyor mu (yanlış-aile kontrolü için)
      const screenText = (document.querySelector(".screen") || document.body).textContent;
      return {
        hasStrip: !!strip,
        chips: strip ? [...strip.querySelectorAll(".fam-chip .fg")].map(x => x.textContent) : [],
        rels: strip ? [...strip.querySelectorAll(".fam-chip .ff")].map(x => x.textContent) : [],
        header, lead,
        mentionsAgac: /Ağaç ailesi/.test(screenText),
        famStats: JSON.parse(JSON.stringify(window.__famStats))
      };
    });
  }
  for (const id of ["ki", "hayashi", "hon", "yasumu", "gakkou", "higashi"]) await visit(id);
  const stats = await page.evaluate(() => JSON.parse(JSON.stringify(window.__famStats)));
  await browser.close();

  let fail = 0;
  const A = (name, ok, extra) => { console.log((ok ? "✓" : "✗") + " " + name + (extra ? " — " + extra : "")); if (!ok) fail++; };
  const has = (arr, xs) => xs.every(x => arr.includes(x));

  console.log("=== KANONİK KAPSAM ===");
  A("木 (ki): Ağaç ailesi + 5 üye [木林森本休]", /Ağaç ailesi/.test(results.ki.header) && has(results.ki.chips, ["木","林","森","本","休"]), results.ki.chips.join(""));
  A("林 (hayashi): Ağaç ailesi, tekrar rolü", /Ağaç ailesi/.test(results.hayashi.header) && results.hayashi.chips.includes("林"), results.hayashi.header);
  A("本 (hon): Ağaç ailesi, işaret rolü", /Ağaç ailesi/.test(results.hon.header) && results.hon.rels.includes("işaret"), results.hon.rels.join(","));
  console.log("=== ÇAPRAZ AİLE 休 ===");
  A("休: classification=İnsan (başlık İnsan ailesi)", /İnsan ailesi/.test(results.yasumu.header), results.yasumu.header);
  A("休: 'Ana yapı bağlantısı' + secondary Ağaç lead'de", /Ana yapı bağlantısı/.test(results.yasumu.lead) && /Ağaç/.test(results.yasumu.lead), results.yasumu.lead);
  A("休: İnsan üyeleri [人亻大天休]", has(results.yasumu.chips, ["人","亻","大","天","休"]), results.yasumu.chips.join(""));
  A("休: TEK 休 (çoğaltılmadı)", results.yasumu.chips.filter(c => c === "休").length === 1, "adet=" + results.yasumu.chips.filter(c => c === "休").length);
  console.log("=== LEGACY FALLBACK ===");
  A("校: fallback'e düştü (raporlandı)", stats.fallbackIds.includes("gakkou"), "fallbackIds=" + stats.fallbackIds.join(","));
  A("校: kanonik İnsan/Ağaç şeridi göstermedi", !/İnsan ailesi/.test(results.gakkou.header), results.gakkou.header || "(şerit yok)");
  console.log("=== YANLIŞ-AİLE KONTROLÜ 東 ===");
  A("東: fallback'e düştü", stats.fallbackIds.includes("higashi"), "");
  A("東: 木/Ağaç ailesine DÜŞMEDİ", !results.higashi.mentionsAgac, results.higashi.mentionsAgac ? "HATA: Ağaç ailesi görünüyor" : "temiz");
  console.log("=== REGRESYON / SAĞLIK ===");
  A("kanonik sayaç ≥4", stats.canon >= 4, "canon=" + stats.canon + " fallback=" + stats.fallback);
  A("yeni console/page exception yok", errors.length === 0, errors.slice(0, 3).join(" | "));

  console.log("\n__famStats:", JSON.stringify(stats));
  console.log(fail === 0 ? "\n✅ SMOKE GEÇTİ (0 başarısız)" : "\n❌ " + fail + " başarısız");
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("SMOKE HATASI:", e); process.exit(2); });
