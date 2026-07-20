const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  let fail=0; const A=(n,ok,x)=>{console.log((ok?"✓":"✗")+" "+n+(x?" — "+x:"")); if(!ok)fail++;};
  const errs=[]; const b=await chromium.launch({headless:true}); const p=await b.newPage();
  p.on("pageerror",e=>errs.push(e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|net::ERR/i.test(m.text()))errs.push(m.text());});
  await p.goto("file:///home/claude/atlas_drive_may30.html");
  await p.waitForFunction(()=>typeof window.JYA!=="undefined",{timeout:15000});

  // KATMAN 1: manifest yolları tekil (çoğul sıfır) — gömülü manifestten oku
  const layer1 = await p.evaluate(()=>{
    const paths = AUDIO_MANIFEST.entries.filter(e=>e.ses_dosyasi).map(e=>e.ses_dosyasi);
    return { total: paths.length, plural: paths.filter(x=>/audio\/(words|sentences)\//.test(x)).length,
             roots: [...new Set(paths.map(x=>x.split("/").slice(0,2).join("/")))] };
  });
  A("KATMAN 1) manifest ses yollarında çoğul SIFIR", layer1.plural===0, `${layer1.total} yol, kökler: ${layer1.roots}`);
  A("KATMAN 1) yalnız tekil kökler (audio/kana|kanji|word)", layer1.roots.every(r=>/^audio\/(kana|kanji|word)$/.test(r)), layer1.roots.join());

  // KATMAN 3: göreli URL çözümü — audio/ HTML ile aynı kökte, doküman-göreli çözülür
  const layer3 = await p.evaluate(()=>{
    const rel = "audio/word/mori.mp3";
    const resolved = new URL(rel, document.baseURI).href;
    const base = document.baseURI.replace(/[^/]*$/, "");   // HTML'in bulunduğu klasör
    return { resolved, expected: base+rel, sameDir: resolved === base+rel };
  });
  A("KATMAN 3) göreli URL doküman konumuna göre çözülür (audio/ HTML kökünde)", layer3.sameDir, layer3.resolved);

  // speak() göreli url kullanıyor mu (mutlak/http değil) — DATA audio örneği
  const relUsage = await p.evaluate(()=>{
    const w = window.JYA.DATA.words.find(x=>x.audio&&x.audio.word);
    return { word: w&&w.audio.word, sentence: w&&w.audio.sentence };
  });
  A("DATA audio yolları göreli + tekil (audio/word, audio/sentence)",
    /^audio\/word\//.test(relUsage.word||"") && /^audio\/sentence\//.test(relUsage.sentence||""), JSON.stringify(relUsage));

  // render regresyonu yok
  const rendered = await p.evaluate(()=>{
    const out={}; for(const s of ["home","kana","words","detail","progress"]){ try{window.JYA.go(s, s==="detail"?"ki":null, false); out[s]=document.body.children.length>0;}catch(e){out[s]="ERR";} } return out;
  });
  A("render regresyonu yok (home/kana/words/detail/progress)", Object.values(rendered).every(v=>v===true), JSON.stringify(rendered));
  A("yeni JS exception yok", errs.length===0, errs.slice(0,2).join(" | "));

  await b.close();
  console.log(fail===0?"\n✅ YOL NORMALİZASYON SMOKE GEÇTİ":"\n❌ "+fail+" başarısız");
  process.exit(fail===0?0:1);
})().catch(e=>{console.error("HATA:",e.message);process.exit(2);});
