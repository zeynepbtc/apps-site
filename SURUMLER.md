# Zeynep Kaya Apps — Web Sitesi Sürüm Günlüğü

> Bu dosya **sitenin** sürüm kaydıdır (uygulamaların kendi sürümlerinden ayrı).
> Kaynak: bu repo · Canlı: https://zeynepkaya.app (GitHub Pages).
> Sürüm iki yerde tutulur: **bu dosyanın en üstü** + **ana sayfa footer'ı**. İkisini birlikte güncelle.

## Sürüm kuralları (ne artar?)
| Tür | Ne zaman | Örnek |
|-----|----------|-------|
| **MAJOR** `x.0.0` | Komple yeniden tasarım / yepyeni büyük bölüm | Site baştan tasarlanırsa |
| **MINOR** `1.X.0` | Yeni **oyun**, yeni **araç**, yeni **uygulama sayfası** | İkinci oyun, flip-kart aracı, Atlas sayfası |
| **PATCH** `1.0.X` | Mevcut oyun/araç/sayfada iyileştirme, düzeltme, tasarım rötuşu | Oyunun masaüstü penceresi |
| **sürüm YOK** | Sadece metin/duyuru/içerik değişikliği | Yazı düzeltme, tarih güncelleme |

## Senkron kontrolü (HDD ↔ GitHub) — "güncel miyiz?"
- **GitHub Desktop:** üstte "Push origin **0**", "Pull **0**" ve solda "**No local changes**" görünüyorsa → HDD ile GitHub **tam eşit**.
- "Push origin **N↑**" = bilgisayarında N commit GitHub'a gitmemiş → **Push** et.
- "Pull **M↓**" = GitHub'da M değişiklik sende yok → **Pull** et.
- Altın kural: değiştirmeden önce **Pull** → **Commit** → **Push**.

## Yayın ritüeli (her sürümde)
1. Değişikliği yap (oyun/araç/sayfa).
2. SURUMLER.md'ye yeni sürüm gir-disini ekle + ana sayfa footer'daki sürümü güncelle.
3. GitHub Desktop: Summary = `site vX.Y.Z: kısa açıklama` → Commit → (gerekiyorsa Pull) → Push.

---

## Geçmiş

### v1.10.0 — 2026-07-16
- 🎮 **Üç yeni retro/aksiyon oyunu** (retro/2D araştırması sonrası — sıralı: Köstebek → Yılanı → Uzay). Üçü de brand standardına uygun: tek dosya, TR/EN, pill geri-dönüş, oyun logosu, çizgi-ikon, `speak()` TTS, yumuşak hata sesi, en-iyi skoru localStorage'da.
  - **Kana Köstebek** (`/oyunlar/kana-kostebek/`) — Whack-a-Mole. Okunuş seslenir+yazılır → doğru kanayı taşıyan köstebeğe vur. 60 sn, kombo, 5 seviye (sesli→hepsi). **Dinleme** boşluğunu doldurur (ses→kana).
  - **Kana Yılanı** (`/oyunlar/kana-yilani/`) — Snake (canvas). Yılanı kaydır, kelimenin kanalarını **doğru sırada** ye, yanlıştan kaç; yedikçe uzar. Duvarlar sarmalı, 3 can, kelime bitince +bonus & hızlanır. **Sıralı heceleme.**
  - **Kana Uzay** (`/oyunlar/kana-uzay/`) — Space Invaders (canvas). Gemi oto-ateş; kaydırarak doğru kananın altına gel, yere inmeden vur. Kombo, 3 can, 5 seviye. **Hızlı tanıma + refleks.**
- Home + Japanese Flick oyun ızgaralarına 3 kart (brand `.gi` ikon), sitemap'e 3 URL eklendi. Doğrulama: 3 oyunda 0 JS hatası, oynanış + skor + can + ses akışları Playwright ile test, ekran görüntüleriyle onaylandı.

