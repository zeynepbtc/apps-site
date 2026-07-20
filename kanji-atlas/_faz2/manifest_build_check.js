/* FAZ 2 · Ses manifesti GÖMME kapıları — statik doğrulama (Gate 7 & 10).
   Gate 1-6,9: inject_manifest.py yazımdan önce doğrular. Gate 8: iki kez inject → md5 aynı (kabuk). */
const fs = require("fs");
const REPO = "/home/claude/apps-deploy";
const h = fs.readFileSync(`${REPO}/kanji-atlas/index.html`, "utf-8");
const man = JSON.parse(fs.readFileSync(`${REPO}/kanji-atlas/audio-manifest.json`, "utf-8"));

let fail = 0; const A = (n, ok, x) => { console.log((ok ? "✓" : "✗") + " " + n + (x ? " — " + x : "")); if (!ok) fail++; };
// sıra-bağımsız kanonik stringify (anahtarları özyinelemeli sırala) → semantik eşitlik
const canon = v => Array.isArray(v) ? v.map(canon)
  : (v && typeof v === "object") ? Object.keys(v).sort().reduce((o, k) => (o[k] = canon(v[k]), o), {})
  : v;
const eq = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

// anchor'lı blok var mı
const m = h.match(/\/\* FAZ2_AUDIO_MANIFEST_START[\s\S]*?const AUDIO_MANIFEST = (\{[\s\S]*?\});\n\/\* FAZ2_AUDIO_MANIFEST_END \*\//);
A("gömülü blok anchor'larla mevcut", !!m);

// Gate 7: gömülü veri JSON ile SEMANTİK birebir aynı
let embedded = null;
try { embedded = JSON.parse(m[1]); } catch (e) {}
A("Gate 7) gömülü AUDIO_MANIFEST === audio-manifest.json (semantik)", eq(embedded, man));

// Gate 10: runtime manifest FETCH yok
const fetchesManifest = /(fetch|XMLHttpRequest|axios)[^;\n]{0,80}manifest/i.test(h)
  || /import\([^)]*manifest[^)]*\)/i.test(h);
A("Gate 10) runtime manifest fetch YOK", !fetchesManifest);
// 'audio-manifest.json' yalnız yorumda geçebilir, fetch argümanı olarak DEĞİL
const jsonRefInCode = /(fetch|open|load)[^;\n]{0,40}audio-manifest\.json/i.test(h);
A("Gate 10b) 'audio-manifest.json' fetch argümanı değil (yalnız yorum)", !jsonRefInCode);

// tüketim yok (bu adımda ölü veri — speak entegrasyonu ayrı commit)
const consumers = (h.match(/AUDIO_MANIFEST/g) || []).length;
A("bu adımda tüketici yok (2 anchor + 1 bildirim = 3)", consumers === 3, `${consumers} geçiş`);

// entries bütünlüğü (harness ile örtüşür)
A("entries 335 kayıt", embedded && embedded.entries.length === 335);
A("_meta.pedagojik_hukum gömülü", !!(embedded && embedded._meta && embedded._meta.pedagojik_hukum));

console.log(fail === 0 ? "\n✅ GÖMME KAPILARI GEÇTİ (Gate 7 & 10)" : "\n❌ " + fail + " başarısız");
process.exit(fail === 0 ? 0 : 1);
