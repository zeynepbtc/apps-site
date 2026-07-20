import re, sys
SRC = "/home/claude/atlas_drive_may30.html"
html = open(SRC, encoding="utf-8").read()

# --- test edilmis resolver'i enjekte et; SADECE FAMILIES -> FAMILIES_CANON (mevcut oyun FAMILIES[] ile cakismasin) ---
fam = open("/home/claude/faz2/families.js", encoding="utf-8").read()
fam = re.sub(r'\bFAMILIES\b', 'FAMILIES_CANON', fam)

INJ = (
"\n/* ===== FAZ 2 · Kalem 1: KANONIK AILE VERISI + COZUMLEYICI (canli) ===== */\n"
+ fam +
"""
const FR = makeResolver(DATA.chars);
const REL_LABEL = {root:"kök", repetition:"tekrar", composition:"birleşim", indicator:"işaret", variant:"biçim", extension:"uzantı"};
const __famStats = (typeof window!=="undefined") ? (window.__famStats = {canon:0, fallback:0, fallbackIds:[]}) : {canon:0, fallback:0, fallbackIds:[]};
"""
)

ANCHOR = 'const CHAR2ID = {}; Object.keys(DATA.chars).forEach(id=>{ const c=DATA.chars[id]; if(c.character && CHAR2ID[c.character]===undefined) CHAR2ID[c.character]=id; });'
assert html.count(ANCHOR) == 1, "CHAR2ID anchor not unique: %d" % html.count(ANCHOR)
html = html.replace(ANCHOR, ANCHOR + "\n" + INJ, 1)

# --- familyStrip'i kanonik-oncelikli sarmalayiciyla degistir; eski govde legacyFamilyStrip olur ---
SIG = "function familyStrip(c, id){"
assert html.count(SIG) == 1, "familyStrip sig not unique: %d" % html.count(SIG)

NEW = r'''function familyStrip(c, id){
  const canon = FR.familyStripData(id);          // KANONIK ONCELIK
  if(canon){ __famStats.canon++; return renderCanonFamily(canon, id); }
  __famStats.fallback++; __famStats.fallbackIds.push(id);   // fallback RAPORLANIR
  try{ return legacyFamilyStrip(c, id); }
  catch(e){ console.warn("[familyStrip] fallback error:", id, e); return ""; }  // kontrollu: cokme yok
}
function relLabel(r){ return REL_LABEL[r] || r; }
function famShort(lbl){ return (lbl||"").replace(/ ailesi$/,""); }
function renderCanonFamily(canon, id){
  const chips = canon.members.map(n=>{
    const dc = DATA.chars[n.id] || {};
    const cur = n.id===id;
    const lvl = (dc.jlpt_level && dc.jlpt_level!=="N5")?`<span class="flv">${dc.jlpt_level}</span>`:"";
    return `<div class="fam-chip ${cur?'cur':''}" ${cur?'':`data-go="detail" data-param="${n.id}" role="button" aria-label="${esc((dc.meaning_tr||'')+' — '+relLabel(n.rel))}"`} title="${esc(n.note||relLabel(n.rel))}">
      <span class="ff">${relLabel(n.rel)}</span>
      <span class="fg jp">${n.char||''}</span>
      <span class="fm">${esc(dc.meaning_tr||'')}</span>
      ${lvl}
    </div>`;
  }).join("");
  const sec = canon.secondaryFamilies || [];
  const lead = sec.length
    ? `Ana yapı bağlantısı: <b>${esc(famShort(canon.label))}</b> · Ayrıca bağlantılı: ${sec.map(f=>esc(famShort(f.label))).join(", ")}`
    : `Bu kanji yalnız değil — aynı yapıdan gelenler. Dokun, ailede gez.`;
  return `<div class="section-t"><h3>${esc(canon.label)}</h3></div>
    <div class="lead" style="margin:-4px 2px 10px">${lead}</div>
    <div class="fam-strip">${chips}</div>`;
}
function legacyFamilyStrip(c, id){'''

html = html.replace(SIG, NEW, 1)
open(SRC, "w", encoding="utf-8").write(html)
print("edits applied OK")
