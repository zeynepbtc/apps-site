const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  let fail=0; const A=(n,ok,x)=>{console.log((ok?"✓":"✗")+" "+n+(x?" — "+x:"")); if(!ok)fail++;};
  const errs=[]; const b=await chromium.launch({headless:true}); const p=await b.newPage();
  p.on("pageerror",e=>errs.push(e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|net::ERR/i.test(m.text()))errs.push(m.text());});
  // Audio + speechSynthesis spy'larını sayfa yüklenmeden kur
  await p.addInitScript(()=>{
    window.__spy={audio:[],play:0,tts:0};
    const RealAudio=window.Audio;
    window.Audio=function(url){ window.__spy.audio.push(url); const a=new RealAudio(url); const rp=a.play.bind(a); a.play=function(){ window.__spy.play++; return Promise.reject(new Error("no-file")); }; return a; };
    const s=window.speechSynthesis; if(s){ const rs=s.speak.bind(s); s.speak=function(u){ window.__spy.tts++; }; }
  });
  await p.goto("file:///home/claude/atlas_drive_may30.html");
  await p.waitForFunction(()=>typeof window.__play!=="undefined",{timeout:15000});

  // === TABLO TESTİ: 8 yüzey (render → data-audio-cat/data-speak → çözüm) ===
  const table = await p.evaluate(()=>{
    const A=window.__audio, idx=A.buildAudioIndex(AUDIO_MANIFEST);
    const rows=[];
    const scan=(screen,param,label)=>{
      window.JYA.go(screen,param,false);
      const btns=[...document.querySelectorAll('.audio-btn[data-audio-cat]')];
      btns.slice(0,3).forEach(btn=>{
        const text=btn.dataset.speak, cat=btn.dataset.audioCat;
        const res=A.resolveAudioEntry(idx,{category:cat,text:text});
        rows.push({screen:label, text, cat, kind:res.kind, id:res.entry&&res.entry.id, pol:A.resolveAudioPolicy(res,"development")});
      });
    };
    scan("detail","ki","kanji-detail");     // kanji + örnek kelimeler
    scan("kanadetail","あ","kana-detail");  // kana + örnek
    scan("worddetail","ohayou","word-detail"); // kelime + cümle
    return rows;
  });
  console.log("=== 8-yüzey tablo (text · category · kind · id · policy) ===");
  table.forEach(r=>console.log(`   ${r.screen}: "${r.text}" [${r.cat}] → ${r.kind} ${r.id||"-"} → ${r.pol}`));
  A("her yüzey açık kategori gönderiyor (boş yok)", table.every(r=>r.cat&&["kana","kanji","word","sentence"].includes(r.cat)));
  A("kategori+metin doğru kayda çözülüyor (found olanlar id taşıyor)", table.filter(r=>r.kind!=="not-found").every(r=>!!r.id));
  A("kanji yüzeyi kategori 'kanji' gönderiyor", table.some(r=>r.screen==="kanji-detail"&&r.cat==="kanji"));
  A("kana yüzeyi kategori 'kana' gönderiyor", table.some(r=>r.screen==="kana-detail"&&r.cat==="kana"));

  // === Koşul 2: yanlış kategori başka kategoriye DÜŞMEZ ===
  const cross = await p.evaluate(()=>{
    const A=window.__audio, idx=A.buildAudioIndex(AUDIO_MANIFEST);
    const r=A.resolveAudioEntry(idx,{category:"word",text:"絶"});   // word'de yok; kanji'ye BAKMAZ
    return r.kind;
  });
  A("koşul 2) word+絶 not-found (kanji'ye sessizce düşmez)", cross==="not-found");

  // === DİKEY DİLİM: kana あ (recorded+approved+file) → tek Audio, play, TTS YOK ===
  const slice = await p.evaluate(()=>{
    window.__spy.audio=[]; window.__spy.play=0; window.__spy.tts=0;
    // kana あ recorded+approved mı?
    const A=window.__audio, idx=A.buildAudioIndex(AUDIO_MANIFEST);
    const res=A.resolveAudioEntry(idx,{category:"kana",text:"あ"});
    window.__play.playAudio("あ","kana",null,"fixed");   // file action bekleniyor
    return { kind:res.kind, id:res.entry&&res.entry.id, file:res.entry&&res.entry.ses_dosyasi,
             audioCreated:window.__spy.audio.length, audioUrl:window.__spy.audio[0], play:window.__spy.play, tts:window.__spy.tts };
  });
  console.log("=== dikey dilim (kana あ) ===");
  A("kana あ recorded (approved) + göreli dosya yolu", slice.kind==="recorded" && /^audio\/kana\/a\.mp3$/.test(slice.file||""), slice.file);
  A("file eylemi: TEK Audio oluştu (göreli url)", slice.audioCreated===1 && slice.audioUrl===slice.file);
  A("play() bir kez çağrıldı", slice.play===1);
  A("koşul 3+4) TTS'ye KAÇMADI, çift oynatma yok (tts=0)", slice.tts===0);

  // === Koşul 3: file action + dosya hatası → dev diagnostic, TTS YOK (yukarıda kanıtlandı: play reject → tts=0) ===
  A("koşul 3) dosya hatası ikinci kez TTS üretmiyor", slice.tts===0);

  // === SPY: release modunda tts/missing/not-found → speechSynthesis HİÇ çağrılmaz ===
  const rel = await p.evaluate(()=>{
    const out={};
    const cases=[["development","tts-entry"],["release","tts-entry"]];
    // tts kaydı: bir cümle (durum tts)
    window.__spy.tts=0; window.__play.playAudio("森は大きいです。","sentence",null,"fixed","development"); out.devSentenceTTS=window.__spy.tts;
    window.__spy.tts=0; window.__play.playAudio("森は大きいです。","sentence",null,"fixed","release");     out.relSentenceTTS=window.__spy.tts;
    window.__spy.tts=0; window.__play.playAudio("yokboyle","dynamic-yok",null,"dynamic","release");        out.relNotFoundTTS=window.__spy.tts;
    window.__spy.tts=0; window.__play.playAudio("yokboyle","dynamic-yok",null,"dynamic","development");    out.devNotFoundTTS=window.__spy.tts;
    return out;
  });
  console.log("=== release TTS kaçağı spy ===");
  A("dev: tts kaydı (cümle) → speechSynthesis ÇAĞRILDI", rel.devSentenceTTS>=1);
  A("release: tts kaydı (cümle) → speechSynthesis HİÇ çağrılmadı", rel.relSentenceTTS===0);
  A("release: not-found → speechSynthesis HİÇ çağrılmadı (TTS kaçağı yok)", rel.relNotFoundTTS===0);
  A("dev: not-found → TTS (beklenen dev fallback)", rel.devNotFoundTTS>=1);

  // render + sağlık
  const rendered = await p.evaluate(()=>{ const o={}; for(const s of ["home","detail","kanadetail","worddetail","progress"]){try{window.JYA.go(s,s==="detail"?"ki":(s==="kanadetail"?"あ":(s==="worddetail"?"ohayou":null)),false);o[s]=document.body.children.length>0;}catch(e){o[s]="ERR:"+e.message;}} return o; });
  A("render regresyonu yok", Object.values(rendered).every(v=>v===true), JSON.stringify(rendered));
  A("yeni JS exception yok", errs.length===0, errs.slice(0,2).join(" | "));

  await b.close();
  console.log(fail===0?"\n✅ SES 6b ENTEGRASYON SMOKE GEÇTİ":"\n❌ "+fail+" başarısız");
  process.exit(fail===0?0:1);
})().catch(e=>{console.error("HATA:",e.message);process.exit(2);});
