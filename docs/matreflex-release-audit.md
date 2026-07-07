# MatReflex — Release Readiness & Roadmap Audit v0.1

Hazırlanma tarihi: 2026-07-07 · Build referansı: sw.js cache v12 · Değerlendirilen sürüm: dağıtılmış PWA (zeynepkaya.app/matreflex/)

Bu doküman genel tavsiye değildir. Ürün, teknik, UX ve release ekiplerinin birlikte yaptığı bir süreç denetimidir ve MatReflex'in bugünkü gerçek koduna ve içeriğine dayanır.

---

## 1. Executive Summary

**Şu an hangi aşamada?**
MatReflex, web'de canlı, özellik açısından zengin, olgun bir PWA. Dört işlem, altı yöntem, öğren/pratik/tanıma/karşılaştırma/karma test akışları, beş tablolu bir referans kütüphanesi (ikisi oyun modlu), ilerleme, ayarlar, onboarding, yasal sayfalar ve tam offline PWA altyapısı çalışıyor. Bu, tipik bir "prototip"in ötesinde; işlevsel bir erken beta niteliğinde.

**Web prototip mi, mobil app adayı mı?**
Teknik olarak şu an bir web PWA (tek dosya HTML/CSS/JS + service worker). Mobil app **adayı**, ama henüz App Store / Play'e girecek bir native paket değil. Mobil deneyim mobil-öncelikli tasarlanmış, telefonda çalışıyor; eksik olan native paketleme katmanı.

**Yayına çıkmadan önce temel riskler**
1. **İçerik koda gömülü.** Yöntemler, örnekler ve soru havuzları tek HTML dosyasında JS nesneleri olarak duruyor. İçerik büyüdükçe ve uygulama ailesine (Japonca, LGS) genişledikçe en büyük yapısal borç bu.
2. **Store yolu seçilmedi.** PWA'yı sarmalamak (wrap) mı, React Native'e taşımak mı belirsiz. Yanlış seçim aylar yakar.
3. **Trademark kontrolü yapılmadı.** Mağaza kaydından önce TÜRKPATENT / EUIPO.
4. **Odak riski.** Tek kişi, dört uygulamalık plan. MatReflex bitmeden diğerlerine dağılmak en gerçek tehdit.
5. **Matematik doğruluğu.** İçerik büyüdükçe cevap doğruluğu otomatik doğrulama ister.

**İlk ciddi hedef ne olmalı?**
Tek cümlede: **MVP'yi kilitle, içeriği koddan ayır, sonra PWA'yı sarmalayarak TestFlight ve Google Play Internal Testing'e çık.** Full React Native yeniden yazımını erken hedef yapma; bugünkü el işçiliği hissini riske atar ve haftalar yerine aylar götürür. Gerçekçi ilk hedef: **kapalı beta (TestFlight + Play Internal) → v1.0**.

---

## 2. Current State Audit

| Alan | Mevcut Durum | Eksik | Öncelik | Not |
|---|---|---|---|---|
| Ürün fikri | Net ve ayırt edici: yöntem tanıma odaklı, sakin, cezasız zihinden matematik | Yazılı tek sayfalık ürün tanımı (bu dokümanın 3. bölümü) | Yüksek | Rakiplerden ayrışma güçlü |
| Hedef kullanıcı | Zihinden hesabı geliştirmek isteyen genel kullanıcı; öğrenci de dahil | Kullanıcı segment tanımı ve yaş çerçevesi netleşmemiş | Orta | Çocuk algısı gizlilik açısından önemli (bkz. 10) |
| Öğrenme modeli | Ustalık (kalıcı) vs Form (günlük) ikilisi; keşfet + pratik | Model öğrenimini ölçen net metrik | Orta | Zorluk kademesi bilinçli olarak yok |
| Tasarım dili | Olgun ve belgelenmiş: Fiziksel Arayüz Dili + Tasarım Şifreleri + Dil Rehberi | İkon ve elevation sistemleri ayrı doküman değil | Orta | En güçlü varlıklardan biri |
| Mevcut web prototipler | Tek dosya `mental-math-app.html` + tam `matreflex/` site paketi, canlı | Sürüm arşivi disiplinsizdi, Drive'a yeni taşındı | Düşük | Drive arşivi kuruldu |
| İçerik durumu | 6 yöntem, ~50 pratik sorusu, 5 tablo, hafıza yolu infografikleri, drill havuzları | Placeholder'lar temizlendi; içerik hâlâ koda gömülü | Yüksek | Tamlık iyi, mimari zayıf |
| Soru / yöntem havuzu | `methods{}` ve `tools{}` nesneleri, her yöntemde pool/examples/drill | Harici, versiyonlanabilir veri şeması yok | Yüksek | Bkz. 5. bölüm |
| Kullanıcı ilerleme sistemi | Ustalık/Form, seri, ilerleme ekranı (ringler), method bazlı takip | Tanım net ama görselleştirme dağınık; beş katmanlı harita fikri askıda | Orta | localStorage'da |
| Veri saklama | localStorage (STORE): ilerleme, reduceMotion, onboarded | Şema/versiyon yok; taşıma stratejisi yok | Orta | Offline-first için yeterli |
| Teknik altyapı | Vanilla HTML/CSS/JS, framework yok, tek dosya, PWA + service worker | Native paketleme katmanı yok | Yüksek | Bkz. 8. bölüm |
| Yayın altyapısı | GitHub/host üzerinde web dağıtımı; zip yükleyip test | Store hesapları, native build, CI yok | Yüksek | Henüz başlanmadı |
| Eksik dokümanlar | Tasarım dili + dil rehberi var | Ürün tanımı, içerik şeması, test planı, privacy/terms tam metinleri | Yüksek | Bu audit bir kısmını kapatıyor |
| Riskler | Kapsam şişmesi, içerik-kod bağı, çok-uygulama dağınıklığı | Yazılı risk register yoktu | Yüksek | Bkz. 15. bölüm |

