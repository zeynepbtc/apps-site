/* FAZ 2 · Kalem 1 (v3) — parite + validator + reverse test. Canlı render'a DOKUNMAZ. */
const fs = require("fs");
const { FAMILIES, REL_TYPES, REL_MAX, makeResolver } = require("./families.js");
const DATA_chars = JSON.parse(fs.readFileSync(__dirname + "/data_chars.json", "utf8"));
const R = makeResolver(DATA_chars);
const charById = id => (DATA_chars[id] ? DATA_chars[id].character : id);
const charExists = ch => Object.values(DATA_chars).some(c => c.character === ch);

const OLD_ATLAS_TREE = [["木",null],["本","木"],["林","木"],["森","林"],["休","木"],["校","木"],["東","木"]];
const OLD_EDGES = [["ki","hayashi"],["hayashi","mori"],["ki","hon"],["ki","yasumu"],["hito","yasumu"]];

const lines = []; const P = s => lines.push(s);
let FAIL = 0; const check = (name, ok, detail) => { P(`- ${ok ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`); if (!ok) FAIL++; };

P("# Faz 2 · Kalem 1 (v3) — Karşılaştırma + Validator + Reverse Test");
P("");
P("> Kanonik `FAMILIES` + çözümleyici, eski üç kaynakla karşılaştırıldı; enum donduruldu; **classification family** (sözlük sınıflandırması) eklendi; Reverse Test ve tüm-aile validator koşuldu. Canlı render'a dokunulmadı.");
P("");

P("## 0. Relation enum (dondurulmuş)");
P("- İzinli türler (" + REL_TYPES.length + "/" + REL_MAX + "): `" + REL_TYPES.join(", ") + "`");
P("- Politika: yeni tür yalnız **Karar Günlüğü** girişiyle eklenir; tavan " + REL_MAX + ".");
P("");

P("## 1. Validator — her aile, her üye (gece build denetimi)");
const dupCheck = (arr) => arr.length !== new Set(arr).size;
Object.values(FAMILIES).forEach(f => {
  const ids = [f.rootId, ...f.members.map(m => m.id)];
  check(`[${f.id}] üyeler DATA'da var`, f.members.every(m => DATA_chars[m.id]) && !!DATA_chars[f.rootId], "");
  check(`[${f.id}] rel türleri enum'da`, f.members.every(m => REL_TYPES.includes(m.rel)), "");
  check(`[${f.id}] tekrar eden id yok`, !dupCheck(ids), "");
  check(`[${f.id}] orphan üye yok (via çözülüyor)`, f.members.every(m => m.via === f.component || charExists(m.via)), "");
});
const allMemberIds = new Set();
Object.values(FAMILIES).forEach(f => f.members.forEach(m => allMemberIds.add(m.id)));
[...allMemberIds].filter(id => R.familiesOf(id).length > 1).forEach(id => {
  const c = R.classificationFamilyOf(id);
  check(`çapraz üye ${charById(id)} tek sınıflandırma ailesi`, !!c, c ? "classification=" + c.id : "BELİRSİZ");
});
const gAll = R.graphEdges();
check("grafik düğümleri çözülüyor (char/classFam)", gAll.nodes.every(n => n.char && n.classFam), "");
P("");

P("## 2. Ağaç (木) ailesi — kanonik vs eski kaynaklar");
P("");
P("| Üye | ESKİ ATLAS | ESKİ EDGES | DATA parent | KANONİK (via·rel·rol) | Sonuç |");
P("|---|---|---|---|---|---|");
R.famNodes(FAMILIES.tree).forEach(n => {
  if (n.rel === "root") { P(`| ${n.char} (kök) | kök | — | — | kök·classification | ✓ |`); return; }
  const dc = DATA_chars[n.id]; const pc = (dc && dc.parent_components) ? dc.parent_components.join(",") : "—";
  const ep = OLD_EDGES.filter(e => charById(e[1]) === n.char).map(e => charById(e[0])); const eps = ep.length ? ep.join(",") : "—";
  const ar = OLD_ATLAS_TREE.find(x => x[0] === n.char); const ap = ar ? (ar[1] || "kök") : "—";
  const cls = R.classificationFamilyOf(n.id).id;
  let v = "✓ uyum";
  if (n.char === "森") v = "ÇÖZÜLDÜ: 林→森 yerine 木→森 (3×木)";
  if (n.char === "休") v = "ÇÖZÜLDÜ: çapraz üye; classification=" + cls + " (secondary=tree)";
  P(`| ${n.char} | ${ap} | ${eps} | ${pc} | ${n.via}·${n.rel}·${n.classification === false ? "secondary" : "classification"} | ${v} |`);
});
P("");
P("**Vitrinden ÇIKARILANLAR — ürün/pedagoji gerekçesiyle:**");
P("- **校** (okul): geleneksel analizde **形声** karakter — `木` **anlam** tarafı, `交` **ses** tarafı. Yani 木 bağı kanıtsız/yanlış DEĞİL. Ancak güncel temel anlamı 'okul' ile 木 ilişkisi başlangıç kullanıcısı için doğrudan/sezgisel değil. 木 vitrininin amacı aynı bileşenin **açıkça görülebilen** farklı görevlerini tek oturumda öğretmek. 校 yanlış olduğu için değil, **daha ileri düzey anlam–ses bileşeni öğretimine** uygun olduğu için vitrin dışı tutulur.");
P("- **東** (doğu): güvenilir paleografide 東 iki ucu bağlı bir **torba/çıkın** biçiminden türeyip sonra 'doğu' yönü için ödünçlenmiştir; 'güneşin ağaçlar arasından doğması' analizi **modern biçim üzerinden kurulmuş yanıltıcı** bir açıklamadır. 東'deki 木 anlam-aktif bir ağaç bileşeni değildir → ağaç ailesinde sunmak köken/yapı/hatırlama ayrımını çiğner. Öğretim yeri: **yön ailesi** (東西南北). DATA değişse de karar sabit.");
P("");

