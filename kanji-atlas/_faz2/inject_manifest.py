import json, re, sys

REPO = "/home/claude/apps-deploy"
HTML = f"{REPO}/kanji-atlas/index.html"
MAN  = f"{REPO}/kanji-atlas/audio-manifest.json"

KAT = {"kana", "kanji", "word", "sentence"}
DURUM = {"recorded", "tts", "missing"}
KAYNAK = {"flick", "yeni"}
ROOTS = ("audio/kana/", "audio/kanji/", "audio/word/", "audio/sentence/")

# ---- Gate 1: JSON şema doğrulamasından geçmeden HTML üretilmez ----
man = json.load(open(MAN, encoding="utf-8"))
E = man.get("entries", [])
errs = []
ids = set()
for e in E:
    i = e.get("id")
    if not i or i in ids: errs.append(f"id benzersiz değil/eksik: {i}")   # Gate 2
    ids.add(i)
    if e.get("kategori") not in KAT: errs.append(f"kategori enum dışı: {i}")  # Gate 3
    if e.get("durum") not in DURUM: errs.append(f"durum enum dışı: {i}")
    if e.get("kaynak") not in KAYNAK: errs.append(f"kaynak enum dışı: {i}")
    if e.get("durum") == "recorded" and not e.get("ses_dosyasi"):            # Gate 4
        errs.append(f"recorded ama ses_dosyası boş: {i}")
    if e.get("durum") in ("tts", "missing") and e.get("ses_dosyasi") is not None:  # Gate 5
        errs.append(f"tts/missing ama ses_dosyası null değil: {i}")
    sd = e.get("ses_dosyasi")
    if sd is not None and not any(sd.startswith(r) for r in ROOTS):          # Gate 6
        errs.append(f"yol normalize kök dışı: {i} → {sd}")
if not (man.get("_meta") and man["_meta"].get("pedagojik_hukum")):
    errs.append("_meta.pedagojik_hukum eksik")

if errs:
    print("GEÇERSİZ MANİFEST — HTML EZİLMEDİ (Gate 1/9):")
    for x in errs[:10]: print("  -", x)
    sys.exit(1)

# ---- Gömülen blok: byte-identical, kompakt, deterministik (Gate 7/8) ----
compact = json.dumps(man, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
block = ("/* FAZ2_AUDIO_MANIFEST_START — kanonik kaynak: audio-manifest.json. "
         "Runtime FETCH YOK; build'de gömüldü. Elle düzenleme; JSON'u düzenle + inject_manifest.py çalıştır. */\n"
         f"const AUDIO_MANIFEST = {compact};\n"
         "/* FAZ2_AUDIO_MANIFEST_END */")

h = open(HTML, encoding="utf-8").read()

# ---- İdempotent enjeksiyon (anchor varsa değiştir, yoksa DATA satırından sonra ekle) ----
pat = re.compile(r"/\* FAZ2_AUDIO_MANIFEST_START.*?FAZ2_AUDIO_MANIFEST_END \*/", re.S)
if pat.search(h):
    h2 = pat.sub(lambda m: block, h, count=1)
else:
    anchor = re.search(r"^const DATA = .*?;\n", h, re.M)
    assert anchor, "DATA satırı bulunamadı"
    idx = anchor.end()
    h2 = h[:idx] + block + "\n" + h[idx:]

# ---- Gate 9: sadece geçerli manifestte yaz (buraya geldiysek geçerli) ----
open(HTML, "w", encoding="utf-8").write(h2)
print(f"AUDIO_MANIFEST gömüldü — {len(E)} kayıt, blok {len(block)} bayt")
