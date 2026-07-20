/* ============================================================
   FAZ 2 · Kalem 1 — KANONİK AİLE VERİSİ + ÇÖZÜMLEYİCİ
   ------------------------------------------------------------
   SINIR (kilitli): FAMILIES yalnız AİLE İLİŞKİLERİNİN kanonik
   kaynağıdır. Karakter içeriği DATA'da, ses manifestte, kullanıcı
   ilerlemesi storage'da kalır. Burada içerik/ses/ilerleme TUTULMAZ.
   İlişki türü açıkça etiketli: root · repetition · composition ·
   indicator · variant · extension · phonetic · meaning · sound · visual.
   Bir karakter birden çok aileye üye olabilir (休: ağaç[木] + insan[亻]).
   ============================================================ */

const FAMILIES = {
  tree: {
    id: "tree",
    label: "Ağaç ailesi",
    component: "木",          // ortak kök bileşen (görsel)
    rootId: "ki",             // kökün DATA id'si
    // members: kökten TÜREYENLER. char DATA id'siyle gösterilir (içerik DATA'da).
    //   rel = ilişki türü · via = bu aileye hangi bileşenle bağlanıyor · note = İLİŞKİ açıklaması
    members: [
      { id: "hayashi", rel: "repetition",  via: "木", note: "iki ağaç" },
      { id: "mori",    rel: "repetition",  via: "木", note: "üç ağaç" },
      { id: "hon",     rel: "indicator",   via: "木", note: "ağaç + temel/kök işareti (一)" },
      { id: "yasumu",  rel: "composition", via: "木", note: "insan (亻) + ağaç → dinlenen kişi" }
    ],
    learningOrder: ["ki", "hayashi", "mori", "hon", "yasumu"]
  },

  // İKİNCİ (STRES) AİLE — daha karmaşık ilişki türleri: variant + extension + çapraz üyelik.
  // Amaç: "yeni aile = yalnız veri" geçidini kanıtlamak (çözümleyici değişmeden çalışmalı).
  person: {
    id: "person",
    label: "İnsan ailesi",
    component: "人",
    rootId: "hito",
    members: [
      { id: "r_nin",  rel: "variant",     via: "人", note: "人'nin sol/yan biçimi (亻)" },
      { id: "dai",    rel: "extension",   via: "人", note: "kollarını açmış insan → büyük" },
      { id: "ten",    rel: "composition", via: "大", note: "büyük insanın üstünde çizgi → gök" },
      { id: "yasumu", rel: "composition", via: "亻", note: "insan (亻) + ağaç → dinlenmek (ağaç ailesiyle ortak)" }
    ],
    learningOrder: ["hito", "r_nin", "dai", "ten", "yasumu"]
  }
};

/* ------------------------------------------------------------
   RESOLVER — CORE veri + DATA(içerik) + state(ilerleme) YALNIZ burada birleşir.
   Beş tüketici çıktısı da BU tek kaynaktan üretilir:
   (1) aile şeridi (2) Detail bağları (3) grafik kenarları (4) aile listesi (5) ilerleme
   Çözümleyici ilişki-türü-agnostiktir: rel etiketini taşır, ona göre DALLANMAZ.
   ------------------------------------------------------------ */
function makeResolver(DATA_chars) {
  const charOf = id => (DATA_chars[id] ? DATA_chars[id].character : null);

  // aileyi düğüm listesine çevir: [kök, ...üyeler] — her düğüm {id,char,rel,via,note,missing}
  function famNodes(fam) {
    const root = { id: fam.rootId, char: charOf(fam.rootId) || fam.component, rel: "root", via: null, note: null, missing: !DATA_chars[fam.rootId] };
    const members = fam.members.map(m => ({
      id: m.id, char: charOf(m.id), rel: m.rel, via: m.via, note: m.note, missing: !DATA_chars[m.id]
    }));
    return [root, ...members];
  }

  // bir id'nin üye olduğu TÜM aileler (çapraz üyelik: 休 → tree + person)
  function familiesOf(id) {
    return Object.values(FAMILIES).filter(f => f.rootId === id || f.members.some(m => m.id === id));
  }

  // (4) AİLE LİSTESİ
  function familyList() {
    return Object.values(FAMILIES).map(f => ({
      id: f.id, label: f.label, component: f.component, count: f.members.length + 1
    }));
  }

  // (1) AİLE ŞERİDİ — bir karakterin birincil ailesi + çapraz bağlar
  function familyStripData(id) {
    const fams = familiesOf(id);
    if (!fams.length) return null;
    const primary = fams[0];
    return {
      famId: primary.id, label: primary.label, component: primary.component,
      members: famNodes(primary),
      crossFamilies: fams.slice(1).map(f => ({ id: f.id, label: f.label, component: f.component }))
    };
  }

  // (2) DETAIL BAĞLARI — aynı ailedeki diğer üyelerin id'leri (related_characters yerine)
  function detailFamilyLinks(id) {
    const seen = new Set(), out = [];
    familiesOf(id).forEach(f => famNodes(f).forEach(n => {
      if (n.id !== id && !seen.has(n.id)) { seen.add(n.id); out.push({ id: n.id, char: n.char, rel: n.rel, famId: f.id }); }
    }));
    return out;
  }

  // (3) GRAFİK KENARLARI — kök→üye, ilişki türüyle. Düğüm TEK (id ile dedup); kenar ilişki başına.
  function graphEdges() {
    const edges = [], nodeIds = new Set();
    Object.values(FAMILIES).forEach(f => {
      nodeIds.add(f.rootId);
      f.members.forEach(m => {
        nodeIds.add(m.id);
        edges.push({ from: f.rootId, to: m.id, rel: m.rel, via: m.via, fam: f.id });
      });
    });
    // düğümler: benzersiz (休 çapraz üye olsa da TEK düğüm)
    const nodes = [...nodeIds].map(id => ({ id, char: charOf(id), families: familiesOf(id).map(f => f.id) }));
    return { nodes, edges };
  }

  // (5) İLERLEME — storage'dan OKUR, tutmaz. learnedSet = kullanıcı ilerlemesi (dışarıdan gelir).
  function familyProgress(famId, learnedSet) {
    const f = FAMILIES[famId]; if (!f) return null;
    const nodes = famNodes(f);
    const learned = nodes.filter(n => learnedSet.has(n.id)).length;
    return { famId, learned, total: nodes.length };
  }

  return { charOf, famNodes, familiesOf, familyList, familyStripData, detailFamilyLinks, graphEdges, familyProgress };
}

if (typeof module !== "undefined") module.exports = { FAMILIES, makeResolver };
