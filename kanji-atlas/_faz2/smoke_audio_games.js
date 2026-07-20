/* FAZ 2 · Ses — OYUN/DİNAMİK yüzey kayıtlı ses entegrasyonu (Zeynep/GPT kararı 2026-07-20).
   İlke: "dynamic" YÜZEY tipidir, çözüm yöntemi değil. Oyunun ürettiği metin manifestte kayıtlıysa
   uygulamanın her yerinde AYNI recorded ses çalar; yalnız manifestte karşılığı olmayan gerçekten
   dinamik metin policy fallback'e (dev TTS / release sessiz) düşer. surfaceKind kimlik çözümüne karışmaz. */
const { chromium } = require("playwright");
(async () => {
  let fail=0; const A=(n,ok,x)=>{console.log((ok?"✓":"✗")+" "+n+(x?" — "+x:"")); if(!ok)fail++;};
  const errs=[]; const b=await chromium.launch({headless:true}); const p=await b.newPage();
  p.on("pageerror",e=>errs.push(e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|net::ERR/i.test(m.text()))errs.push(m.text());});
  // Audio + speechSynthesis casusları (sayfa yüklenmeden)
  await p.addInitScript(()=>{
    window.__spy={audio:[],play:0,tts:0};
    const RealAudio=window.Audio;
    window.Audio=function(url){ window.__spy.audio.push(url); const a=new RealAudio(url); a.play=function(){ window.__spy.play++; return Promise.reject(new Error("no-file")); }; return a; };
    const s=window.speechSynthesis; if(s){ s.speak=function(){ window.__spy.tts++; }; }
  });
  await p.goto("file:///home/claude/atlas_drive_may30.html");
  await p.waitForFunction(()=>typeof window.__play!=="undefined" && typeof window.JYA!=="undefined",{timeout:15000});

  // === 0) Yardımcılar açık ===
  const exposed = await p.evaluate(()=>({
    charCat: typeof window.__play._charAudioCat==="function",
    roundCat: typeof window.__play.roundAudioCat==="function",
    memCard: typeof window.__play.memoryCardAudio==="function",
  }));
  A("0) yardımcılar açık (_charAudioCat·roundAudioCat·memoryCardAudio)", exposed.charCat&&exposed.roundCat&&exposed.memCard);

  // === 1) Sınıflandırıcı doğruluğu (gerçek DATA) ===
  const cls = await p.evaluate(()=>{
    const P=window.__play, D=window.JYA.DATA;
    const kanjiChar = Object.values(D.chars).find(c=>c.type==="kanji").character; // ör. 一
    return {
      kanaA: P._charAudioCat("あ"),
      kanaKata: P._charAudioCat("ア"),
      kanji: P._charAudioCat(kanjiChar),
      kanjiChar,
      rCloze: P.roundAudioCat({ptype:"cloze", wkey:9, speak:"森は大きいです。"}),
      rWord: P.roundAudioCat({ptype:"glyphsm", wkey:3, speak:"本"}),   // wkey → word (本 kanji olsa da yüzey kelime)
      rKanji: P.roundAudioCat({ptype:"glyph", speak:kanjiChar}),       // wkey yok, kanji karakter
      rKana: P.roundAudioCat({speak:"あ"}),
      mMahjong: P.memoryCardAudio({id:"kana-mahjong"}, {label:"ア", key:"a"}),
      mWord: P.memoryCardAudio({id:"word-memory"}, {key:"wm0", label:"百"}),  // ch("wm0")=null → word
    };
  });
  A("1a) kana karakter → 'kana' (hira+kata)", cls.kanaA==="kana" && cls.kanaKata==="kana");
  A("1b) kanji karakter → 'kanji'", cls.kanji==="kanji", cls.kanjiChar);
  A("1c) cloze round → 'sentence'", cls.rCloze==="sentence");
  A("1d) wkey'li round → 'word' (tek-karakter kelime kanjiye düşmez)", cls.rWord==="word");
  A("1e) wkey'siz kanji round → 'kanji'", cls.rKanji==="kanji");
  A("1f) wkey'siz kana round → 'kana'", cls.rKana==="kana");
  A("1g) kana-mahjong kartı → {kana}", cls.mMahjong&&cls.mMahjong.cat==="kana"&&cls.mMahjong.text==="ア");
  A("1h) word-memory kartı (ch yok) → {word}", cls.mWord&&cls.mWord.cat==="word"&&cls.mWord.text==="百");

  // === 2) Davranış: kayıtlı+onaylı kana (あ) DİNAMİK yüzeyde → DOSYA (TTS değil), dev+release ===
  const kanaBeh = await p.evaluate(()=>{
    const reset=()=>{window.__spy.audio=[];window.__spy.play=0;window.__spy.tts=0;};
    const out={};
    reset(); window.__play.playAudio("あ","kana",null,"dynamic","development");
    out.dev={audio:window.__spy.audio.slice(),tts:window.__spy.tts};
    reset(); window.__play.playAudio("あ","kana",null,"dynamic","release");
    out.rel={audio:window.__spy.audio.slice(),tts:window.__spy.tts};
    return out;
  });
  A("2a) dinamik kana あ → dev DOSYA (audio/kana/a.mp3), TTS yok", kanaBeh.dev.audio.length===1&&/audio\/kana\/a\.mp3$/.test(kanaBeh.dev.audio[0])&&kanaBeh.dev.tts===0, JSON.stringify(kanaBeh.dev));
  A("2b) dinamik kana あ → release DOSYA (approved), TTS yok", kanaBeh.rel.audio.length===1&&kanaBeh.rel.tts===0, JSON.stringify(kanaBeh.rel));

  // === 3) Davranış: kayıtlı-pending KELİME → dev DOSYA, release SESSİZ (pending policy) ===
  const wordBeh = await p.evaluate(()=>{
    const M=AUDIO_MANIFEST.entries;
    const w=M.find(e=>e.kategori==="word"&&e.durum==="recorded"); // flick kelime, dogrulanmali:true
    const reset=()=>{window.__spy.audio=[];window.__spy.play=0;window.__spy.tts=0;};
    const out={metin:w&&w.metin, file:w&&w.ses_dosyasi, pending:w&&w.dogrulanmali===true};
    reset(); window.__play.playAudio(w.metin,"word",null,"dynamic","development");
    out.dev={audio:window.__spy.audio.slice(),tts:window.__spy.tts};
    reset(); window.__play.playAudio(w.metin,"word",null,"dynamic","release");
    out.rel={audio:window.__spy.audio.slice(),tts:window.__spy.tts};
    return out;
  });
  A("3a) kayıtlı kelime pending (dogrulanmali)", wordBeh.pending===true, wordBeh.metin);
  A("3b) dinamik kayıtlı kelime → dev DOSYA (insan sesi), TTS yok", wordBeh.dev.audio.length===1&&wordBeh.dev.audio[0]===wordBeh.file&&wordBeh.dev.tts===0, JSON.stringify(wordBeh.dev));
  A("3c) dinamik kayıtlı-pending kelime → release SESSİZ (dosya yok, TTS yok)", wordBeh.rel.audio.length===0&&wordBeh.rel.tts===0, JSON.stringify(wordBeh.rel));

  // === 4) Davranış: GERÇEKTEN dinamik (manifestte YOK) metin → dev TTS, release SESSİZ ===
  const dynBeh = await p.evaluate(()=>{
    const reset=()=>{window.__spy.audio=[];window.__spy.play=0;window.__spy.tts=0;};
    const out={};
    reset(); window.__play.playAudio("Harika! 3 puan kazandın","word",null,"dynamic","development");
    out.dev={audio:window.__spy.audio.length,tts:window.__spy.tts};
    reset(); window.__play.playAudio("Harika! 3 puan kazandın","word",null,"dynamic","release");
    out.rel={audio:window.__spy.audio.length,tts:window.__spy.tts};
    return out;
  });
  A("4a) manifest-dışı dinamik metin → dev TTS (fallback korundu)", dynBeh.dev.tts>=1&&dynBeh.dev.audio===0, JSON.stringify(dynBeh.dev));
  A("4b) manifest-dışı dinamik metin → release SESSİZ (TTS kaçağı yok)", dynBeh.rel.tts===0&&dynBeh.rel.audio===0, JSON.stringify(dynBeh.rel));

  // === 5) GERÇEK OYUN kurulumu: word-meaning round'ları 'word' sınıflanıyor (call-site kanıtı) ===
  const wm = await p.evaluate(()=>{
    window.JYA.startGame("word-meaning");
    const G=window.JYA.state._game;
    const rounds=G.rounds||[];
    return { n:rounds.length, allWord: rounds.every(r=>window.__play.roundAudioCat(r)==="word"),
             cats:[...new Set(rounds.map(r=>window.__play.roundAudioCat(r)))],
             sample: rounds.slice(0,3).map(r=>({speak:r.speak, cat:window.__play.roundAudioCat(r)})) };
  });
  A("5) word-meaning oyununun TÜM round'ları 'word' çözülüyor", wm.n>0&&wm.allWord, "cats="+JSON.stringify(wm.cats));
  console.log("   örnek:", JSON.stringify(wm.sample));

  // === 6) GERÇEK OYUN kurulumu: kana-match pair leftKey'leri 'kana' sınıflanıyor ===
  const km = await p.evaluate(()=>{
    window.JYA.startGame("kana-match", {mode:"hk"});
    const G=window.JYA.state._game;
    const pairs=G.pairs||[];
    return { n:pairs.length, allKana: pairs.every(p=>window.__play._charAudioCat(p.leftKey)==="kana"),
             sample: pairs.slice(0,3).map(p=>({leftKey:p.leftKey, cat:window.__play._charAudioCat(p.leftKey)})) };
  });
  A("6) kana-match pair leftKey'leri 'kana' çözülüyor", km.n>0&&km.allKana);
  console.log("   örnek:", JSON.stringify(km.sample));

  // === 7) Regresyon: render + yeni exception yok ===
  const rendered = await p.evaluate(()=>{ const o={}; for(const s of ["home","detail","kanadetail","worddetail","progress"]){try{window.JYA.go(s,s==="detail"?"ki":(s==="kanadetail"?"あ":(s==="worddetail"?"ohayou":null)),false);o[s]=document.body.children.length>0;}catch(e){o[s]="ERR:"+e.message;}} return o; });
  A("7a) render regresyonu yok", Object.values(rendered).every(v=>v===true), JSON.stringify(rendered));
  A("7b) yeni JS exception yok", errs.length===0, errs.slice(0,2).join(" | "));

  await b.close();
  console.log(fail===0?"\n✅ OYUN/DİNAMİK SES ENTEGRASYON SMOKE GEÇTİ":"\n❌ "+fail+" başarısız");
  process.exit(fail===0?0:1);
})().catch(e=>{console.error("HATA:",e.message);process.exit(2);});
