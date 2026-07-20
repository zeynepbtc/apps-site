# Faz 2 · Kalem 1 (v3) — Karşılaştırma + Validator + Reverse Test

> Kanonik `FAMILIES` + çözümleyici, eski üç kaynakla karşılaştırıldı; enum donduruldu; **classification family** (sözlük sınıflandırması) eklendi; Reverse Test ve tüm-aile validator koşuldu. Canlı render'a dokunulmadı.

## 0. Relation enum (dondurulmuş)
- İzinli türler (6/10): `root, repetition, composition, indicator, variant, extension`
- Politika: yeni tür yalnız **Karar Günlüğü** girişiyle eklenir; tavan 10.

## 1. Validator — her aile, her üye (gece build denetimi)
- ✓ [tree] üyeler DATA'da var
- ✓ [tree] rel türleri enum'da
- ✓ [tree] tekrar eden id yok
- ✓ [tree] orphan üye yok (via çözülüyor)
- ✓ [person] üyeler DATA'da var
- ✓ [person] rel türleri enum'da
- ✓ [person] tekrar eden id yok
- ✓ [person] orphan üye yok (via çözülüyor)
- ✓ çapraz üye 休 tek sınıflandırma ailesi — classification=person
- ✓ grafik düğümleri çözülüyor (char/classFam)

## 2. Ağaç (木) ailesi — kanonik vs eski kaynaklar

| Üye | ESKİ ATLAS | ESKİ EDGES | DATA parent | KANONİK (via·rel·rol) | Sonuç |
|---|---|---|---|---|---|
| 木 (kök) | kök | — | — | kök·classification | ✓ |
| 林 | 木 | 木 | 木 | 木·repetition·classification | ✓ uyum |
| 森 | 林 | 林 | 木 | 木·repetition·classification | ÇÖZÜLDÜ: 林→森 yerine 木→森 (3×木) |
| 本 | 木 | 木 | 木 | 木·indicator·classification | ✓ uyum |
| 休 | 木 | 木,人 | 人,木 | 木·composition·secondary | ÇÖZÜLDÜ: çapraz üye; classification=person (secondary=tree) |

**Vitrinden ÇIKARILANLAR — ürün/pedagoji gerekçesiyle:**
- **校** (okul): geleneksel analizde **形声** karakter — `木` **anlam** tarafı, `交` **ses** tarafı. Yani 木 bağı kanıtsız/yanlış DEĞİL. Ancak güncel temel anlamı 'okul' ile 木 ilişkisi başlangıç kullanıcısı için doğrudan/sezgisel değil. 木 vitrininin amacı aynı bileşenin **açıkça görülebilen** farklı görevlerini tek oturumda öğretmek. 校 yanlış olduğu için değil, **daha ileri düzey anlam–ses bileşeni öğretimine** uygun olduğu için vitrin dışı tutulur.
- **東** (doğu): güvenilir paleografide 東 iki ucu bağlı bir **torba/çıkın** biçiminden türeyip sonra 'doğu' yönü için ödünçlenmiştir; 'güneşin ağaçlar arasından doğması' analizi **modern biçim üzerinden kurulmuş yanıltıcı** bir açıklamadır. 東'deki 木 anlam-aktif bir ağaç bileşeni değildir → ağaç ailesinde sunmak köken/yapı/hatırlama ayrımını çiğner. Öğretim yeri: **yön ailesi** (東西南北). DATA değişse de karar sabit.

## 3. Beş tüketici tek kaynaktan + classification/secondary
- **(1) aile şeridi** 休: classification=İnsan ailesi · secondary=Ağaç ailesi · üyeler=人 亻 大 天 休
- **(2) detail bağları** 木: 林(repetition) · 森(repetition) · 本(indicator) · 休(composition)
- **(3) grafik**: benzersiz düğüm 9 · kenar 8 · 休 classFam=person
- **(4) liste**: Ağaç ailesi(5) · İnsan ailesi(5)
- **(5) ilerleme** tree learned={ki,hayashi}: {"famId":"tree","learned":2,"total":5}

## 4. Stres — yeni aile = yalnız veri
- ✓ person ailesi çözümleyici değişmeden çalıştı — türler: repetition,indicator,composition,variant,extension

## 5. Reverse Test — `tree` FAMILIES'ten çıkarıldı
- ✓ hiç exception atılmadı
- ✓ tree-only karakter (林) şeridi → null
- ✓ tree-only karakter (林) detail bağları → []
- ✓ familyProgress('tree') → null
- ✓ grafikte tree kenarı yok
- ✓ 休 tree kalkınca person'a düşüyor (kontrollü)

> İyi veri modeli: EKLEYİNCE değil, ÇIKARINCA da çökmüyor.

## 6. Özet
- Validator + Reverse Test + Stres: toplam başarısız kontrol **0**.
- 4 çelişki çözüldü; 校 (形声, ileri düzey) ve 東 (paleografik) gerekçeleri düzeltildi; enum dondu; classification/secondary kod+veride.
- Sınır korundu: FAMILIES içerik/ses/ilerleme tutmuyor.