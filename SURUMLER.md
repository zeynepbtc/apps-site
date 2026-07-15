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