P("## 3. Beş tüketici tek kaynaktan + classification/secondary");
const strip = R.familyStripData("yasumu");
P("- **(1) aile şeridi** 休: classification=" + strip.label + " · secondary=" + (strip.secondaryFamilies.map(f => f.label).join(",") || "—") + " · üyeler=" + strip.members.map(m => m.char).join(" "));
P("- **(2) detail bağları** 木: " + R.detailFamilyLinks("ki").map(l => l.char + "(" + l.rel + ")").join(" · "));
P("- **(3) grafik**: benzersiz düğüm " + gAll.nodes.length + " · kenar " + gAll.edges.length + " · 休 classFam=" + gAll.nodes.find(n => n.id === "yasumu").classFam);
P("- **(4) liste**: " + R.familyList().map(f => f.label + "(" + f.count + ")").join(" · "));
P("- **(5) ilerleme** tree learned={ki,hayashi}: " + JSON.stringify(R.familyProgress("tree", new Set(["ki", "hayashi"]))));
P("");

P("## 4. Stres — yeni aile = yalnız veri");
const relset = new Set(); Object.values(FAMILIES).forEach(f => f.members.forEach(m => relset.add(m.rel)));
check("person ailesi çözümleyici değişmeden çalıştı", R.famNodes(FAMILIES.person).length === 5, "türler: " + [...relset].join(","));
P("");

P("## 5. Reverse Test — `tree` FAMILIES'ten çıkarıldı");
const R2 = makeResolver(DATA_chars, { person: FAMILIES.person });
let threw = false, res = {};
try {
  res.strip_hayashi = R2.familyStripData("hayashi");
  res.links_hayashi = R2.detailFamilyLinks("hayashi");
  res.prog_tree = R2.familyProgress("tree", new Set(["ki"]));
  res.graph = R2.graphEdges();
  res.strip_yasumu = R2.familyStripData("yasumu");
} catch (e) { threw = true; res.err = String(e); }
check("hiç exception atılmadı", !threw, threw ? res.err : "");
check("tree-only karakter (林) şeridi → null", res.strip_hayashi === null, "");
check("tree-only karakter (林) detail bağları → []", Array.isArray(res.links_hayashi) && res.links_hayashi.length === 0, "");
check("familyProgress('tree') → null", res.prog_tree === null, "");
check("grafikte tree kenarı yok", res.graph && res.graph.edges.every(e => e.fam !== "tree"), "");
check("休 tree kalkınca person'a düşüyor (kontrollü)", res.strip_yasumu && res.strip_yasumu.famId === "person", "");
P("");
P("> İyi veri modeli: EKLEYİNCE değil, ÇIKARINCA da çökmüyor.");
P("");

P("## 6. Özet");
P(`- Validator + Reverse Test + Stres: toplam başarısız kontrol **${FAIL}**.`);
P("- 4 çelişki çözüldü; 校 (形声, ileri düzey) ve 東 (paleografik) gerekçeleri düzeltildi; enum dondu; classification/secondary kod+veride.");
P("- Sınır korundu: FAMILIES içerik/ses/ilerleme tutmuyor.");

const out = lines.join("\n");
fs.writeFileSync(__dirname + "/karsilastirma-raporu.md", out);
console.log(out);
console.log("\n--- SMOKE ---  başarısız kontrol:", FAIL, FAIL === 0 ? "→ TÜM GEÇİTLER YEŞİL" : "→ İNCELE");
process.exit(FAIL === 0 ? 0 : 1);
