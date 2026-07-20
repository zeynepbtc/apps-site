const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  let fail=0; const A=(n,ok,x)=>{console.log((ok?"✓":"✗")+" "+n+(x?" — "+x:"")); if(!ok)fail++;};
  const errs=[]; const b=await chromium.launch({headless:true}); const p=await b.newPage();
  p.on("pageerror",e=>errs.push(e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|net::ERR/i.test(m.text()))errs.push(m.text());});
  await p.goto("file:///home/claude/atlas_drive_may30.html");
  await p.waitForFunction(()=>typeof window.__audio!=="undefined",{timeout:15000});

  // 1) KARAR MATRİSİ (her durum × her ortam)
  const M = await p.evaluate(()=>{
    const R = window.__audio.resolveAudioPolicy;
    const rec = {durum:"recorded", ses_dosyasi:"audio/word/mori.mp3"};
    const recNoFile = {durum:"recorded", ses_dosyasi:null};
    const tts = {durum:"tts", ses_dosyasi:null};
    const miss = {durum:"missing", ses_dosyasi:null};
    const bozuk = {durum:"SACMA"};
    return {
      dev:{ rec:R(rec,"development"), tts:R(tts,"development"), miss:R(miss,"development"), bozuk:R(bozuk,"development"), recNoFile:R(recNoFile,"development") },
      rel:{ rec:R(rec,"release"),     tts:R(tts,"release"),     miss:R(miss,"release"),     bozuk:R(bozuk,"release"),     recNoFile:R(recNoFile,"release") },
      unknownMode: R(tts,"garbage"),   // tanınmayan mode → release gibi (silent)
      nullEntry: { dev:R(null,"development"), rel:R(null,"release") }
    };
  });
  console.log("=== 1: karar matrisi ===");
  A("recorded+dosya → file/file", M.dev.rec==="file" && M.rel.rec==="file");
  A("tts → dev:tts, release:silent", M.dev.tts==="tts" && M.rel.tts==="silent");
  A("missing → dev:tts, release:silent", M.dev.miss==="tts" && M.rel.miss==="silent");
  A("bozuk/tanınmayan durum → silent/silent", M.dev.bozuk==="silent" && M.rel.bozuk==="silent");
  A("NÜANS recorded-ama-dosyasız → dev:tts, release:silent (file DEĞİL)", M.dev.recNoFile==="tts" && M.rel.recNoFile==="silent");
  A("tanınmayan mode → release gibi (silent)", M.unknownMode==="silent");
  A("null entry → her ortamda silent", M.nullEntry.dev==="silent" && M.nullEntry.rel==="silent");

  // 2) dönüş yalnız enum {file,tts,silent}
  const enumOk = await p.evaluate(()=>{
    const R=window.__audio.resolveAudioPolicy; const ok=new Set(["file","tts","silent"]);
    const samples=[{durum:"recorded",ses_dosyasi:"x"},{durum:"tts"},{durum:"missing"},{durum:"zzz"},null,{}];
    return samples.every(s=>["development","release","x"].every(m=>ok.has(R(s,m))));
  });
  A("2) dönüş yalnız {file,tts,silent}", enumOk);

  // 3) SAF + deterministik (aynı girdi → aynı çıktı; state değişmez)
  const pure = await p.evaluate(()=>{
    const R=window.__audio.resolveAudioPolicy; const e={durum:"tts"};
    const stateBefore = JSON.stringify(window.JYA.state);
    const r1=R(e,"development"), r2=R(e,"development");
    const eCopy = JSON.stringify(e);
    R(e,"release");
    const stateAfter = JSON.stringify(window.JYA.state);
    return { det: r1===r2, entryUnchanged: JSON.stringify(e)===eCopy, stateUnchanged: stateBefore===stateAfter };
  });
  A("3) deterministik (aynı girdi=aynı çıktı)", pure.det);
  A("3) girdi entry mutasyonu yok", pure.entryUnchanged);
  A("3) global state değişmedi (saf)", pure.stateUnchanged);

  // 4) speak() ÇAĞRILARI DEĞİŞMEDİ (kaynak sayımı) + 5/6) oynatma/fetch YOK
  const src = fs.readFileSync("/home/claude/apps-deploy/kanji-atlas/index.html","utf-8");
  const cc=(f)=>(src.match(new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length;
  A("4) speak() ses politikasını TÜKETMİYOR (resolveAudioPolicy yalnız decideAudioAction'dan; decideAudioAction'ın çağıranı yok → speak bağlı değil)",
    cc("resolveAudioPolicy(")===2 && cc("decideAudioAction(")===1);
  A("5) ses dosyası oynatma eklenmedi (yeni new Audio yok — mevcut speak dışında)", (src.match(/new Audio/g)||[]).length===1);
  A("6) runtime manifest fetch yok", !/fetch[^;\n]{0,80}manifest/i.test(src));

  // 7) render regresyonu yok
  const rendered = await p.evaluate(()=>{ const o={}; for(const s of ["home","kana","detail","progress","review"]){try{window.JYA.go(s,s==="detail"?"ki":null,false);o[s]=document.body.children.length>0;}catch(e){o[s]="ERR";}} return o; });
  A("7) render regresyonu yok", Object.values(rendered).every(v=>v===true), JSON.stringify(rendered));
  A("yeni JS exception yok", errs.length===0, errs.slice(0,2).join(" | "));

  // build-gate spec
  const gate = await p.evaluate(()=>({ dev: window.__audio.assertReleaseAudioMode("development"), rel: window.__audio.assertReleaseAudioMode("release") }));
  A("build-gate spec: assertReleaseAudioMode('development')=false, ('release')=true", gate.dev===false && gate.rel===true);

  await b.close();
  console.log(fail===0?"\n✅ SES POLİTİKA SMOKE GEÇTİ":"\n❌ "+fail+" başarısız");
  process.exit(fail===0?0:1);
})().catch(e=>{console.error("HATA:",e.message);process.exit(2);});
