# Faz 2 · Kalem 1 — Kanonik Aile Verisi: Karşılaştırma Raporu

> Kanonik `FAMILIES` + çözümleyici çıktısı, eski üç kaynakla (ATLAS_FAMILIES · EDGES · DATA.parent_components) karşılaştırıldı. Canlı render'a dokunulmadı; yalnız çıktı pariteği kanıtlandı. Üretim: `faz2/harness.js`.

## 1. Üye varlık denetimi (FAMILIES id → DATA içeriği)
✓ Tüm aile üyelerinin DATA'da içeriği var (içerik-ilişki ayrımı sağlam).

## 2. Ağaç (木) ailesi — kanonik ilişki vs eski kaynaklar

| Üye | ESKİ ATLAS_FAMILIES | ESKİ EDGES | DATA parent_components | KANONİK (via·rel) | Sonuç |
|---|---|---|---|---|---|
| 木 (kök) | kök | — | — | kök | ✓ |
| 林 | 木 | 木 | 木 | 木·repetition | ✓ uyum |
| 森 | 林 | 林 | 木 | 木·repetition | ÇÖZÜLDÜ: eski 林→森; kanonik 木→森 (森=3×木, ortak bileşen) |
| 本 | 木 | 木 | 木 | 木·indicator | ✓ uyum (rel=işaret: 木+一) |
| 休 | 木 | 木,人 | 人,木 | 木·composition | ÇÖZÜLDÜ: çapraz üye (ağaç[木]+insan[亻]); eski ATLAS 2 kopya düğüm → tek düğüm |

**Eski ATLAS_FAMILIES'te olup kanonik 木 vitrininden ÇIKARILANLAR:**
- 校: DATA parent_components=[boş] · parent_components boş; 交 fonetik — vitrin dışı (geniş aile sonraki fazda)
- 東: DATA parent_components=[boş] · DATA'da 木 bileşeni YOK → desteksiz bağ (düşürüldü)

## 3. Beş tüketici de aynı kaynaktan üretiliyor (木)

**(1) Aile şeridi** — 休 detayından: birincil aile + çapraz bağ
```
aile: Ağaç ailesi (kök 木) · üyeler: 木 林 森 本 休
çapraz aileler: İnsan ailesi(人)
```
**(2) Detail bağları** — 木'ten ilgili üyeler:
`林(repetition) · 森(repetition) · 本(indicator) · 休(composition)`
**(3) Grafik kenarları** (tüm aileler, düğüm dedup'lu):
- benzersiz düğüm: 9 · kenar: 8
- 休 düğümü TEK; üye olduğu aileler: [tree, person] (eski 103-düğümdeki çift kopya çözüldü)
- 木 ailesi kenarları: 木→林(repetition)  木→森(repetition)  木→本(indicator)  木→休(composition)
**(4) Aile listesi:**
- Ağaç ailesi · kök 木 · 5 üye
- İnsan ailesi · kök 人 · 5 üye
**(5) İlerleme** (storage'dan okur, örnek learned={ki,hayashi}):
- ağaç ailesi: 2/5 öğrenildi

## 4. Stres testi — "yeni aile = yalnız veri"

İkinci aile (`person`) yalnız FAMILIES'e VERİ olarak eklendi; çözümleyici koduna **tek satır** dokunulmadı. Yeni ilişki türleri: `variant` (亻), `extension` (大). Çözümleyici bunlara göre dallanmadan çalışıyor:
```
aile: İnsan ailesi · üyeler+rel: 人(root) 亻(variant) 大(extension) 天(composition) 休(composition)
```
- Kullanılan ilişki türleri (tümü tek çözümleyiciyle): repetition, indicator, composition, variant, extension
- Çapraz üye 休: familiesOf → [tree, person] · detail bağları 休: 木 林 森 本 人 亻 大 天
- **GEÇİT:** yeni aile eklemek renderer/SRS/storage/event/CSS/audio DEĞİŞMEDEN mümkün → KANIT: yeni rel türleri veri-only çalıştı ✓

## 5. Özet
- Ağaç ailesinde eski üç kaynağın **4 çelişkisi çözüldü**: 森 ebeveyni (林→木), 休 çift-düğümü (tek düğüm + çapraz üyelik), 校 (boş parent_components → vitrin dışı), 東 (desteksiz → düşürüldü).
- Beş tüketici çıktısı (şerit/detail/grafik/liste/ilerleme) **tek `FAMILIES` kaynağından** üretiliyor.
- İkinci aile yalnız veriyle eklendi; çözümleyici ilişki-türü-agnostik → **"yeni aile = yalnız veri" geçidi geçti.**
- Sınır korundu: `FAMILIES` içerik/ses/ilerleme tutmuyor (içerik DATA'dan, ilerleme storage'dan okundu).