### v1.9.10 — 2026-07-16
- 🐞 **Kana oyunları — dil hatası düzeltildi.** TR modunda üst topbar marka alt-yazısı + mod alt-metinleri **hem TR hem EN** gösteriyordu (`.brand small` / `.opt small` kuralları `.en{display:none}`'ı specificity ile eziyordu). Çözüm: `body:not(.lang-en) .en{display:none}` (specificity 0,2,0 → container kurallarını yener, `!important` yok). 3 kana oyununa uygulandı. Doğrulama: TR modunda yalnız TR, EN modunda yalnız EN görünüyor (brand + mod alt-metinleri), 0 JS hatası. (Not: Takımyıldızı `ICON` kelime-emoji haritası Zeynep kararıyla şimdilik olduğu gibi bırakıldı.)

### v1.9.9 — 2026-07-16
- 🗑️ **Yokai Mail siteden kaldırıldı** (Zeynep kararı: "çok bi ilerleyeceği yok, kalıcı kaldır" → retro/aksiyonlu oyunlara yöneleceğiz). Home + Japanese Flick oyun ızgaralarından kart, sitemap girdisi, oyun dizini ve kod yorumu temizlendi. (Takımyıldızı/Yağmuru/Market kalıyor ve geliştirilecek.)
- 🎨 **Kana oyunları — emoji rozet temizliği (ikon diline uyarlama).** Dekoratif emojiler monokrom **brand çizgi-ikonlarına** çevrildi (`.eico`, currentColor): Kana Yağmuru → yağmur badge, kalem notu, mod ikonları (bayrak/sonsuz), hız ikonları (1/2/3 chevron), canlar (SVG kalp), bitiş ekranı emojileri kaldırıldı. Takımyıldızı → kalem notu + 5 başarı rozeti (yıldız/parıltı/ışın/hilal/harita SVG, altın). Kana Kartları → footer emoji temizlendi. İşlevsel 🔊/🔇 ve ▶/⏸ ile ← → okları korundu; Takımyıldızı'nda tematik ✦ yıldızları (badge/can) korundu. Doğrulama: 3 oyunda 0 JS hatası, ikonlar ekran görüntüsüyle onaylandı.
- **Kalan (ayrı iş):** Takımyıldızı'ndaki oyun-içi kelime→emoji `ICON` haritası (~50 emoji) hâlâ emoji — özel ikon çizimi büyük iş, Zeynep onayı bekliyor. Ayrıca kana oyunlarında **önceden var olan** dil hatası: TR modunda üst başlık marka alt-yazısı + mod alt-metinleri hem TR hem EN gösteriyor (`small.en` `.en{display:none}`'ı eziyor).

### v1.9.8 — 2026-07-16
- 🛒 **Konbini — vitrin çeşitliliği + görünür yenileme** (Zeynep: "2 müşteride bir vitrin yenilenecek gibi değiştir, ürün çeşidini de arttır"). (1) **Ürün havuzu 14 → 24** (yeni: balık, et, çilek, mandalina, sandviç, ramen, puding, salata, pirinç krakeri, çikolata — her biri TR/EN + kendi SVG glifi). (2) **Vitrin her 2 müşteride TAM yenileniyor:** yeni raf, önceki raftaki ürünlerin **dışından** seçiliyor (`buildShelf()` + `prevIds`) → art arda raflarda **0 örtüşme**, bir vardiyada **~22 farklı ürün** görülüyor (eski halde tekrar hissi vardı). Doğrulama: JS geçerli, 24 ürünün hepsi tam, art arda raf örtüşmesi 0, 0 hata. **İleriye not:** "N seviyesine göre vitrin" fikri kaydedildi (JLPT kademeli havuz).

