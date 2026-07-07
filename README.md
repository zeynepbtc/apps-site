# zeynepkaya.app

`www.zeynepkaya.app` ve altındaki uygulamaların kaynak deposu. Depo kökü doğrudan site köküne karşılık gelir; klasör yapısı URL yapısını birebir yansıtır.

## Yapı

```
.
├── index.html            ← LANDING SAYFAN buraya (www.zeynepkaya.app)   [şu an ekli değil, sen ekle]
├── matreflex/            ← www.zeynepkaya.app/matreflex/  (MatReflex uygulaması)
│   ├── index.html            uygulamanın kendisi (tek dosya PWA)
│   ├── sw.js                 service worker (offline + cache)
│   ├── manifest.webmanifest  PWA manifesti
│   ├── icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png
│   ├── apple-touch-icon.png, favicon-16.png, favicon-32.png
│   ├── fonts/                Fredoka, Inter, Fraunces (woff2)
│   ├── privacy/index.html    → /matreflex/privacy   (Gizlilik Politikası)
│   ├── terms/index.html      → /matreflex/terms      (Kullanım Koşulları)
│   └── support/index.html    → /matreflex/support    (Destek)
│
├── scripts/              ← geliştirme araçları (SUNUCUYA GİTMEZ, sadece repoda)
│   └── validate-content.js   içerik/matematik doğrulama (bağımlılıksız)
│
└── docs/                 ← tasarım ve planlama belgeleri (SUNUCUYA GİTMEZ)
    ├── matreflex-tasarim-dili.md        Fiziksel Arayüz Dili (felsefe)
    ├── matreflex-tasarim-sifreleri.md   tokenlar, bileşenler (nasıl)
    ├── matreflex-release-audit.md       yayına hazırlık denetimi
    └── matreflex-rc-report.md           release candidate raporu
```

## Neyin nereye gittiği (özet)

**Sunucuya / yayına giden (kullanıcı bunları görür):**
- Kök `index.html` (landing) ve `matreflex/` klasörünün TAMAMI.
- Bunlar `www.zeynepkaya.app/...` altında yayınlanır.

**Sadece repoda duran (kullanıcı görmez, dağıtıma gerek yok):**
- `scripts/` (doğrulama aracı)
- `docs/` (tasarım/planlama belgeleri)
- `.gitignore`, `README.md`

## Önemli: tek doğru dosya

Uygulamanın tek doğru kaynağı **`matreflex/index.html`**'dir. Daha önce sana ayrıca gönderdiğim `mental-math-app.html` ile bu dosya birebir aynıdır; sunucuda sadece `matreflex/index.html` gerekir. İki kopya tutma, zamanla birbirinden ayrışır.

## Dağıtım

Depo kökü = site kökü olacak şekilde deploy et:
- **GitHub Pages:** repoyu bağla, kaynak olarak kök (root) seç. `matreflex/` otomatik olarak `/matreflex` altında yayınlanır. (İstersen kökte boş bir `.nojekyll` dosyası ekle ki Jekyll işleme karışmasın.)
- **Netlify / Cloudflare Pages / Vercel:** repoyu bağla, publish/output dizini = kök (`/`). Build komutu yok (statik site).
- **Kendi sunucun:** `matreflex/` klasörünü olduğu gibi `/matreflex/` altına koy; landing `index.html`'i köke.

Her dağıtımda **`matreflex/sw.js` içindeki `CACHE` sürümünü artır** (şu an `matreflex-v19`). Yoksa eski önbellek yüzünden değişiklikler görünmeyebilir.

## İçerik doğrulama

```
node scripts/validate-content.js
```
`matreflex/index.html` içindeki tüm yöntem ve alıştırma cevaplarını hesaplayıp kontrol eder. Bağımlılık gerektirmez (jsdom yok). Dağıtımdan önce çalıştır; hata varsa çıkış kodu 1 döner.

## Sonraki uygulamalar

Aynı desende, kök altında kardeş klasörler olarak eklenir:
```
japanese-flick/   → www.zeynepkaya.app/japanese-flick/
japanese-atlas/   → www.zeynepkaya.app/japanese-atlas/
lgs-yks/          → www.zeynepkaya.app/lgs-yks/
```
Her biri kendi `privacy/`, `terms/`, `support/` alt sayfalarını taşır. Ortak tasarım dili `docs/` altındaki belgelere dayanır.

## İletişim

hello@zeynepkaya.app
