# MatReflex — Release Candidate Raporu

Tarih: 2026-07-07 · Build: sw.js cache v17 · Yöntem: kod incelemesi + jsdom otomatik akış/matematik testleri (gerçek cihaz render'ı hariç)

---

## Düzeltilen hatalar / yapılan işler

- **Ayarlar ekranı yeniden kuruldu.** Sorunlu "rib" accordion bileşeni tamamen kaldırıldı. Ayarlar artık dümdüz, her zaman görünür bir kart (`setcard`): Hareketi azalt ve Dil satırları doğrudan görünüyor, tıklanacak başlık yok, "boş/takılmış buton" hissi bitti. Toggle rengi için `--a` set edildi (yoksa görünmez kalıyordu), toggle'a klavye desteği (Enter/Space) eklendi.
- **İlerleme satırı doğrudan buton.** Tek dokunuşta `show('progress')`; ikinci adım aramaya gerek yok.
- **Dil satırı pasif bilgi etiketi.** Aksan renkli buton gibi görünmüyor.
- **Ölü kod temizlendi.** HOME_CARDS kart-yığını sistemi (`HOME_CARDS`, `buildHomeCards`, `applyHomeLayout`, `setHomeOpen`, `onHomeCardTap` ve yükleme çağrısı) kaldırıldı; `#hStage` HTML'de olmadığı için zaten no-op'tu. `soon()` fonksiyonu ve `.soon-badge` CSS'i (kullanılmıyordu) kaldırıldı. `.hcard` (işlem kartları) ve `homefab` korundu.
- **İçerik doğrulama scripti oluşturuldu:** `scripts/validate-content.js`.
- (Önceki turlarda, aynı readiness kapsamında) Bölme sisteme tam bağlandı; tablo metni gerçek veriyle hizalandı.

## Dokunulan dosyalar

- `mental-math-app.html` (ana uygulama)
- `matreflex/index.html` (site kopyası, ana dosyayla senkron)
- `matreflex/sw.js` (cache v16 → v17)
- `scripts/validate-content.js` (yeni)

## Test edilen akışlar (jsdom, 21/21 geçti, 0 hata)

- Tüm ana ekranlar çökmeden açılıyor: home, ogren, ezber, karmaConfig, compare, progress, settings, toolbox, elevenTable, primeTable, friendTable, memHub, skills.
- 6 yöntemin her biri `launchSession` ve `Kendini test et` ile çalışıyor: ref, double, twins, eleven, decomp, divide.
- 4 işlem (`openOp`): Toplama, Çıkarma, Çarpma, Bölme.
- Hafıza oyunları: memHub (hangisi doğru / tersi / kart), tablo oyunları (Asal / Dost).
- Karma test, pratik desteleri, Hangi yol daha kolay.
- İlerleme: `deriveProgress` çökmüyor, tüm yöntemler `stats.methods` içinde, `METH_KEYS`/`METH_INFO`/`METHOD_NAMES` tutarlı, localStorage sıfırlama çalışıyor.
- Ayarlar: sade kart var, toggle çalışıyor, İlerleme doğrudan progress, 4 yasal sheet yerinde, accordion tamamen kalktı.

## Matematik doğrulama sonucu

`scripts/validate-content.js` çalıştırıldı: **85 hesaplanabilir cevap** (`methods.*.pool` + `tools.*.drill`) kontrol edildi, **hepsi doğru**, sıfır hata. `analyze()` dört işlem için de doğru sonuç veriyor (×, +, −, ÷); bölme kendi izole dalında çalışıyor ve çarpma analizini bozmuyor.

## Offline / PWA kontrol sonucu

- `manifest.webmanifest` bağlı (1), dosya mevcut.
- `sw.js` kayıtlı, cache **v17'e yükseltildi** (değişiklikler eski önbelleğe takılmaz).
- Service worker `skipWaiting` + `clients.claim` içeriyor; index için network-first, gerisi cache-first. Eski sürüm kalma riski düşük.
- 17 varlık precache'te (index, manifest, ikonlar, 6 font). İnternetsiz çalışma bekleniyor.

## Mobil kontrol sonucu

Kod düzeyinde belirgin taşma bulunmadı: içerik 390px telefon çerçevesiyle sınırlı, sabit genişlikler çerçevenin altında, `white-space:nowrap` yalnız 5 kısa etikette. **Ancak gerçek cihaz render testi yapılmadı** (jsdom layout hesaplamaz). Küçük ekran (iPhone SE), 390-430px ve tabbar çakışması gerçek cihazda doğrulanmalı.

## Kalan riskler

- **İçerik koda gömülü + `tools`/`methods` ikiliği.** Aynı yöntem metni iki yerde; büyüdükçe tutarsızlık riski. Çözüm: JSON'a çıkarma (konuştuğumuz A yolu). *Büyük karar, senin onayını bekliyor.*
- **Erişilebilirlik orta.** ~36 tıklanabilir `div`/`span` var; çoğunda klavye desteği yok (sadece 8 `role="button"`, 1 `focus-visible` kuralı). `prefers-reduced-motion` ve Hareketi azalt çalışıyor. Tam klavye/aria geçişi daha büyük bir iş. *Kapsam kararı senin.*
- **Splash ekranı ölü.** `showSplash()` tanımlı ama hiçbir yerden çağrılmıyor; splash asla gösterilmiyor. Bir launch animasyonu olarak bağlanabilir ya da tamamen silinebilir. *Ürün kararı, sana bırakıyorum.*
- **Minör ölü CSS/JS.** `ribExp()` fonksiyonu artık kullanılmıyor (hiçbir rib ona bağlı değil); `.rib-exp`/`.rib-tgl`/`.rib-pill`/`.ht`/`.hs` kuralları kısmen ölü; `openOp`'taki "yakında" fallback'i artık tetiklenmiyor (Bölme dolu). Hepsi zararsız; JSON/temizlik turunda süpürülebilir.
- **Gerçek cihaz doğrulaması yok.** Render, dokunma hedefi boyutu, kontrast gözle test edilmeli.

## Yayına çıkmadan önce insan tarafından yapılması gerekenler

1. Gerçek cihaz testi: iPhone SE (küçük) + 390-430px telefonlar; taşma, dokunma hedefi, tabbar çakışması, kontrast.
2. Offline testi: uçak modunda aç, fontlar/ikonlar/CSS/JS yükleniyor mu.
3. Trademark kontrolü: TÜRKPATENT ve EUIPO'da "MatReflex".
4. Splash kararı: bağla ya da sil (bana söyle, yapayım).
5. Erişilebilirlik kararı: tam klavye/aria geçişi v1.0 kapsamında mı, yoksa bilinen sınır olarak mı bırakılıyor.
6. Gizlilik/Koşullar metinlerinin son hukuki gözden geçirmesi (sıfır-veri duruşuyla zaten uyumlu).
7. Mağaza hesapları (Apple Developer, Google Play) ve görsel varlıklar (ikon boyutları, ekran görüntüleri).
8. İçerik mimarisi (A yolu) kararı: JSON'a çıkarma + doğrulama scriptini CI'da zorunlu adım yapma.

---

**Özet değerlendirme:** Uygulama işlevsel olarak sağlam; tüm kritik akışlar otomatik testten geçiyor, matematik doğru, PWA/offline hazır, Ayarlar sorunu kapandı, ölü kod azaldı. Yayına giden yolda kalan iki büyük iş içerik mimarisi (A yolu) ve gerçek cihaz + erişilebilirlik doğrulaması; ikisi de "yeni özellik" değil, sağlamlaştırma.
