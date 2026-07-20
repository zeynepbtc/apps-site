import re, json, os

REPO = "/home/claude/apps-deploy"
h = open(f"{REPO}/kanji-atlas/index.html", encoding="utf-8").read()
m = re.search(r'const DATA\s*=\s*(\{.*?\});', h, re.S)
d = json.loads(m.group(1))

flick_kana = set(os.path.splitext(f)[0] for f in os.listdir(f"{REPO}/japanese-flick/audio/kana"))
flick_word = set(os.path.splitext(f)[0] for f in os.listdir(f"{REPO}/japanese-flick/audio/word"))

def kana_rows(rows):
    out = []
    for r in rows:
        for c in (r if isinstance(r, list) else []):
            if isinstance(c, dict) and c.get("character"):
                out.append(c)
    return out

entries = []

# --- KANA (hiragana + katakana) ---
for script, key in (("hira", "hiragana"), ("kata", "katakana")):
    for c in kana_rows(d.get(key, [])):
        romaji = c.get("romaji", "")
        in_flick = romaji in flick_kana
        entries.append({
            "id": f"kana_{script}_{romaji}",
            "kategori": "kana",
            "metin": c["character"],
            "okunus": romaji,
            "ses_dosyasi": f"audio/kana/{romaji}.mp3" if in_flick else None,
            "kaynak": "flick" if in_flick else "yeni",
            "durum": "recorded" if in_flick else "missing",
        })

# --- KANJI (temsilî tek okunuş — pedagojik) ---
for c in [x for x in d["chars"].values() if x.get("type") == "kanji"]:
    romaji = c.get("romaji", "")
    if romaji in flick_kana:
        path, src = f"audio/kana/{romaji}.mp3", "flick"      # okunuş kana sesinden
    elif romaji in flick_word:
        path, src = f"audio/word/{romaji}.mp3", "flick"      # okunuş kelime sesinden
    else:
        path, src = f"audio/kanji/{romaji}.mp3", "yeni"
    entries.append({
        "id": f"kanji_{c['id']}",
        "kategori": "kanji",
        "metin": c["character"],
        "okunus": romaji,
        "ses_dosyasi": path if src == "flick" else None,
        "kaynak": src,
        "durum": "recorded" if src == "flick" else "missing",
        "dogrulanmali": src == "flick",   # Flick eşleşmesi bağlamca doğrulanacak (temsilî okunuş)
    })

# --- WORD ---
for w in d["words"]:
    romaji = w.get("romaji", "")
    in_flick = romaji in flick_word
    entries.append({
        "id": f"word_{w['id']}",
        "kategori": "word",
        "metin": w["word_jp"],
        "okunus": romaji,
        "ses_dosyasi": f"audio/word/{romaji}.mp3" if in_flick else None,
        "kaynak": "flick" if in_flick else "yeni",
        "durum": "recorded" if in_flick else "missing",
        "dogrulanmali": in_flick,
    })

# --- SENTENCE (şimdilik TTS) — metne göre TEKİL (kategori-içi duplicate=0) ---
_seen_sent = set()
for w in d["words"]:
    _s = w.get("example_sentence_jp", "")
    if not _s or _s in _seen_sent:   # aynı cümleyi paylaşan kelimeler tek entry
        continue
    _seen_sent.add(_s)
    entries.append({
        "id": f"sentence_{w['id']}",
        "kategori": "sentence",
        "metin": _s,
        "okunus": w.get("example_sentence_romaji", ""),
        "ses_dosyasi": None,
        "kaynak": "yeni",
        "durum": "tts",
    })

manifest = {
    "_meta": {
        "surum": 1,
        "aciklama": "Kanji Atlas ses manifesti — Atlas/Flick/PTJ ortak yapisi. Kanonik kaynak; kod bunu okur.",
        "pedagojik_hukum": "Karakter (kanji) sesi pedagojik temsili okunustur; tum okunuslari temsil ettigi iddia edilmez.",
        "durum_enum": ["recorded", "tts", "missing"],
        "kaynak_enum": ["flick", "yeni"],
        "klasor_yapisi": ["audio/kana/", "audio/kanji/", "audio/word/", "audio/sentence/"],
    },
    "entries": entries,
}

out = f"{REPO}/kanji-atlas/audio-manifest.json"
open(out, "w", encoding="utf-8").write(json.dumps(manifest, ensure_ascii=False, indent=2))

# özet
from collections import Counter
byk = Counter(e["kategori"] for e in entries)
byd = Counter(e["durum"] for e in entries)
print("toplam kayıt:", len(entries))
print("kategori:", dict(byk))
print("durum:", dict(byd))
print("yazıldı:", out)