---

## 3. Product Definition

**MatReflex nedir?**
Türkçe, mobil-öncelikli bir zihinden matematik uygulaması. Amacı hız yarışı değil; bir işleme bakınca hangi kısayolun işe yarayacağını **tanıma refleksini** sakin ve cezasız bir ortamda kurmak.

**Ne değildir?**
- Süreli drill yarışması değil.
- Sıralama, rozet, puan baskısı olan bir oyun değil.
- Genel bir matematik dersi ya da müfredat uygulaması değil.
- Sınav soru bankası değil.
- Hesap makinesi ya da çözüm asistanı değil.

**İlk sürümde ne yapmalı?**
Dört işlemde birkaç güçlü kısayol yöntemini keşfettirmeli, her yöntemi kısa pratikle pekiştirmeli, hangi yolun daha hafif olduğunu tanımayı öğretmeli, ilerlemeyi sakin biçimde göstermeli. Tamamen offline, hesapsız, reklamsız.

**İlk sürümde ne yapmamalı?**
Bulut senkronu, hesap sistemi, sosyal özellik, yapay zeka, zorluk kademesi, çok dillilik, çok uygulamalı marka. Bunların hiçbiri v1.0 için gerekli değil.

**Kullanıcı ilk 30 saniyede ne anlamalı?**
"Bu, bana zor işlemleri kafadan kolaylaştıran yolları sakince öğreten bir yer. Beni yarıştırmıyor, cezalandırmıyor."

**İlk 5 dakikada ne kazanmalı?**
En az bir kısayolu (örneğin 11 ile çarpım ya da referans sayılar) anlayıp bir soruda kendi kullanabilmeli. Küçük ama gerçek bir "aa, işe yarıyor" anı.

**7 gün sonra neden geri gelmeli?**
Çünkü Form günden güne değişiyor ve tanıdıkça refleksi keskinleşiyor; birkaç dakikalık sakin bir pratik onu koruyor. Baskı değil, düzenli bir tazeleme hissi geri getirir.

---

## 4. MVP Scope

MatReflex v1.0, minimum ama kaliteli. İyi haber: kapsamın büyük kısmı zaten var. Amaç yeni özellik eklemek değil, var olanı cilalayıp kilitlemek.

| Bölüm | v1.0'da Olmalı | v1.0'da Olmamalı | Not |
|---|---|---|---|
| Ana Sayfa | Öğren, Yöntem tanıma, Pratik, Matematik Tabloları girişleri | Kişiselleştirilmiş öneri, günlük görev zinciri | Grid mevcut ve dengeli |
| Öğren | 4 işlem, 6 yöntem, akış kartları + neden + örnekler | Video, sesli anlatım | Bölme yeni eklendi |
| Yöntem Tanıma | "Hangi yol daha kolay" + yöntem tanıma drill'i | Zamanlı tanıma yarışı | Çekirdek ayrışma noktası |
| Pratik | Deste sistemi + Karma test + rapor | Zorluk seçimi, günlük seri ödülü | Mevcut |
| Matematik Tabloları | Kareler, Küpler, 11'le Çarpım, Asal, Dost + oyunlar | Yeni tablo türleri (üsler, kökler) | 5 tablo tam |
| İlerleme | Ustalık/Form özeti, sade görselleştirme | Beş katmanlı harita (henüz karar yok) | Görselleştirme sadeleşmeli |
| Profil | Ustalık/Form/Seri künyesi | Avatar, isim, hesap | Ayarlar içinde |
| Ayarlar | Hareketi azalt, dil, ilerlemeyi sıfırla | Tema seçimi, bildirim | Ribler yeni sağlamlaştırıldı |
| Gizlilik / Koşullar | Barındırılan sayfalar + uygulama içi çekmece | Çerez/analitik metni (yok çünkü toplamıyoruz) | Mevcut |
| Hakkında | Sürüm, künye | Değişiklik günlüğü | Mevcut |

