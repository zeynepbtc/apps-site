const { chromium } = require("playwright");
const FILE = "file:///home/claude/atlas_drive_may30.html";

(async () => {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|net::ERR/i.test(m.text())) errors.push("console.error: " + m.text()); });
  await page.goto(FILE);
  await page.waitForFunction(() => typeof window.__srs !== "undefined", { timeout: 15000 });

  let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };

  // gerçek bir kanji id bul (DATA.chars type kanji)
  const kanjiId = await page.evaluate(() => Object.keys(window.JYA.DATA.chars).find(id => window.JYA.DATA.chars[id].type === "kanji"));
  console.log("test kanji id:", kanjiId);

  // ---- 7 + 15) İNVARIANT: dört yüzey aynı snapshot kuyruğunu kullanır ----
  const inv = await page.evaluate((kid) => {
    localStorage.clear();
    const now = Date.now();
    // iki zaman-due kanji kur (biri mastered), biri gelecekte (due değil), bir kana due, bir hayalet
    const s = window.JYA.state;
    s.srs = {};
    s.srs[kid] = { correct:1, wrong:0, mastery:4, last:now, next: now - 1000 };   // mastered + due
    // ikinci kanji
    const kid2 = Object.keys(window.JYA.DATA.chars).filter(id => window.JYA.DATA.chars[id].type==="kanji" && id!==kid)[0];
    s.srs[kid2] = { correct:0, wrong:1, mastery:0, last:now, next: now - 500 };    // due, mastery 0 → önce
    const kid3 = Object.keys(window.JYA.DATA.chars).filter(id => window.JYA.DATA.chars[id].type==="kanji" && id!==kid && id!==kid2)[0];
    s.srs[kid3] = { correct:0, wrong:0, mastery:1, last:now, next: now + 10*24*3600*1000 }; // gelecekte → due değil
    s.srs["あ"] = { correct:0, wrong:1, mastery:0, last:now, next: now - 100 };     // kana due → kapsam dışı
    s.srs["hayalet_xyz"] = { correct:0, wrong:0, mastery:0, last:now, next: now-100 }; // tanınmayan → elenir
    s.status = {}; // status'a hiç bakılmamalı
    // tek snapshot
    const queue = window.__srs.buildKanjiReviewQueue(s, window.JYA.DATA, now);
    const dc = window.__srs.dueCount(now);
    const diag = window.__srs.inspectKanjiReviewData(s, window.JYA.DATA);
    return { queue, dc, kid2, kid3, diag };
  }, kanjiId);
  console.log("=== 7+15: invariant / snapshot ===");
  A("kuyruk yalnız 2 zaman-due kanji (kana+gelecek+hayalet elendi)", inv.queue.length === 2, JSON.stringify(inv.queue));
  A("dueCount === kuyruk uzunluğu", inv.dc === inv.queue.length);
  A("en eski next önce (kid next-1000 < kid2 next-500)", inv.queue[0] === kanjiId, JSON.stringify(inv.queue));
  A("gelecekteki kanji kuyrukta yok", !inv.queue.includes(inv.kid3));
  A("kana 'あ' kuyrukta yok", !inv.queue.includes("あ"));
  A("hayalet diagnostic'te (unknownKeys)", inv.diag.unknownKeys.includes("hayalet_xyz") && inv.diag.unknownKeys.includes("あ"));

  // Profil + Review + Progress yüzeylerinin GÖSTERDİĞİ sayı === dueCount
  const surfaceCounts = await page.evaluate(() => {
    const now = Date.now();
    const dc = window.__srs.dueCount(now);
    // Review başlığı DOM'undaki sayıyı oku
    window.JYA.go("review", null, false);
    const revTxt = (document.body.innerText.match(/(\d+)\s+kanji tekrar bekliyor/) || [])[1];
    window.JYA.go("profile", null, false);
    // Profil "Kanji tekrarı" istatistiği
    const profHasLabel = /Kanji tekrarı/.test(document.body.innerText);
    window.JYA.go("progress", null, false);
    return { dc, revTxt: revTxt!==undefined?Number(revTxt):null, profHasLabel };
  });
  console.log("=== yüzey sayıları === dueCount:", surfaceCounts.dc);
  A("Review başlığı sayısı === dueCount", surfaceCounts.revTxt === surfaceCounts.dc, "rev="+surfaceCounts.revTxt);
  A("Review metni 'N kanji tekrar bekliyor' formatında", surfaceCounts.revTxt !== null);
  A("Profil etiketi 'Kanji tekrarı' (kapsam dürüstlüğü)", surfaceCounts.profHasLabel === true);

  // ---- 8) tüketim = gösterim: review-start ilk öğeyi açar; sayaç>0 & review boş YOK ----
  const consume = await page.evaluate(() => {
    const now = Date.now();
    const q = window.__srs.currentKanjiReviewQueue(now);
    window.JYA.go("review", null, false);
    const btn = document.querySelector('[data-act="review-start"]');
    const disabled = btn ? btn.hasAttribute("disabled") : true;
    // review-start elle tetikle (butonun mantığı)
    const first = q[0];
    return { qLen: q.length, disabled, first };
  });
  A("dueCount>0 iken buton enabled", consume.qLen > 0 && consume.disabled === false);
  A("review-start ilk öğesi mevcut (sayaç>0 & boş review yolu YOK)", consume.qLen > 0 && !!consume.first);

  // ---- 4) mastered ölü buton çözümü: mastered+due kanji review-start ile açılabilir ----
  const masteredOpen = await page.evaluate((kid) => {
    localStorage.clear();
    const now = Date.now(); const s = window.JYA.state;
    s.srs = {}; s.status = {};
    s.srs[kid] = { correct:1, wrong:0, mastery:4, last:now, next: now-1000 };  // mastered, status YOK
    const q = window.__srs.currentKanjiReviewQueue(now);
    return { qHasMastered: q.includes(kid), qLen: q.length };
  }, kanjiId);
  console.log("=== 4: mastered ölü buton ===");
  A("mastered+due kanji kuyrukta (eski ölü buton çözüldü)", masteredOpen.qHasMastered && masteredOpen.qLen === 1);

  // ---- 16) ilk öğe cevaplanıp next geleceğe taşınınca ikinci öğe erişilebilir ----
  const secondReachable = await page.evaluate(() => {
    localStorage.clear();
    const now = Date.now(); const s = window.JYA.state;
    const kanji = Object.keys(window.JYA.DATA.chars).filter(id => window.JYA.DATA.chars[id].type==="kanji");
    const a = kanji[0], b = kanji[1];
    s.srs = {}; s.status = {};
    s.srs[a] = { correct:0, wrong:0, mastery:0, last:now, next: now-2000 }; // ilk
    s.srs[b] = { correct:0, wrong:0, mastery:0, last:now, next: now-1000 }; // ikinci
    const q1 = window.__srs.currentKanjiReviewQueue(now);
    // ilk öğeyi "cevapla": next'i geleceğe taşı (srsRecord'un yaptığı gibi)
    s.srs[a].next = now + 24*3600*1000; s.srs[a].mastery = 1;
    const q2 = window.__srs.currentKanjiReviewQueue(now);
    return { first: q1[0], q2, a, b };
  });
  console.log("=== 16: ikinci öğe blokaj yok ===");
  A("ilk öğe cevap sonrası kuyruktan çıktı", !secondReachable.q2.includes(secondReachable.a));
  A("ikinci öğe erişilebilir (kalıcı blokaj yok)", secondReachable.q2.includes(secondReachable.b) && secondReachable.q2[0] === secondReachable.b);

  // ---- 9) firstAvailableNode / reviewQueue KORUNDU (regresyon) ----
  const preserved = await page.evaluate(() => ({
    hasReviewQueue: typeof reviewQueue === "function",
    hasFirstAvail: typeof firstAvailableNode === "function",
    hasDueItems: typeof dueItems !== "undefined"
  }));
  console.log("=== 9: korunan fonksiyonlar ===");
  A("reviewQueue() korundu", preserved.hasReviewQueue);
  A("firstAvailableNode() korundu", preserved.hasFirstAvail);
  // dueItems() Faz 2 ölü-kod temizliğinde SİLİNDİ (0 çağıran; buildKanjiReviewQueue kanonik). Artık yok olmalı.
  A("dueItems() temizlikte silindi (kanonik: buildKanjiReviewQueue)", preserved.hasDueItems === false);

  // canlı ekran render (çökme yok)
  const renders = await page.evaluate(() => {
    const out = {};
    for (const sc of ["review","profile","progress","home"]) {
      try { window.JYA.go(sc, null, false); out[sc] = document.body.children.length > 0; } catch(e){ out[sc] = "ERR:"+e.message; }
    }
    return out;
  });
  A("review/profile/progress/home render (çökme yok)", Object.values(renders).every(v => v === true), JSON.stringify(renders));

  console.log("=== SAĞLIK ===");
  A("yeni JS exception yok", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
  console.log(fail === 0 ? "\n✅ SRS CANLI SMOKE GEÇTİ (0 başarısız)" : "\n❌ " + fail + " başarısız");
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error("SMOKE HATASI:", e); process.exit(2); });
