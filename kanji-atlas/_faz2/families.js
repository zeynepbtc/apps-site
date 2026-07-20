/* ============================================================
   FAZ 2 · Kalem 1 — KANONİK AİLE VERİSİ + ÇÖZÜMLEYİCİ  (v3)
   ------------------------------------------------------------
   SINIR (kilitli): FAMILIES yalnız AİLE İLİŞKİLERİNİN kanonik
   kaynağıdır. İçerik DATA'da, ses manifestte, ilerleme storage'da.
   ------------------------------------------------------------
   GEÇİT-1 (enum dondu): Yeni relation type yalnız Karar Günlüğü'ne
     giriş yapıldıktan sonra eklenir. Tavan: 10.
   GEÇİT-2 (classification family): Bir karakterin TEK sınıflandırma
     ailesi vardır = sözlük radikalinin ailesi. Bu SÖZLÜK sınıflandırması;
     "öğrenmenin en iyi başlangıcı" İDDİASI DEĞİL. İlerleme hesabı bunu
     kullanabilir; öneri motoru ileride seviye+öğrenilmiş bileşen+kelime
     değerini BİRLİKTE değerlendirir — yalnız radikale mahkûm değil.
   ============================================================ */

const REL_TYPES = Object.freeze([
  "root", "repetition", "composition", "indicator", "variant", "extension"
]);
const REL_MAX = 10;

const FAMILIES = {
  tree: {
    id: "tree", label: "Ağaç ailesi", component: "木", rootId: "ki",
    members: [
      { id: "hayashi", rel: "repetition",  via: "木", note: "iki ağaç" },
      { id: "mori",    rel: "repetition",  via: "木", note: "üç ağaç" },
      { id: "hon",     rel: "indicator",   via: "木", note: "ağaç + temel/kök işareti (一)" },
      // 休: sözlük sınıflandırması İnsan (radikal 亻); ağaç ailesine İKİNCİL bağlı
      { id: "yasumu",  rel: "composition", via: "木", note: "insan (亻) + ağaç → dinlenen kişi", classification: false }
    ],
    learningOrder: ["ki", "hayashi", "mori", "hon", "yasumu"]
  },
  person: {
    id: "person", label: "İnsan ailesi", component: "人", rootId: "hito",
    members: [
      { id: "r_nin",  rel: "variant",     via: "人", note: "人'nin sol/yan biçimi (亻)" },
      { id: "dai",    rel: "extension",   via: "人", note: "kollarını açmış insan → büyük" },
      { id: "ten",    rel: "composition", via: "大", note: "büyük insanın üstünde çizgi → gök" },
      // 休: sözlük sınıflandırma ailesi (radikal 亻)
      { id: "yasumu", rel: "composition", via: "亻", note: "insan (亻) + ağaç → dinlenmek", classification: true }
    ],
    learningOrder: ["hito", "r_nin", "dai", "ten", "yasumu"]
  }
};

function makeResolver(DATA_chars, families) {
  const FAM = families || FAMILIES;
  const fams = () => Object.values(FAM);
  const charOf = id => (DATA_chars[id] ? DATA_chars[id].character : null);

  function famNodes(fam) {
    const root = { id: fam.rootId, char: charOf(fam.rootId) || fam.component, rel: "root", via: null, note: null, missing: !DATA_chars[fam.rootId] };
    const members = fam.members.map(m => ({
      id: m.id, char: charOf(m.id), rel: m.rel, via: m.via, note: m.note,
      classification: m.classification, missing: !DATA_chars[m.id]
    }));
    return [root, ...members];
  }
  function familiesOf(id) {
    return fams().filter(f => f.rootId === id || f.members.some(m => m.id === id));
  }
  // GEÇİT-2: sözlük sınıflandırma ailesi (radikal ailesi). Tekil.
  function classificationFamilyOf(id) {
    const rootFam = fams().find(f => f.rootId === id);
    if (rootFam) return rootFam;
    const mem = fams().filter(f => f.members.some(m => m.id === id));
    if (!mem.length) return null;
    const explicit = mem.find(f => f.members.find(m => m.id === id).classification === true);
    if (explicit) return explicit;
    const nonSecondary = mem.filter(f => f.members.find(m => m.id === id).classification !== false);
    if (nonSecondary.length === 1) return nonSecondary[0];
    return mem.length === 1 ? mem[0] : null;
  }
  function secondaryFamiliesOf(id) {
    const c = classificationFamilyOf(id);
    return familiesOf(id).filter(f => f !== c);
  }
  function familyList() {
    return fams().map(f => ({ id: f.id, label: f.label, component: f.component, count: f.members.length + 1 }));
  }
  function familyStripData(id) {
    const c = classificationFamilyOf(id);
    if (!c) return null;
    return {
      famId: c.id, label: c.label, component: c.component,
      members: famNodes(c),
      secondaryFamilies: secondaryFamiliesOf(id).map(f => ({ id: f.id, label: f.label, component: f.component }))
    };
  }
  function detailFamilyLinks(id) {
    const seen = new Set(), out = [];
    familiesOf(id).forEach(f => famNodes(f).forEach(n => {
      if (n.id !== id && !seen.has(n.id)) { seen.add(n.id); out.push({ id: n.id, char: n.char, rel: n.rel, famId: f.id }); }
    }));
    return out;
  }
  function graphEdges() {
    const edges = [], nodeIds = new Set();
    fams().forEach(f => {
      nodeIds.add(f.rootId);
      f.members.forEach(m => { nodeIds.add(m.id); edges.push({ from: f.rootId, to: m.id, rel: m.rel, via: m.via, fam: f.id }); });
    });
    const nodes = [...nodeIds].map(id => {
      const c = classificationFamilyOf(id);
      return { id, char: charOf(id), classFam: c ? c.id : null, families: familiesOf(id).map(f => f.id) };
    });
    return { nodes, edges };
  }
  function familyProgress(famId, learnedSet) {
    const f = FAM[famId]; if (!f) return null;
    const nodes = famNodes(f);
    return { famId, learned: nodes.filter(n => learnedSet.has(n.id)).length, total: nodes.length };
  }
  return { charOf, famNodes, familiesOf, classificationFamilyOf, secondaryFamiliesOf, familyList, familyStripData, detailFamilyLinks, graphEdges, familyProgress };
}

if (typeof module !== "undefined") module.exports = { FAMILIES, REL_TYPES, REL_MAX, makeResolver };