**"İlk sürüme gerek yok" listesi (bilinçli erteleme):**
Bulut senkron, hesap/giriş, bildirimler, sosyal paylaşım, liderlik tablosu, zorluk kademeleri, yapay zeka soru üretimi, çok dil, tema/karanlık mod, yeni tablo türleri, tablolar için ileri oyun modları, üsler/kökler, LGS/Japonca içerik. Hepsi geçerli fikirler; hiçbiri v1.0 kapsamında değil.

---

## 5. Content Architecture

Bu, projenin en kritik teknik kararı. Bugün içerik (yöntemler, örnekler, sorular) tek HTML dosyasının içinde JS nesneleri olarak yaşıyor. Bu, bugünkü hacimde çalışıyor ama üç sorun büyüyor: (1) içerik değişikliği kod dağıtımı gerektiriyor, (2) matematik hatası kontrolü elle yapılıyor, (3) uygulama ailesine geçince paylaşılabilir bir havuz yok.

**Öneri: içeriği koddan ayır.** v1.0 için ağır bir CMS gerekmez. Tek dosya felsefesini korumak istiyorsan içerik yine derleme anında gömülebilir, ama **kaynak olarak ayrı JSON dosyalarında** tutulmalı ve basit bir build adımıyla birleştirilmeli. Sıralı öneri:

- **Kısa vade:** İçeriği `content/` altında JSON dosyalarına çıkar (yöntemler, sorular, tablolar ayrı). Uygulama bunları fetch eder ya da build sırasında gömer. Tek dosya PWA korunur.
- **Orta vade:** Basit bir doğrulama scripti (Node) her build'de tüm cevapları hesaplayıp `answer` alanıyla karşılaştırsın. Matematik hatası dağıtıma çıkamaz.
- **Uzun vade (app ailesi):** Ortak yöntem/soru şeması tüm uygulamalarda paylaşılır (Drive'daki `02_Shared_Content_Pool` bunun yeri).

**Kod içine gömme kararı:** JSON/Markdown yeterli; CMS (Contentful vb.) v1.0 için gereksiz. Markdown mikro dersler için, JSON yöntem ve soru verisi için doğru ikili.

**Method object (MatReflex modeline uyarlanmış):**
```json
{
  "id": "eleven",
  "title": "Onbir Çarpımı",
  "shortDescription": "11 ile çarpımda kenarları bırak, ortaya topla",
  "operation": "carpma",
  "engineType": "twins",
  "difficulty": null,
  "flow": [ { "label": "...", "ex": "63 × 11", "steps": [...], "res": "693" } ],
  "why": "...",
  "strong": "...", "weak": "...",
  "examples": [ { "q": "63 × 11", "work": "6 _ 3, ortaya 6+3=9 → 693" } ],
  "pool": [ { "a": "63", "op": "×", "b": "11", "ans": "693", "recog": "...", "recipe": "..." } ],
  "drill": [ { "q": "63 × 11", "fits": true, "ans": "693", "why": "..." } ],
  "tags": ["carpma", "kenar-toplama"],
  "unlockCondition": null,
  "version": "1.0.0"
}
```
Notlar: `engineType` mevcut çizicilere karşılık gelir (`ref` / `double` / `twins` / `divide`), yani mimari bugünkü motorla birebir uyumlu. `difficulty` **opsiyonel ve null olabilir**; MatReflex bilinçli olarak zorluk kademesi zorlamıyor, ama alan ileride filtreleme için dursun.

**Question object:**
```json
{
  "id": "q_63x11",
  "expression": "63 × 11",
  "a": 63, "op": "×", "b": 11,
  "answer": 693,
  "allowedMethods": ["eleven", "decomp"],
  "preferredMethod": "eleven",
  "difficulty": null,
  "explanation": "Kenarlar 6 ve 3, ortaya 6+3=9.",
  "commonMistakes": ["taşımayı unutmak: 48×11"],
  "createdAt": "2026-07-07",
  "version": "1.0.0"
}
```

**Diğer sorulara yanıtlar:**
- **Zorluk işaretleme:** Opsiyonel `difficulty` (1-3) ya da null. Zorlama yok; sadece etiket.
- **Yöntem-soru bağı:** `allowedMethods` + `preferredMethod`. "Hangi yol daha kolay" ve tanıma sistemleri bu alanlardan beslenir.
- **Soru tekrarı önleme:** Her sorunun `id`'si var; oturum içinde görülenler işaretlenir, havuz bitmeden tekrar gelmez (bugünkü `chosen/sequence` mantığının şema karşılığı).
- **Yanlış cevap analizi:** `commonMistakes` alanı bugünden dursun; ileride kullanıcı yanlışını bu listeyle eşleştirip hedefli geri bildirim verilebilir (v1.0'da gerekmez).
- **Versiyonlama:** Her nesnede `version`; ayrıca `content/manifest.json` içinde toplu içerik sürümü. Böylece "hangi içerik sürümü hangi app sürümünde" izlenir.

---

## 6. Learning Architecture

Önerilen akış zaten uygulamanın ruhuyla örtüşüyor:

**Problem → Discovery → Method → Practice → Reflect → Mini Game → Checkpoint**

- **Problem:** Kullanıcıya bir işlem gösterilir (örn. 63 × 11).
- **Discovery:** Doğrudan trick verilmeden önce "bunu kolaylaştıran bir yol var mı?" sezgisi. Bugün kısmen "Hangi yol daha kolay" ile karşılanıyor.
- **Method:** Akış kartıyla yöntem gösterilir (neden + adımlar).
- **Practice:** Dokun, yöntem yolunu gör, cevabı aç; Kolaydı/Zorlandım.
- **Reflect:** Zorlandığın soru o turda tekrar gelir (mevcut).
- **Mini Game:** Tablolarda tanıma oyunları (Asal, Dost, Kareler).
- **Checkpoint:** Ustalık/Form güncellenir.

**Keşfettirme vs doğrudan trick dengesi:**
Saf keşif yavaş ve sinir bozucu olabilir; saf trick ezber olur. Denge: önce kısa bir "hangi yol daha hafif?" anı (keşif kıvılcımı), sonra yöntemi net göster, sonra pratikle sahiplendir. MatReflex'in yaptığı bu; korunmalı.

**İlk 10 yöntem sırası (öneri):**
1. Referans Sayılar (en genel, toplama/çıkarma/çarpma)
2. Onbir Çarpımı (hızlı kazanım, motive edici)
3. İkile-Yarıla
4. Onluk İkizler
5. Ayrıştırma (genel dayanak)
6. Bölme Kısayolları (dost bölenler)
7. Kareler (tablo + hafıza yolu)
8. Dost Sayılar (referansı besler)
9. Asal Sayılar (tanıma)
10. Küpler
Mantık: erken kazanım (11) motive eder, genel yöntemler (referans, ayrıştırma) omurgayı kurar, tablolar tanımayı besler.

- **Kullanıcı zorlanırsa:** Ceza yok. Soru tekrar gelir, yöntem yolu tekrar açılır, Form düşer ama kınama yok. Sakin tazeleme.
- **Başarı ölçümü:** Ustalık (kalıcı hakimiyet, yavaş artar) + Form (günlük performans, iniş çıkışlı). İkisi ayrı.
- **Yöntem refleksi takibi:** Tanıma drill'inde doğru yöntemi seçme oranı zamanla ölçülebilir; refleksin asıl göstergesi bu (henüz metrik olarak toplanmıyor, v1.0 sonrası).
- **Ezber değil model öğrenimi:** Her yöntemin "neden çalışır" kısmı, ezberi modele çevirir. Bu bölüm her yöntemde tam olmalı.

---

## 7. Design System Readiness

Tasarım dili projenin en güçlü tarafı ve iyi belgelenmiş (`mental-math-tasarim-dili.md`, `mental-math-tasarim-sifreleri.md`, `mental-math-dil-rehberi.md`).

| Kontrol | Durum | Not |
|---|---|---|
| Renk sistemi | Yeterli | Zemin/metin + aksan paleti, gerçek hex değerleri tanımlı |
| Tipografi | Net | Fredoka (başlık/sayı), Inter (gövde), Fraunces (nadir); boyut skalası var |
| Kart sistemi | Tutarlı | Nesne kütüphanesi tanımlı (Şerit, Deste, Akış Kartı, Çekmece, Plaka, Tablo Hücresi, Anahtar) |
| Buton dili | Kısmen | Birincil/ghost var ama tek bir dokümanda toplanmamış |
| İkon dili | Kısmen | Kabartma yuvarlak ikon prensibi var; ayrı ikon dokümanı yok |
| Gölge / elevation | Kısmen | Şifreler belgesinde gölge değerleri var; token'laştırılmış elevation ölçeği ayrı değil |
| Motion kuralları | Net | Yay eğrisi `cubic-bezier(.34,1.3,.5,1)`, süreler, kademeli beliriş tanımlı |
| Mobil / web uyumu | Kısmen | Mobil-öncelikli; sabit telefon çerçevesi var, native'e geçişte gözden geçmeli |
| Erişilebilirlik | Kısmen | Dokunma hedefi ve kontrast prensipleri var; resmi WCAG denetimi yapılmadı |
| Reduce motion | Var | `prefers-reduced-motion` destekli, animasyonlar sadeleşiyor |

**Eksik tasarım dokümanları:**
- İkon sistemi dokümanı (stroke, ızgara, kabartma kuralları) — Drive `01/06_Icon_Language.md` yeri hazır.
- Elevation/gölge token ölçeği (ayrı, adlandırılmış seviyeler).
- Buton dili tek sayfa (varyantlar, durumlar, boyutlar).
- Web ve native parite notu (native'e geçişte neyin değişeceği).
- Resmi erişilebilirlik denetim çıktısı.

---

## 8. Technical Architecture

Bu bölümdeki en önemli karar: **PWA'yı sarmalamak mı, React Native'e taşımak mı?** Ürün ekibi olarak dürüst tavsiye: **önce sarmala.**

**Aşamalar:**
- **Prototype (bugün):** HTML / CSS / JS tek dosya + service worker. Offline-first zaten çalışıyor.
- **Gerçek mobil uygulama:** İki yol var.

**Yol A — PWA Wrap (önerilen ilk yol):**
Mevcut PWA'yı bir native kabuğa sararsın. Seçenekler: **Capacitor** (web app'i iOS/Android'e sarar, gerektiğinde native eklenti; en esnek), **PWABuilder** (Microsoft; PWA'dan store paketi üretir), **TWA/Bubblewrap** (yalnız Android/Play için hafif yol).
- Artı: haftalar değil günler; bugünkü el işçiliği hissi birebir korunur; offline + localStorage aynen çalışır; tek kod tabanı.
- Eksi/risk: Apple App Store 4.2 ("minimum functionality") maddesi ince web kabuklarına sert; ama MatReflex zengin, offline ve gerçek işlevli. Capacitor ile birkaç native dokunuş (haptics, paylaş, durum çubuğu) inceleme riskini ciddi düşürür. Google Play (TWA) çok daha esnek.

**Yol B — Expo + React Native (senin dokümanının önerisi):**
Tam yeniden yazım. Native performans ve gerçek native bileşenler.
- Artı: uzun vadede native özelliklere (bildirim, widget, mağaza içi satın alma) daha açık; app ailesi büyürse ortak bir native temel.
- Eksi/risk: aylar sürer; mevcut fiziksel arayüz dilini (kağıt, yay fiziği, katmanlı gölge) RN'de birebir yeniden kurmak zahmetli ve his kaybı riski yüksek; tek kişi için büyük yük.

**Tavsiye:** v1.0 için **Yol A (Capacitor)**. React Native'i, MatReflex mağazada olduktan ve gerçek native ihtiyaç doğduktan sonra değerlendir. Erken RN rewrite, bugünkü en büyük yanlış yatırım olur.

**Veri:**
- v1.0: **localStorage** (PWA) yeterli. Capacitor'da web katmanı localStorage'ı korur; istenirse `@capacitor/preferences` ya da SQLite'a taşınabilir ama gerek yok.
- Şema versiyonu ekle (`storageVersion`) ki ileride migration yapılabilsin.

**Server / üyelik / AI / backend:**
- v1.0'da **hiçbiri gerekli değil.** Server yok, üyelik yok, AI yok, backend yok.
- Offline-first mimari **öneri ve zaten mevcut:** service worker precache + localStorage. İnternetsiz tam çalışıyor. Bu, hem gizlilik hem inceleme hem kullanıcı deneyimi için güçlü bir konum; korunmalı.

---

## 9. App Store / Google Play Preparation

| Gereklilik | Durum | Ne zaman hazırlanmalı | Risk |
|---|---|---|---|
| Apple Developer hesabı ($99/yıl) | Yok | Store fazından önce | Onay birkaç gün sürebilir |
| Google Play Developer hesabı ($25 tek sefer) | Yok | Store fazından önce | Düşük |
| Bundle ID / package name | Yok | Native paketlemede | Trademark ile uyumlu olmalı |
| App icon | Kısmen (PWA ikonları var) | Design lock'ta | Store boyutları ayrıca üretilmeli |
| Splash screen | Var (uygulama içi) | Native pakette yeniden | Düşük |
| Screenshots | Yok | Beta sonrası | Görsel üretimi senin güçlü alanın |
| App preview video | Opsiyonel | İsteğe bağlı | Stok video/görsel deneyimin burada avantaj |
| App description | Yok | Store fazı | Dil rehberine uygun yaz |
| Keywords | Yok | Store fazı | "zihinden matematik, pratik matematik" |
| Support URL | Var (barındırılan destek sayfası) | Hazır | Düşük |
| Marketing URL | Kısmen | Store fazı | Ana sayfa yeterli |
| Privacy Policy URL | Var (barındırılan) | Metin güncellenmeli | Bkz. 10 |
| Terms URL | Var (barındırılan) | Metin güncellenmeli | Bkz. 10 |
| Contact email | Var (bağlı) | Hazır | Düşük |
| Age rating | Yok | Store fazı | Muhtemel 4+; içerik güvenli |
| Data collection declaration | Yok | Store fazı | Kolay: veri toplamıyoruz |
| Export compliance | Yok | Store fazı | Şifreleme yok; basit beyan |
| Content rights | Yok | Store fazı | İçerik özgün; sorun yok |
| TestFlight süreci | Yok | Beta fazı | Apple derleme + inceleme gerekir |
| Google internal testing | Yok | Beta fazı | Hızlı ve esnek |

Not: Apple/Google mağaza kuralları ve gizlilik etiketi ayrıntıları değişebilir; native build anında güncel gereklilikleri doğrula.

---

## 10. Privacy, Safety & Legal

MatReflex eğitim odaklı ve çocuklar tarafından da kullanılabileceği için mağaza gizlilik değerlendirmesi hassas. İyi haber: mevcut mimari zaten en güvenli konumda.

**v1.0 duruşu (mevcut ve korunmalı):** hesap yok, kişisel veri yok, reklam yok, üçüncü taraf takip yok, ilerleme yalnız cihazda, açık gizlilik metni, kullanıcı verisini sıfırlama var, ebeveyn açısından şeffaf.

**Privacy Policy taslağında olması gerekenler:** hangi verinin (yalnız yerel ilerleme/tercih) tutulduğu, hiçbir verinin sunucuya gitmediği, üçüncü taraf paylaşımı olmadığı, hesap gerekmediği, verinin uygulama içinden nasıl sıfırlanacağı, iletişim adresi, çocuklara yönelik veri toplanmadığı beyanı.

**Terms of Use taslağında olması gerekenler:** kişisel/ticari olmayan kullanım, içeriğin eğitim amaçlı olduğu, resmi değerlendirme aracı olmadığı, "olduğu gibi" sağlandığı, içeriğin sahibi.

**Çocuklara yönelik algılanma riski:** Matematik + sakin ton, küçük yaş çekebilir. Mağazada çocuk kategorisi seçilmese bile, sıfır veri toplama en güvenli koruma. Analitik/reklam eklenmedikçe COPPA/GDPR-K türü yükümlülükler pratikte doğmaz.

**Analitik kullanılırsa dikkat:** Anonim bile olsa çocuk kullanımı ihtimali nedeniyle veri toplama beyanı zorlaşır; kişisel tanımlayıcı asla toplanmamalı; tercihen v1.0'da hiç eklenmemeli.

**Reklam SDK'sı eklenirse:** Çocuk kullanımı + reklam = ciddi politika yükü ve inceleme riski. v1.0'da eklenmemeli.

**Veri toplamazsak avantaj:** Mağaza gizlilik etiketi "veri toplanmıyor" olur (güçlü güven sinyali), inceleme riski düşer, yasal yük neredeyse sıfır, ebeveyn güveni yüksek, pazarlama argümanı olur.

---

## 11. Testing Plan

| Test | Kapsam | Öncelik | Durum |
|---|---|---|---|
| UI test | Tüm ekranlar açılıyor, butonlar çalışıyor | Yüksek | Elle yapılıyor |
| Mobil responsive | 360-430px genişlik aralığı | Yüksek | Kısmen |
| Küçük ekran | iPhone SE / dar Android | Yüksek | Kontrol edilmeli |
| Büyük ekran | Büyük telefon / tablet | Orta | Kontrol edilmeli |
| iPhone / Android cihaz | Gerçek cihazda Safari + Chrome | Yüksek | Gerekli |
| Offline test | Uçak modunda tam çalışma | Yüksek | SW var, doğrula |
| Veri sıfırlama | Sıfırla → durum temiz | Yüksek | Var, test et |
| İlerleme kaydı | Kapat/aç sonrası kalıcılık | Yüksek | localStorage |
| Soru doğruluğu | Her sorunun cevabı doğru | Kritik | Otomatik script öner (bkz. 5) |
| Matematik validasyonu | Yöntem yolları matematiksel doğru | Kritik | Bölme aritmetiği doğrulandı |
| Yanlış cevap senaryosu | Kolaydı/Zorlandım akışı | Orta | Var |
| Erişilebilirlik | Kontrast, dokunma hedefi, etiket | Orta | Denetim yapılmalı |
| Reduce motion | Açıkken animasyonlar sadeleşiyor | Orta | Var |
| Performans | Düşük cihazda animasyon akıcılığı | Yüksek | Ölçülmeli (risk) |
| Store review öncesi smoke test | Uçtan uca kritik akışlar | Yüksek | Beta öncesi |

En kritik iki test: **matematik doğruluğu (otomatik)** ve **düşük cihaz performansı** (dekoratif animasyonlar burada risk).

---

## 12. Versioning Plan

MatReflex bugün gerçekçi olarak **v0.5-0.6 civarı**: özellik açısından zengin, ama içerik mimarisi ve native paket yok.

| Version | Goal | Must Be Done | Not Included |
|---|---|---|---|
| v0.1 Concept | Fikir + ilk prototip | Ürün fikri, ilk ekranlar | İçerik derinliği |
| v0.2 Design | Tasarım dili | Renk/tipo/nesne dili | Native |
| v0.3 Learning Flow | Öğrenme akışı | Öğren→pratik→tanıma | İçerik sistemi |
| v0.4 Content | İçerik derinliği | 6 yöntem, 5 tablo, havuzlar | Harici şema |
| v0.5 Internal Alpha | İç tutarlılık | Placeholder temizliği, hata düzeltmeleri, Bölme | Store |
| v0.6 Content System | İçerik koddan ayrı | JSON şema + doğrulama scripti | RN |
| v0.7 Feature Complete Beta | Kapsam kilidi | MVP tam, cilalı | Yeni özellik |
| v0.9 Release Candidate | Native paket + store hazırlığı | Capacitor build, store materyalleri | - |
| v1.0 Public Release | Yayın | TestFlight/Play beta geçildi | - |

Bugünkü öncelik: **v0.6'yı bitirmek** (içeriği koddan ayırmak). Bu, v1.0'a giden en kritik ara adım.

---

## 13. Roadmap

**Phase 0 — Toparlama**
- Amaç: dağınıklığı bitir, tek doğruluk kaynağı kur.
- Çıktılar: Drive arşivi (kuruldu), sürüm etiketleme disiplini, bu audit.
- Kontrol: her build arşivde, cache sürümü artıyor.
- Bitme kriteri: güncel build ve dokümanlar Drive'da düzenli.
- Riskler: arşivin güncel tutulmaması.

**Phase 1 — MVP Definition**
- Amaç: v1.0 kapsamını kilitle.
- Çıktılar: bu dokümanın 3-4. bölümleri onaylı, "olmayacaklar" listesi kabul.
- Bitme kriteri: kapsam yazılı ve dondurulmuş.
- Riskler: kapsam şişmesi.

**Phase 2 — Design System Lock**
- Amaç: tasarım dilini dondur ve eksik dokümanları tamamla.
- Çıktılar: ikon, elevation, buton dokümanları; erişilebilirlik denetimi.
- Bitme kriteri: yeni ekran sıfır yeni-stil kararıyla yapılabiliyor.

**Phase 3 — Content Architecture**
- Amaç: içeriği koddan ayır.
- Çıktılar: `content/*.json`, method/question şeması, doğrulama scripti.
- Bitme kriteri: içerik değişikliği kod düzenlemeden yapılabiliyor; tüm cevaplar otomatik doğrulanıyor.
- Riskler: mevcut motorla uyum (şema `engineType` ile uyumlu tasarlandı).

**Phase 4 — Prototype Completion**
- Amaç: MVP'yi cila ve kilit.
- Çıktılar: tüm ekranlar tutarlı, hatasız, içerik tam.
- Bitme kriteri: feature-complete beta.

**Phase 5 — Native Paketleme (Capacitor)**
- Amaç: PWA'yı store'a gidecek native pakete sar.
- Çıktılar: iOS ve Android build, birkaç native dokunuş.
- Bitme kriteri: cihazda native uygulama olarak çalışıyor.
- Riskler: Apple 4.2 incelemesi (native dokunuşlarla azaltılır).

**Phase 6 — Internal Testing**
- Amaç: gerçek cihazlarda test.
- Çıktılar: test checklist geçildi, kritik hatalar kapandı.
- Bitme kriteri: smoke test temiz.

**Phase 7 — Store Preparation**
- Amaç: mağaza materyalleri ve hesaplar.
- Çıktılar: ikon setleri, ekran görüntüleri, açıklama, gizlilik/koşullar, hesaplar, trademark kontrolü.
- Bitme kriteri: store gönderimi için her alan hazır.

**Phase 8 — Beta**
- Amaç: TestFlight + Play Internal ile kapalı beta.
- Çıktılar: gerçek kullanıcı geri bildirimi.
- Bitme kriteri: kritik geri bildirimler işlendi.

**Phase 9 — Release**
- Amaç: v1.0 yayını.
- Bitme kriteri: mağazalarda canlı.

**Phase 10 — Post-launch**
- Amaç: geri bildirimle iyileştirme, sonra app ailesine geçiş.
- Not: Japonca/LGS uygulamaları buraya kadar beklemeli.

---

## 14. Team Roles Simulation

Tek kişi olsan da her rolü ayrı bir "şapka" olarak düşün; karar verirken hangi şapkayla konuştuğunu bil.

| Rol | MatReflex'teki karşılığı |
|---|---|
| Product Owner | Kapsamı kilitler, "hayır" der, öncelik sırasını korur (senin en kritik şapkan) |
| UX Designer | Akışlar, keşfet-vs-göster dengesi, boş/hata durumları |
| UI Designer | Fiziksel arayüz dili, kart/ikon/gölge tutarlılığı (stok görsel deneyimin burada güçlü) |
| Learning Designer | Yöntem sırası, Ustalık/Form modeli, ezber değil model öğrenimi |
| Content Designer | Soru havuzları, örnekler, dil rehberine uygun metin |
| Frontend/Mobile Dev | Tek dosya PWA, içerik ayrımı, Capacitor paketleme |
| QA Tester | Matematik doğruluğu, cihaz/offline/performans testleri |
| Release Manager | Sürüm etiketleri, cache bump, store gönderimi |
| Legal/Privacy Checker | Sıfır veri duruşu, gizlilik/koşullar metinleri, trademark |
| Marketing/Community | Ekran görüntüleri, önizleme videosu, açıklama (stok medya ve görsel üretim deneyimin doğrudan avantaj) |

İki not sana özel: stok video/fotoğraf üreticiliğin **UI, store görselleri ve pazarlama** rollerinde gerçek bir avantaj; oyun yapma ilgin ise **oyunlaştırma ve Learning Design** tarafında (özellikle ileride LGS/YKS uygulamasında) değerli. Ama v1.0 için bu ilgiyi MatReflex'i bitirmeye kanalize et, yeni oyun projelerine değil.

---

## 15. Risk Register

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| Kapsam şişmesi | Yüksek | Yüksek | MVP'yi yazılı kilitle; "olmayacaklar" listesi |
| Tasarımın fazla dekoratif olup öğrenmeyi bozması | Orta | Orta | Her ekranda tek net iş; öğrenme > süs |
| İçeriğin koda gömülü kalması | Yüksek | Yüksek | Phase 3 içerik ayrımı |
| Soru havuzunun yönetilememesi | Orta | Yüksek | JSON şema + id + versiyon |
| Yanlış matematik cevapları | Orta | Kritik | Otomatik doğrulama scripti |
| App Store gizlilik/4.2 reddi | Orta | Yüksek | Sıfır veri + Capacitor native dokunuş |
| Çocuklara yönelik veri riski | Düşük | Yüksek | Veri toplama, reklam, analitik yok |
| Performans sorunları | Orta | Orta | Düşük cihaz testi; ağır animasyonları ölç |
| Animasyonların düşük cihazda yavaşlaması | Orta | Orta | Reduce-motion + animasyon bütçesi |
| Tek kişinin motivasyon kaybı | Orta | Yüksek | Küçük, biten fazlar; canlı test geri bildirimi |
| Çok uygulamaya aynı anda bölünme | Yüksek | Yüksek | MatReflex v1.0 çıkana kadar diğerlerini dondur |

---

## 16. Immediate Next Actions

Bugünden itibaren, sırayla:

1. MatReflex v1.0 kapsamını yazılı olarak kilitle (bu dokümanın 4. bölümü referans).
2. "v1.0'da olmayacaklar" listesini ayrı bir sayfada dondur.
3. İlk 10 yöntemi ve sırasını onayla (6. bölüm önerisi).
4. Method JSON şemasını oluştur (`content/methods.schema.json`).
5. Question JSON şemasını oluştur (`content/questions.schema.json`).
6. Mevcut `methods{}` / `tools{}` içeriğini JSON dosyalarına çıkar.
7. Node doğrulama scripti yaz: tüm cevapları hesaplayıp `answer` ile karşılaştır.
8. Ana ekran ve navigasyon bilgi mimarisini son haline getir (beş katmanlı harita kararını ver).
9. Design System eksik dokümanlarını yaz (ikon, elevation, buton).
10. Erişilebilirlik hızlı denetimi yap (kontrast, dokunma hedefi).
11. Privacy Policy ve Terms metinlerini sıfır-veri duruşuna göre güncelle.
12. Drive arşivini güncel tut: her build 03_MatReflex altına.
13. Capacitor'ı seç ve küçük bir deneme paketi al (iOS + Android boş kabuk).
14. Test checklist dosyasını oluştur (11. bölüm).
15. Düşük bir Android cihazda performans/animasyon testi yap.
16. Matematik doğruluğu scriptini CI/dağıtım öncesi zorunlu adım yap.
17. Trademark ön kontrolü: TÜRKPATENT ve EUIPO'da "MatReflex".
18. Store hesap planı: Apple Developer + Google Play zamanlaması.
19. Görsel varlık planı: ikon setleri + ekran görüntüsü şablonları (senin uzmanlık alanın).
20. Japonca/LGS uygulamalarını resmen "Phase 10 sonrası" olarak dondur.

---

## 17. Final Recommendation

**Proje iyi yolda mı?** Evet. Ürün fikri net ve ayırt edici, tasarım dili olgun ve belgelenmiş, özellik seti bir prototipin ötesinde. Zayıf olan taraf ürün değil, **üretim disiplini**: içerik mimarisi ve yayın yolu.

**En büyük darboğaz:** İçeriğin koda gömülü olması ve store yolunun seçilmemiş olması. İkisi çözülmeden v1.0'a gidilmez.

**Hemen durdurulması gerekenler:** (1) Yeni özellik/ekran ekleme dürtüsü, kapsam kilitlenene kadar. (2) React Native rewrite fikri. (3) Japonca ve LGS uygulamalarına vakit ayırma, MatReflex çıkana kadar.

**Odaklanılması gereken:** Önce içeriği koddan ayır (Phase 3), sonra MVP'yi kilitle ve cila (Phase 4), sonra Capacitor ile sar (Phase 5) ve beta'ya çık.

**Yayına giden en gerçekçi yol:** İçerik ayrımı → MVP kilit → Capacitor paketleme → TestFlight + Play Internal beta → v1.0. React Native ve app ailesi, yayından sonra. Bu yol MatReflex'i aylar değil, disiplinli birkaç fazda mağazaya taşır ve bugünkü el işçiliği hissini korur.