### v1.9.7 — 2026-07-16
- ↩️ **Kana oyunlarına "← Oyunlar" geri-dönüş butonu** (Zeynep: "Kana Yağmuru ve Takımyıldızında hâlâ oyunlara dönüş yok"). Üç kana oyununa (Kana Yağmuru, Kana Takımyıldızı, Kana Kartları) diğer oyunlarla aynı **kenarlıklı/gölgeli pill** buton eklendi → `/#oyunlar` (ana sayfa oyun ızgarası), TR/EN çift dilli ("← Oyunlar / ← Games"). Takımyıldızı gece temasına uygun koyu varyant. Doğrulama: 3 oyunda buton görünür, doğru hedef, TR/EN geçişi, 0 JS hatası. (Not: bu oyunların topbar'ındaki marka linki hâlâ Japanese Flick sayfasına gidiyor; emoji temizliği + tam standart hizalaması ayrı bir bekleyen iş.)

### v1.9.6 — 2026-07-16
- 🌐 **Yokai Mail — iki dilli (TR/EN) + ortak oyun dili.** Konbini ile aynı desen: TR/EN dil hapı (`zk_lang` ile kalıcı, dil değişince açık ekran yeniden çiziliyor), kenarlıklı/gölgeli **"← Oyunlar / ← Games" geri-dönüş** butonu, tüm statik + dinamik metinler çift dilli (giriş/yardım adımları/gelen kutusu/mektup türü-anlam/ödül/bitiş), her yokai için EN tür+anlam+yanıt çevirisi. **Yanlış cevapta yumuşak ses** (`softError`, Web Audio) eklendi. Doğrulama: JS geçerli (bir apostrof kaynaklı sözdizimi hatası düzeltildi), TR/EN geçişi + oynanış + hata sesi çalışıyor, 0 sayfa hatası.

### v1.9.5 — 2026-07-16
- 🎛️ **Oyun cilası (Zeynep geri bildirimi).** (1) **"← Oyunlar" dönüşü belirgin buton** oldu (ince link yerine kenarlıklı/gölgeli pill) — Konbini + Yokai Mail. (2) **Konbini rafı daha sık yenileniyor:** her 4 → **her 2 müşteride** (vardiya boyunca 4 kez değişir). (3) **Yanlış cevapta yumuşak ses** (Web Audio, alçak sesli nazik "boop", kırıcı değil) — Konbini. Standart: dönüş butonu + nazik hata sesi diğer oyunlara da taşınacak.

### v1.9.4 — 2026-07-16
- 🔁 **Konbini — raf her 4 müşteride yenileniyor** (Zeynep: "sıkıcı olmasın"). Vardiya artık iki bölüm: müşteri 1-4 bir raf, 5-8 yeni bir raf (rastgele 8 ürün) → vardiya içinde de çeşitlilik. Hedef ürün her müşteride güncel raftan seçiliyor.

### v1.9.3 — 2026-07-16
- 🌐 **Konbini Shift — iki dilli (TR/EN) + ortak oyun dili.** Oyun tasarım standardı (claude/oyun-tasarim-standardi.md) doğrultusunda: ince "← Oyunlar / ← Games" geri-dönüş → `/#oyunlar`, TR/EN dil hapı (`zk_lang` ile kalıcı, site ile aynı), tüm statik + dinamik metinler çift dilli (intro/adımlar/HUD/yardım/kelime defteri/bitiş), 14 ürüne EN anlamlar. Emoji temizliği (dekoratif 🏮 kaldırıldı; sadece işlevsel 🔊 kaldı). Diğer oyunlara da (Yokai + kana oyunları) aynı desen uygulanıyor.

### v1.9.2 — 2026-07-16
- 🛒 **Konbini Shift — iki düzeltme** (Zeynep bildirdi). **(1) Ses kesilmesi:** müşteri "ありがとうございました" derken sonraki müşterinin sesi araya girip "arigatoug" gibi kesiyordu → artık teşekkür sesi bitince (`utterance.onend`) sıradaki müşteriye geçiliyor (2.4sn fallback). **(2) Ürün çeşitliliği:** her vardiyada aynı 8 ürün dönüyordu → ürün havuzu 8→**14**'e çıkarıldı (süt, elma, muz, meyve suyu, kek, atıştırmalık eklendi) ve her vardiya rastgele **8 farklı ürün** seçiyor; vardiyalar artık birbirinden farklı. Doğrulama: iki vardiyanın rafı farklı, 0 JS hatası.

### v1.9.1 — 2026-07-16
- 🔤 **Türkçe karakter (ş/ğ/İ/ı) düzeltmesi** (Zeynep bildirdi). Oyun/araç/hakkımda sayfalarındaki **Klee One** ve **Shippori Mincho** fontları Türkçe özel harfleri taşımıyor, o harfler sistem fontuna düşüp kelime ortasında bozuk görünüyordu. Çözüm: **Nunito** (tam Türkçe destekli, sıcak) eklendi; font yığınları `"Nunito","Klee One"` ve `"Shippori Mincho","Nunito"` yapıldı → Latin/Türkçe harfler Nunito'da tutarlı, Japonca kana/kanji hâlâ Klee One/Shippori'de. 8 sayfa: 5 oyun (Konbini, Yokai Mail, Kana Yağmuru/Takımyıldızı/Kartları) + 2 araç (Hiragana/Katakana) + /hakkimda. Ana sayfa/JF/yasal sayfalar Inter kullandığı için zaten sorunsuzdu.

### v1.9.0 — 2026-07-16
- 🎮 **Yeni web oyunu: Konbini Shift** (`/apps/japanese-flick/oyunlar/konbini/`). Japonca alışveriş/servis oyunu: konbinide tezgâhtasın, müşteri "〜を ください" der, raftan doğru ürünü verirsin → müşteri "ありがとうございました", kasaya ¥ + seri bonusu, kelime defteri. 8 ürün (おにぎり/パン/お茶/水/コーヒー/たまご/べんとう/アイス, sade SVG glifleri), vardiya = 8 müşteri, ja-JP ses, "okunuş+anlam" ipucu, açılış/nasıl-oynanır ekranı. Ana sayfa + JF Oyunlar ızgarasına kart (alışveriş poşeti glyph + gold blok), sitemap + canonical. Zeynep'in 12 mini oyun listesindeki 1 numara. Doğrulama: 8 müşteri servis + yanlış cevap testi, 0 JS hatası.

### v1.8.1 — 2026-07-16
- 📣 **App Store duyurusu netleştirme** (Zeynep geri bildirimi). Ana sayfa hero JF kartındaki siyah **"Yakında" rozeti** → "App Store'da yayında · Google Play yakında" (App Store linkine bağlı). Hero CTA'ya **"App Store'da İndir"** birincil düğmesi (indirme yukarı taşındı). Mini-zaman çizelgesindeki "Kapalı beta test aşamasında" → "App Store'da yayında (16 Tem); Google Play (Android) yakında". JF hero durum satırı "App Store'da yayında · Google Play'de yakında"; og:description güncellendi. Artık hiçbir yerde yanıltıcı "kapalı beta/yakında" yok.

### v1.8.0 — 2026-07-16
- 🎉 **Japanese Flick App Store'da YAYINDA** (16 Tem 2026, ilk sürüm). Site duyurusu güncellendi: JF hero eyebrow "App Store'da Yayında", hero + duyuru bölümünde **"App Store'da İndir"** düğmesi (link: apps.apple.com/app/japanese-flick/id6789942860, yeni sekme), durum satırı + release kartı metni yenilendi. Ana sayfa "Güncellemeler" kartı "artık App Store'da" oldu + indir düğmesi. **QR kod** eklendi (`/apps/japanese-flick/appstore-qr.svg`, ink renkli) hero/duyuruya. Ton: sakin, iddiasız. Not: resmi Apple "Download on the App Store" rozeti yerine şimdilik sitenin dilinde metin düğme (Apple rozeti sonra eklenebilir). Google Play hâlâ kapalı beta.

### v1.7.2 — 2026-07-16
- ✏️ **Yōkai Mail — Türkçe çeviri düzeltmeleri** (Zeynep testte fark etti). "Bugün yağmurlu" → "Bugün hava yağmurlu"; "Yağmurlu günü severim" → "Yağmurlu günleri severim … yürüyüşe çıktım"; Kitsune'de "___ da yaşıyorum" (dağ da) → "___da yaşıyorum" (dağda, doğru ek); küçük noktalama. Anlam-dilbilgisi uyumu düzeltildi.

### v1.7.1 — 2026-07-16
- 🧭 **Yōkai Mail — onboarding.** Zeynep testte "ne yapılacağı, yokai'lerin kim olduğu, amaç anlaşılmıyor" dedi → oyuna **açılış/nasıl oynanır ekranı** eklendi (yokai nedir + 3 adım: mektubu oku · eksik kelimeyi kana ile yaz · kelimeni topla + amaç), ilk açılışta gelir (localStorage `yokaimail_seen`), üstteki **"?"** düğmesiyle tekrar açılır. Mektup ekranında yönerge netleştirildi + "okunuş+anlam" ipucu satırı. Doğrulandı (açılış→başla→oyna akışı, 0 JS hatası).

### v1.7.0 — 2026-07-16
- 🎮 **Yeni web oyunu: Yōkai Mail** (`/apps/japanese-flick/oyunlar/yokai-mail/`). Merak temelli Japonca kelime oyunu: yokai'lerden gelen N5 mektuplarında eksik kelimeyi **kana karolarını dokunarak yaz** (şık seçme değil — Flick'in "yazma" ruhu web'de); doğruda yokai cevap verir + kelime **Kelime Defteri**'ne eklenir (kanji + kana + anlam + ja-JP ses). 5 yokai (Nekomata/Karakasa/Yuki-onna/Kappa/Kitsune), koleksiyon + seri sayacı (localStorage), "yarın gelir" kilitli zarf. Ana sayfa + JF tanıtım Oyunlar ızgarasına kart (Flick ikon dili, zarf glyph + teal blok), sitemap + canonical. Okuma web / cevap Flick köprüsü ileride. Doğrulama: baştan sona oynanış (kana-yaz → ödül → defter), 0 JS hatası.

### v1.6.6 — 2026-07-16
- 🐞 **Kırık logo düzeltmesi.** v1.6.4'teki v79 deploy'unda `/japanese-flick/icons/` klasörü PWA ikon setiyle değişince iki pazarlama varlığı düşmüştü: `logo-square.svg` (JF logosu — 5 yerde: ana sayfa Flick kartı, JF tanıtım hero'su, kana-takımyıldızı/kana-kartları/kana-yağmuru oyun başlıkları) ve `appicon-rounded-512.png` (favikon/apple-touch-icon — 6 sayfada). İkisi de **git geçmişinden orijinalleriyle geri getirildi** (yeni PWA ikonlarına dokunulmadı). Tüm site tarandı: başka kırık yerel varlık referansı yok.

### v1.6.5 — 2026-07-16
- 🧹 **Temizlik (içerik ağacı kararları):** eski/linksiz `japanese-flick/sss-yardim.html` **silindi** (yeni /sss/ zaten var; hiçbir yerde referans yok, sw.js cache'lemiyor → güvenli). **stock-ui** (Zeynep'in stock çekimleri için hazırladığı telifsiz mobil arayüz görselleri; ürün değil) `robots.txt`'te **Disallow** → aramada çıkmaz ama URL ile erişilir (çekimde kullanılıyor). MatReflex: şimdilik gizli dursun (değişiklik yok).

### v1.6.4 — 2026-07-16
- ⬆️ **Japanese Flick canlı web (PWA) v76 → v79 güncellendi** (`/japanese-flick/`). HDD kaynağındaki (Capacitor `www`) v79 uygulama çekirdeği deploy edildi: `index.html` (385 KB) + `sw.js` (jflick-v79) + ~280 yeni ses/ikon varlığı (409 → 689). **Yasal sayfalar (SSS/Destek/Gizlilik/Şartlar) reskin'li hâlleriyle korundu**, dokunulmadı. Notlar: Play native app zaten Capacitor (gömülü assetler) → bu web PWA'sı ondan bağımsız ayrı yayındır; iOS build hâlâ v76 (ayrı iş). App index'inde em-dash var (Zeynep'in ürün kodu, native ile eşleşsin diye deploy sadık tutuldu).

### v1.6.3 — 2026-07-16
- ⚖️ **Yasal sayfalar (SSS · Destek · Gizlilik · Şartlar) tek iskelete çekildi:** site topbar (Zeynep Kaya Apps markası + TR/EN dil hapı), **dil kalıcılığı** (`zk_lang` → dil artık sayfalar arası hatırlanıyor), footer'a Hakkımda linki + fikri mülkiyet/haklar notu. Sayfa içerikleri (SSS akordeonları, metinler) **aynen korundu**. **Em-dash'ler temizlendi** (meta açıklamalar + gizlilik metni). Test: TR/EN geçişi + kalıcılık ✓, 0 JS hatası.

### v1.6.2 — 2026-07-16
- 🔁 **Japanese Flick ana sayfasına Oyunlar/Araçlar sistemi taşındı** (ana sayfayla birebir aynı): uniform oyun kartları + Araçlar "çalışma panosu" + Flick ikon dili; nav'a Araçlar linki. Bütün sayfaların iskeleti tek dilde.
- 🐛 **Dil bug'ı düzeltildi:** JF hero'daki telefon maketi (Klavye Pratiği başlığı, Hiragana/Katakana panelleri, Tekrar/Reflex Dojo/Serbest Yazma satırları) sabit İngilizceydi → TR modda Türkçe çıkacak şekilde dil-duyarlı yapıldı.
- 🐛 **JF `#year` null hatası** giderildi (footer'a `<span id="year">`) → JS hatası bitti, device parallax çalışıyor (ana sayfadaki v1.4.2 fix'inin JF karşılığı).

### v1.6.1 — 2026-07-16
- ✍️ **/hakkimda metni yenilendi** (Zeynep'in genişlettiği sürüm): "hayat ilginç yollar çiziyor", doğuş hikâyesi diyaloğu ("Bu kadar da zor olamaz herhalde." / "Meğer olabiliyormuş."), "yapay zekâ dostlarım", "bir arka kapıdan girmeyi başardım", "bazı şeylerin doğru zamanı yokmuş". TR + EN, em-dash yok.
- 🧭 **Kana Kartları'na "← Araçlar" geri linki** eklendi (panoya döner, ana sayfaya değil) → araçlar arası kolay dolaşım.

### v1.6.0 — 2026-07-16
- 🎮🧰 **Ana sayfa Oyunlar/Araçlar yeniden tasarımı** yayında. Oyunlar: öne çıkan poster yok, **hepsi aynı boyda uniform kart** (Takımyıldızı, Yağmuru, +yeni). Araçlar: yeni **"çalışma panosu"** (sıcak zeminli pano, küçük pinli ikonlar). **Kana Kartları oyun→araç** olarak panoya taşındı. Giriş paragrafı kalktı. Tüm ikonlar **Flick ikon dilinde** (emoji yok). Nav'a Araçlar linki.
- 📄 **Hiragana & Katakana çalışma kâğıtları** eklendi (`/apps/japanese-flick/araclar/hiragana|katakana/`) — gojūon + dakuten + yōon tam tablolar, okunuşlu, iki dilli; sitemap + canonical/OG.
- 🙋‍♀️ **/hakkimda:** EN metindeki uzun tireler (—) kaldırıldı; sona **İletişim** (hello@zeynepkaya.app); footer'a **fikri mülkiyet / tasarım hakları** notu.
- ⚖️ Ana sayfa footer'ına "tüm tasarım, görsel dil ve fikirler Zeynep Kaya'ya aittir, tüm hakları saklıdır" notu.

### v1.5.0 — 2026-07-16
- 🙋‍♀️ **/hakkimda sayfası** eklendi (iki dilli TR/EN) — Zeynep'in kendi sesinden, sade & samimi bir tanıtım: fotoğrafçı-videograf (Getty Images, 13 yıl), Sanat Tarihi + NYFA sinematografi; çocukluğundan beri oyun yapma hayali; Japanese Flick'in doğuş hikâyesi; "tasarım bana ait, kodda yapay zekâ desteği" dürüstlüğü. **Japandi** atmosferi: dar sütun, bol boşluk, tek aksan, ikon dilinde küçük "oyun/zar" işareti + はじめまして dokunuşu. Nav + footer + sitemap linklendi; canonical/OG/JSON-LD (ProfilePage/Person) + Cloudflare beacon.

### v1.4.3 — 2026-07-16
- 🔄 Kana Takımyıldızı: **döndürme/adres çubuğu bug'ı** giderildi. Telefonda kelime ortasında ekran yeniden boyutlanınca (adres çubuğu gizlenmesi / oryantasyon) gökyüzü sıfırdan çiziliyor, çizgiler ve yanan yıldızlar kayboluyordu → artık yıldızlar oransal konuma göre **yerinde taşınıyor**, ilerleme hiç bozulmuyor.
- 📱 **Çentik/safe-area** desteği: `env(safe-area-inset-*)` ile üst bar ve alttaki CTA çentikli iPhone'larda kesilmiyor.
- ▶ Oyun sonu **"Tekrar çiz"** artık tek dokunuşla doğrudan yeni oyunu başlatıyor (hero ekranına dönmüyor).

### v1.4.2 — 2026-07-16
- 🩹 Ana sayfa: footer'da olmayan `#year` öğesine erişen script satırı `null` hatası verip **parallax'ı durduruyordu** → footer yılı `<span id="year">` yapıldı (hata bitti, parallax çalışıyor, yıl otomatik güncelleniyor).

### v1.4.1 — 2026-07-16
- 🎲 Kana Takımyıldızı: kelime seçimi **"torba" (bag) yöntemine** geçti — havuzdaki her kelime bir kez çıkmadan tekrar etmiyor, aynı kelime peşpeşe gelmiyor. Çok daha bol çeşit.

### v1.4.0 — 2026-07-16
- 🌌 **Kana Takımyıldızı** web oyunu eklendi — `/apps/japanese-flick/oyunlar/kana-takimyildizi/`. Gece göğü estetiği; kelimenin kanalarını sırayla birleştirip takımyıldız çiz (doğru → yıldızlar parlar + kelime ja-JP sesle okunur + koto). 2→3→4 hece kademeleri, çeldirici benzer kanalar, 3 can, seri.
- 🏆 **Kişisel rekor + rozet katmanı** (localStorage `zkStats`, tüm web oyunlarının paylaşabileceği): en yüksek puan, en uzun seri, toplam takımyıldız + 5 rozet.
- 🧭 Ana sayfa + JF sayfası oyun bölümüne kart; sitemap'e eklendi. Geliştirme notu: gramer/cümle modu, kelime haznesi büyütme, Flick içi sürüm (FIKIRLER-defteri'nde).

### v1.3.5 — 2026-07-15
- 📊 **Cloudflare Web Analytics** eklendi (8 sayfa, oyunlar dahil): çerezsiz, bannersız ziyaretçi + sayfa + kaynak ölçümü. Test fazını artık ölçebiliriz.

### v1.3.4 — 2026-07-15
- 🦶 Footer sadeleşti: **Japanese Flick linki kaldırıldı** (footer = Ana sayfa + SSS + yasal sayfalar; uygulama linkleri footer'a girmez). Aralık sıkıştırıldı, alt satıra taşma azaldı.

### v1.3.3 — 2026-07-15
- 🦶 **Tek ortak footer** tüm içerik sayfalarında (ana sayfa, JF, Gizlilik/Şartlar/Destek/SSS): Ana sayfa · Japanese Flick · SSS · Destek · Gizlilik · Şartlar. Aynı stil, aynı linkler, home dahil.

### v1.3.2 — 2026-07-15
- 🔙 Yasal sayfalara (Gizlilik/Şartlar/Destek/SSS) **Japanese Flick'e dönüş** butonu.
- 🎨 Eski bordo/terracotta renkler → **turuncu tonlarımız** (#d3813a / #bf6f2b); あ gradient işareti → **gerçek Flick logosu**.

### v1.3.1 — 2026-07-15
- 🎨 Yasal sayfalar (Gizlilik/Şartlar/Destek/SSS) tasarım diline hizalandı: **favicon (app logosu)** eklendi, gövde fontu **Inter**'e çekildi, palet token'ları siteyle eşitlendi (Shippori başlıklar + terracotta aksan korundu). Artık aynı dil.

### v1.3.0 — 2026-07-15
- 📄 Japanese Flick sayfası footer'ına yasal/yardım linkleri: **SSS · Destek · Gizlilik · Şartlar** (sade satır, en altta; güven verir, öne çıkmaz).
- 🔎 **SEO temeli:** sitemap.xml + robots.txt; ana sayfa ve JF sayfasına canonical + tam Open Graph + Twitter kartı + JSON-LD (Organization/WebSite + SoftwareApplication). Google artık siteyi doğru okuyabilir.

### v1.2.0 — 2026-07-15
- 🧭 **Birleşik navigasyon.** Dağınık oyun linkleri kaldırıldı (JF hero butonu, ayrı nav linkleri, kart pill'leri). Artık her sayfada tek tutarlı **"Oyunlar & Araçlar"** bileşeni + tek **"Oyunlar"** nav linki (ana sayfa + Japanese Flick; Atlas geldiğinde aynı düzen). Amaç: kimse kaybolmasın, 5 yaşında bile yolunu bulsun.
- 🏷️ Stüdyo logosu PNG faviconlarla da geliyor (adres çubuğu + tarayıcı kısayolları): favicon-32, apple-touch-180.

### v1.1.5 — 2026-07-15
- 🎮 Ana sayfaya **oyun bölümü** eklendi (hero altı): süzülen (floating) kartlar — Kana Yağmuru, Kana Kartları, "yakında" + Kanji Atlas'a yol. "İndirmeden oyna, hazır olunca app'le yaz" kancasıyla.

### v1.1.4 — 2026-07-15
- 🏷️ **Zeynep Kaya Apps stüdyo logosu**: topbar'daki "ZK" yer tutucu yerine gerçek mark (fırça/hareket, palet renkleri: kiremit + sarı + tatlı mavi, krem zemin). Ana sayfa faviconu da bu logo oldu.

### v1.1.3 — 2026-07-15
- 🩹 JF sayfası hero logosu havada/bağlamsız duruyordu → küçültülüp **beta rozetiyle aynı satıra** (app başlığı gibi) yerleştirildi.

### v1.1.2 — 2026-07-15
- 🩹 Logo yerleşim düzeltmesi: ana sayfadaki JF kartında gerçek logo, telefon maketinin içinde yazıyla çakışıyordu → logo **kart başlığına** (Beta rozetinin yanına) taşındı; maket kendi çizili ikonuna döndü.

### v1.1.1 — 2026-07-15
- 🎨 Japanese Flick **gerçek logosu** sitede: JF sayfası hero'suna logo rozeti, ana sayfadaki JF kartındaki çizili ikon → gerçek app logosu (vektör SVG). Ayrıca favicon + apple-touch ikonu + sosyal paylaşım görseli (feature graphic, og:image + twitter card).

### v1.1.0 — 2026-07-15
- 🃏 **Kana Kartları** flip-kart öğrenme aracı eklendi — `/apps/japanese-flick/oyunlar/kana-kartlari/`. Gojūon ısı-haritası ızgarası; karta dokun → 3B çevrilir (ön: kana → arka: romaji + öbür yazıdaki eş). Hiragana/Katakana ön yüz seçimi, "hepsini çevir", çevirince yumuşak nota. Ana sayfa + JF sayfasına link.

### v1.0.7 — 2026-07-15
- 🎼 Yakalama melodisi **Kōjō no Tsuki** (Taki Rentarō, geleneksel) oldu — zarif, sakin. (Sakura kodda duruyor; tek satır MEL değişimiyle geri alınır.)

### v1.0.6 — 2026-07-15
- 🎶 Yanlış/kaçan yakalamada sert 'buzz' yerine artık yumuşak, kibar bir **nota** çalıyor — her dokunuş müzikli, hiçbiri çirkin değil.

### v1.0.5 — 2026-07-15
- 🎵 Kana Yağmuru sesi **melodiye** dönüştü: doğru yakalayışlar artık tek tek **Sakura Sakura** (geleneksel) ezgisini çalar — seri büyüdükçe melodi ilerler, hata sıfırlayınca baştan başlar. En tiz notada takılıp tekrarlama sorunu giderildi.

### v1.0.4 — 2026-07-15
- 🔊 Kana Yağmuru'na **ses & juice**: doğru yakalayınca seri büyüdükçe skalada tırmanan koto/pentatonik tını, nazik hata sesi, seviye geçişinde minik koto koşusu. Yakalama dalgası (ripple) + **combo (×N)** göstergesi. **Ses aç/kapa** düğmesi (tercih hatırlanır). Sakin, elit, Japon esintili.

### v1.0.3 — 2026-07-15
- 🎮 **Kana Yağmuru** web oyunu eklendi — `/apps/japanese-flick/oyunlar/kana-yagmuru/`. Seviye Yolculuğu + Sonsuz mod, 12 seviye (あ satırı → tüm hiragana → katakana → benzeyenler tuzağı), hız seçimi, pause, okul-el-yazısı kana fontu (Klee One). Sadece okuma; yazma app'e saklı.
- 🔗 Ana sayfa ve Japanese Flick sayfasına oyun linki eklendi.
- 💻 Masaüstünde ortalanmış sabit oyun penceresi + alt güvenli boşluk (14"+ için rahat).
- ✍️ Japanese Flick tanıtım metni sadeleştirildi (kıyas dili çıkarıldı).

### v1.0.0 – v1.0.2 — temel (2026-07 öncesi baz)
- Studio ana sayfası (Japanese Flick · Japanese Kanji Atlas · MatReflex · LGS-YKS kartları).
- Japanese Flick tanıtım sayfası + gizlilik / SSS / iletişim sayfaları.
- GitHub Pages yayını + özel alan adı (zeynepkaya.app), Open Graph başlangıcı.
