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
