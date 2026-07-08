/* Japanese Flick — service worker (çevrimdışı önbellek) */
const CACHE = 'jflick-v36';
const ASSETS = [
  './audio/kana/kya.mp3',
  './audio/kana/kyu.mp3',
  './audio/kana/kyo.mp3',
  './audio/kana/gya.mp3',
  './audio/kana/gyu.mp3',
  './audio/kana/gyo.mp3',
  './audio/kana/sha.mp3',
  './audio/kana/shu.mp3',
  './audio/kana/sho.mp3',
  './audio/kana/ja.mp3',
  './audio/kana/ju.mp3',
  './audio/kana/jo.mp3',
  './audio/kana/cha.mp3',
  './audio/kana/chu.mp3',
  './audio/kana/cho.mp3',
  './audio/kana/nya.mp3',
  './audio/kana/nyu.mp3',
  './audio/kana/nyo.mp3',
  './audio/kana/hya.mp3',
  './audio/kana/hyu.mp3',
  './audio/kana/hyo.mp3',
  './audio/kana/bya.mp3',
  './audio/kana/byu.mp3',
  './audio/kana/byo.mp3',
  './audio/kana/pya.mp3',
  './audio/kana/pyu.mp3',
  './audio/kana/pyo.mp3',
  './audio/kana/mya.mp3',
  './audio/kana/myu.mp3',
  './audio/kana/myo.mp3',
  './audio/kana/rya.mp3',
  './audio/kana/ryu.mp3',
  './audio/kana/ryo.mp3',
  './audio/word/sou_desu_ne.mp3',
  './audio/word/wakatta.mp3',
  './audio/word/daijoubu.mp3',
  './audio/word/chigau.mp3',
  './audio/word/tabun.mp3',
  './audio/word/douzo.mp3',
  './audio/word/naruhodo.mp3',
  './audio/word/omedetou.mp3',
  './audio/word/ganbatte.mp3',
  './audio/word/jaane.mp3',
  './audio/word/un.mp3',
  './audio/word/uun.mp3',
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png',
  './audio/kana/a.mp3',
  './audio/kana/i.mp3',
  './audio/kana/u.mp3',
  './audio/kana/e.mp3',
  './audio/kana/o.mp3',
  './audio/kana/ka.mp3',
  './audio/kana/ki.mp3',
  './audio/kana/ku.mp3',
  './audio/kana/ke.mp3',
  './audio/kana/ko.mp3',
  './audio/kana/sa.mp3',
  './audio/kana/shi.mp3',
  './audio/kana/su.mp3',
  './audio/kana/se.mp3',
  './audio/kana/so.mp3',
  './audio/kana/ta.mp3',
  './audio/kana/chi.mp3',
  './audio/kana/tsu.mp3',
  './audio/kana/te.mp3',
  './audio/kana/to.mp3',
  './audio/kana/na.mp3',
  './audio/kana/ni.mp3',
  './audio/kana/nu.mp3',
  './audio/kana/ne.mp3',
  './audio/kana/no.mp3',
  './audio/kana/ha.mp3',
  './audio/kana/hi.mp3',
  './audio/kana/fu.mp3',
  './audio/kana/he.mp3',
  './audio/kana/ho.mp3',
  './audio/kana/ma.mp3',
  './audio/kana/mi.mp3',
  './audio/kana/mu.mp3',
  './audio/kana/me.mp3',
  './audio/kana/mo.mp3',
  './audio/kana/ya.mp3',
  './audio/kana/yu.mp3',
  './audio/kana/yo.mp3',
  './audio/kana/ra.mp3',
  './audio/kana/ri.mp3',
  './audio/kana/ru.mp3',
  './audio/kana/re.mp3',
  './audio/kana/ro.mp3',
  './audio/kana/wa.mp3',
  './audio/kana/wo.mp3',
  './audio/kana/n.mp3',
  './audio/kana/ga.mp3',
  './audio/kana/gi.mp3',
  './audio/kana/gu.mp3',
  './audio/kana/ge.mp3',
  './audio/kana/go.mp3',
  './audio/kana/za.mp3',
  './audio/kana/ji.mp3',
  './audio/kana/zu.mp3',
  './audio/kana/ze.mp3',
  './audio/kana/zo.mp3',
  './audio/kana/da.mp3',
  './audio/kana/di.mp3',
  './audio/kana/du.mp3',
  './audio/kana/de.mp3',
  './audio/kana/do.mp3',
  './audio/kana/ba.mp3',
  './audio/kana/bi.mp3',
  './audio/kana/bu.mp3',
  './audio/kana/be.mp3',
  './audio/kana/bo.mp3',
  './audio/kana/pa.mp3',
  './audio/kana/pi.mp3',
  './audio/kana/pu.mp3',
  './audio/kana/pe.mp3',
  './audio/kana/po.mp3',
  './audio/word/nihongo.mp3',
  './audio/word/arigatou.mp3',
  './audio/word/sumimasen.mp3',
  './audio/word/konnichiwa.mp3',
  './audio/word/ohayou.mp3',
  './audio/word/oishii.mp3',
  './audio/word/suki.mp3',
  './audio/word/eki.mp3',
  './audio/word/mizu.mp3',
  './audio/word/neko.mp3',
  './audio/word/inu.mp3',
  './audio/word/yama.mp3',
  './audio/word/kawa.mp3',
  './audio/word/hito.mp3',
  './audio/word/gakusei.mp3',
  './audio/word/namae.mp3',
  './audio/word/kamera.mp3',
  './audio/word/hoteru.mp3',
  './audio/word/koohii.mp3',
  './audio/word/sumaho.mp3',
  './audio/word/resutoran.mp3',
  './audio/word/takushii.mp3',
  './audio/word/pan.mp3',
  './audio/word/yaa.mp3',
  './audio/word/ocha.mp3',
  './audio/word/hai.mp3',
  './audio/word/iie.mp3',
  './audio/word/iine.mp3',
  './audio/word/gomen.mp3',
  './audio/word/aka.mp3',
  './audio/word/ao.mp3',
  './audio/word/sanji.mp3',
  './audio/word/goji.mp3',
  './audio/word/ookii.mp3',
  './audio/word/chiisai.mp3',
  './audio/word/atsui.mp3',
  './audio/word/tsumetai.mp3',
  './audio/word/takusan.mp3',
  './audio/word/sukoshi.mp3',
  './audio/word/aru.mp3',
  './audio/word/nai.mp3',
  './audio/word/iiyo.mp3',
  './audio/word/dame.mp3',
  './audio/word/tamago.mp3',
  './audio/word/gohan.mp3',
  './audio/word/ichigo.mp3',
  './audio/word/suika.mp3',
  './audio/word/piza.mp3',
  './audio/word/sushi.mp3',
  './audio/word/maguro.mp3',
  './audio/word/aisu.mp3',
  './audio/word/mochi.mp3',
  './audio/word/nani.mp3',
  './audio/word/uso.mp3',
  './audio/word/yatta.mp3',
  './audio/word/honto.mp3',
  './audio/word/ikou.mp3',
  './audio/word/sugoi.mp3',
  './audio/word/oishisou.mp3',
  './audio/phrase/nihongo_ga_suki_desu.mp3',
  './audio/phrase/koohii_o_kudasai.mp3',
  './audio/phrase/eki_made_onegai_shimasu.mp3',
  './audio/phrase/hajimemashite.mp3',
  './audio/phrase/kore_wa_oishii_desu.mp3',
  './audio/phrase/arigatou_gozaimasu.mp3',
  './audio/phrase/ikura_desu_ka.mp3',
  './audio/phrase/eigo_o_hanasemasu_ka.mp3',
  './audio/phrase/onamae_wa.mp3',
  './audio/phrase/toire_wa_doko_desu_ka.mp3'
];

// Kritik dosyalar zorunlu; ses dosyaları best-effort (tek eksik dosya install'ı bozmaz)
const CRITICAL = ['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon-180.png'];
const AUDIO = ASSETS.filter(a => a.indexOf('/audio/') >= 0);

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CRITICAL).then(() => Promise.all(AUDIO.map(u => c.add(u).catch(() => {})))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  // HTML sayfaları: ÖNCE AĞ (çevrimiçiyken hep en güncel index; çevrimdışıysa önbellek)
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(c => c || caches.match('./index.html')))
    );
    return;
  }
  // diğer varlıklar (ses, ikon): ÖNCE ÖNBELLEK
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
