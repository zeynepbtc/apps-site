# MatReflex — Tasarım Şifreleri

*Pratik referans. Fiziksel Arayüz Dili belgesinin "nasıl" tarafı: gerçek değerler, bileşenler, kurallar. Yeni ekran yaparken buraya bak.*

---

## 1. Renk

Sıcak, topraksı, muted. Bağırmaz, işaret eder. Bir nesnenin kimliğini rengi taşır.

**Zemin ve metin**
- Krem zemin `#EFE9DC` · Yüzey (kart) `#FCFAF4` · Kağıt (iç yüzey) `#F2ECDF`
- Metin koyu `#2A2521` · yumuşak `#6B6459` · silik `#A79E8F` · çizgi `#E4DBCB`

**Aksan paleti** (her nesne bir aksan alır)
- Petrol `#1B5C52` / `#2E6E5E` · Teal `#279B8E` / `#3B9384`
- Adaçayı `#7E9256` · Hardal `#C99A3E` / `#D9A92F` · Kil `#CB8A5E` / `#D98573`
- Mercan `#E24C5B` · Turuncu `#E8752A` (Pratik ve ana eylem rengi)
- Yasal/nötr: gri-yeşil `#5C6E68`, arduvaz `#5F6A70`, sıcak gri `#6E6A62`

**Kural:** Renkli yüzeyler hep tint (aksanın %10-20'si krem üstünde), tok değil. Bir dizide renkler soğuktan sıcağa uyumlu akar (petrol → teal → adaçayı → hardal → kil → mercan). Metin, renkli zeminde aynı ailenin koyu tonu.

---

## 2. Tipografi

- **Fredoka** (600): başlıklar, isimler, tüm sayılar. Yuvarlak, sıcak, dost.
- **Inter** (400/500/600): gövde, açıklama, etiket.
- **Fraunces** (serif): yalnızca nadir editoryal an gerekirse. Varsayılan değil.
- Boyut: başlık 17-24px, gövde 13-14px, etiket/eyebrow 10.5-12px (büyük harf, letter-spacing .12em).
- Cümle düzeni: her yerde küçük harf başlangıç (eyebrow'lar hariç). Title Case yok.

---

## 3. Hareket (fizik)

Doğrusal hareket yok. Her şey yayla biter, hafif taşar, yerine oturur.

- **Yay eğrisi:** `cubic-bezier(.34,1.3,.5,1)` (ana). Basış için `.18s`, açılma için `.35-.5s`.
- **Giriş animasyonu (hpop):** `opacity 0→1` + `translateY(12px) scale(.95) → none`, süre `.5s`, yayla.
- **Ritim (kademeli beliriş):** nesneler aynı anda değil, `~.06s` arayla sırayla belirir. Arayüz nefes alarak açılır.
- **Basış:** dokununca `scale(.98)` çöker, bırakınca yaylanır. Öne çıkan yükselir + gölge derinleşir, komşular geri çekilir.
- **Hareket azaltma:** tercih açıksa tüm süreler ~0. Her animasyon opsiyonel.

---

## 4. Biçim, gölge, derinlik

- **Köşe:** kart 18-24px, hap/pill 99px, ikon karesi 13-15px. Tek yönlü kenarda yuvarlatma yok.
- **Gölge (yumuşak, tek ışık yukarıdan):**
  - Düz kart: `0 1px 2px rgba(38,32,24,.05), 0 15px 26px -17px rgba(38,32,24,.32)`
  - Yükseltilmiş: `0 4px 10px rgba(...,.08), 0 32px 54px -22px rgba(...,.42)`
- **Kabartma ikon:** yuvarlak, üstte iç ışık `inset 0 1px 1px #fff9`, altta iç gölge `inset 0 -3px 5px rgba(0,0,0,.14)`, dışta `0 5px 10px -4px`.
- **Kağıt kıvrımı:** şeridin sol kenarında aksan bandı + hemen yanında ince iç gölge (katman hissi).
- **Yasak:** hizasızlık, rastgele döndürme, sahte parallax, cam efekti, neon.

---

## 5. Nesneler (bileşen kütüphanesi)

- **Şerit (rib):** menü nesnesi. Aksan tint dolgu, solda renk bandı + kıvrım gölgesi, sağda kabartmalı yuvarlak ikon. Dokununca akordeon açılır ya da çekmece çağırır. `min-height` ver (WebKit kırpma tuzağına düşmemek için). Blok yerleşim kullan, dikey flex butonundan kaçın.
- **Akordeon (progressive disclosure):** kısa içerik yerinde açılır; nesne büyür, içerik başka yere taşınmaz. `max-height 0 → yeterli` + `opacity`, yayla. Önce özü göster, isteyince detayı aç.
- **Çekmece (sheet):** uzun içerik alttan yayla gelir. Arka plan bulanık + hafif karartılmış (`backdrop-filter:blur(5px)`), görünür kalır. Kapanınca iz bırakmaz.
- **Akış Kartı (flow):** yöntem anlatımı. Üstte problem, aşağı oklarla adımlar (her okun yanında kısa not), altta aksan renginde dolu iri sonuç kartı. Kritik rakam aksanla vurgulanır. Birden çok durum varsa etiketli ayrı akışlar.
- **Deste (deck):** pratik seçimi. Dokununca doğrudan başlar, ayrı "başlat" adımı yok. Katmanlı gölgeyle kağıt yığını.
- **Plaka (plaque):** profil/başlık levhası. Künye + birkaç sayısal rozet, her rozetin solunda ince renk şeridi.
- **Tablo Hücresi:** küçük kare, sayı taşır. Yan yana dizilince desen oluşur (ör. taşımalı/taşımasız iki renkte).
- **Anahtar (toggle):** fiziksel açma-kapama; topuz raydan yayla kayar.

---

## 6. Dil (kopya)

Tam liste: `mental-math-dil-rehberi.md`. Özet:
- Emir kipi yok; davet kipi ("Başlayalım") ya da isim öbeği.
- Karşılaştırma, klişe yok ("yolculuk", "potansiyel", "daha iyi düşün" yok).
- Em/en tire yok (—, –). Doğal, idiomatik Türkçe.
- Sakin, cezasız ton. Terimler: **Ustalık** (kalıcı) ≠ **Form** (günlük).

---

## 7. Yeni bir şey eklerken

Tek soru: **"Bu hangi nesne?"** Bir şerit mi, deste mi, çekmece mi, akış kartı mı?
Aynı kağıt, aynı ışık, aynı yay, aynı hiyerarşi. Yeni görsel dil icat etme; var olan nesneyi yeni bir dizilişte kullan.

Kimlik özeti (Fiziksel Arayüz Dili belgesinden):
> Ekranlar tasarlamıyoruz; ekranda yaşayan fiziksel nesneler tasarlıyoruz.
> Meraklı, nazik, zanaatkâr, sabırlı. Asla gösteriş, asla acele. Sakin bir pazar sabahı gibi.
> **Sayılar da nesnedir:** gruplanır, ayrılır, katlanır, istiflenir, tamamlanır, taşınır. Arayüz, matematiksel düşünmeyi elle tutulur kılar.
