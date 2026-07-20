import re
h = open("/home/claude/atlas_drive_may30.html", encoding="utf-8").read()
# shipped kaynaktan üç saf fonksiyonu birebir çıkar (drift yok)
def grab(name):
    m = re.search(r'(function '+name+r'\(.*?\n\})', h, re.S)
    assert m, name+" bulunamadı"
    return m.group(1)
src = "\n".join([grab("inKanjiReviewScope"), grab("buildKanjiReviewQueue"), grab("inspectKanjiReviewData")])
src += "\nmodule.exports = { inKanjiReviewScope, buildKanjiReviewQueue, inspectKanjiReviewData };\n"
open("/home/claude/faz2/srs_selector.extracted.js","w",encoding="utf-8").write(src)
print("çıkarıldı: srs_selector.extracted.js")
