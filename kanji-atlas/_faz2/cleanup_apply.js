/* FAZ 2 · Ölü kod temizliği UYGULA — onaylı kapsam (6 JS sembolü + 76 özellik-bağlı CSS sınıfı).
   CSS: postcss ile parse; ölü sınıf İÇEREN her seçici asla eşleşemez → güvenle çıkarılır (render korunur).
   JS: fonksiyon/sabit gövdeleri brace/bracket eşlemesiyle bulunur, tam çıkarılır.
   Çıktı: index.cleaned.html (orijinal EZİLMEZ; doğrulamadan sonra taşınır). */
const fs = require("fs");
const postcss = require("postcss");
const F = "/home/claude/apps-deploy/kanji-atlas/index.html";
let src = fs.readFileSync(F, "utf-8");

// --- ölü CSS sınıf kümesi (76) = 83 aday − 7 utility ---
const KEEP_UTIL = new Set(["bigchar","cmstory","extra-arr","extra-toggle","fadein","open","xs"]);
const all83 = JSON.parse(fs.readFileSync("/tmp/css_candidates.json","utf-8"));
const DEAD = new Set(all83.filter(c => !KEEP_UTIL.has(c)));
console.log("Ölü CSS sınıfı:", DEAD.size, "| korunan utility:", KEEP_UTIL.size);

// ============ CSS ============
const s0 = src.indexOf("<style>") + "<style>".length;
const s1 = src.indexOf("</style>");
const cssText = src.slice(s0, s1);

const selHasDead = sel => {
  const cls = [...sel.matchAll(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g)].map(m => m[1]);
  return cls.some(c => DEAD.has(c));
};
let removedRules = 0, trimmedSelectors = 0;
const root = postcss.parse(cssText);
root.walkRules(rule => {
  // @keyframes iç kuralları (0%, from, to) — sınıf değil, dokunma
  if (rule.parent && rule.parent.type === "atrule" && /keyframes/i.test(rule.parent.name)) return;
  const sels = rule.selectors;
  const keep = sels.filter(s => !selHasDead(s));
  if (keep.length === 0) { rule.remove(); removedRules++; }
  else if (keep.length !== sels.length) { rule.selector = keep.join(",\n"); trimmedSelectors += (sels.length - keep.length); }
});
// boşalan @media vb. at-rule'ları temizle
root.walkAtRules(at => { if (/^(media|supports)$/i.test(at.name) && at.nodes && at.nodes.length === 0) at.remove(); });
const cssOut = root.toString();
src = src.slice(0, s0) + cssOut + src.slice(s1);
console.log("CSS: silinen kural:", removedRules, "| kırpılan seçici:", trimmedSelectors);

// ============ JS ============
function removeBlock(text, startIdx, openCh, closeCh) {
  // startIdx: bloğun ilk açılış karakterine kadar taranır
  let i = text.indexOf(openCh, startIdx), depth = 0;
  for (; i < text.length; i++) {
    const c = text[i];
    if (c === openCh) depth++;
    else if (c === closeCh) { depth--; if (depth === 0) { i++; break; } }
  }
  // FAM_LABELS gibi const için sonraki ';'yi de yut
  if (closeCh === "]" && text[i] === ";") i++;
  return i;
}
function removeFunction(text, name) {
  const re = new RegExp("(?:^|\\n)function\\s+" + name.replace(/\$/g,"\\$") + "\\s*\\(");
  const m = re.exec(text);
  if (!m) { console.log("  ! bulunamadı:", name); return text; }
  const start = m.index + (text[m.index] === "\n" ? 1 : 0);
  const end = removeBlock(text, start, "{", "}");
  // izleyen tek newline'ı yut
  let e = end; if (text[e] === "\n") e++;
  console.log("  - fonksiyon:", name, "(" + (end - start) + " bayt)");
  return text.slice(0, start) + text.slice(e);
}
function removeConst(text, name) {
  const re = new RegExp("(?:^|\\n)const\\s+" + name + "\\s*=\\s*\\[");
  const m = re.exec(text);
  if (!m) { console.log("  ! bulunamadı:", name); return text; }
  const start = m.index + (text[m.index] === "\n" ? 1 : 0);
  const end = removeBlock(text, start, "[", "]");
  let e = end; if (text[e] === "\n") e++;
  console.log("  - const:", name, "(" + (end - start) + " bayt)");
  return text.slice(0, start) + text.slice(e);
}
console.log("JS:");
for (const fn of ["masteryOf","dueItems","compCount","homeReviewSection","suggestionCard"]) src = removeFunction(src, fn);
src = removeConst(src, "FAM_LABELS");

fs.writeFileSync("/home/claude/apps-deploy/kanji-atlas/index.cleaned.html", src);
console.log("\nYazıldı: index.cleaned.html — bayt:", src.length);
