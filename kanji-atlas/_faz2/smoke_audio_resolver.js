const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  let fail=0; const A=(n,ok,x)=>{console.log((ok?"✓":"✗")+" "+n+(x?" — "+x:"")); if(!ok)fail++;};
  const errs=[]; const b=await chromium.launch({headless:true}); const p=await b.newPage();
  p.on("pageerror",e=>errs.push(e.message));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|net::ERR/i.test(m.text()))errs.push(m.text());});
  await p.goto("file:///home/claude/atlas_drive_may30.html");
  await p.waitForFunction(()=>typeof window.__audio2!=="undefined",{timeout:15000});

  // gerçek manifestten index kur
  const R = await p.evaluate(()=>{
    const A2=window.__audio2, MAN=AUDIO_MANIFEST;
    const idx=A2.buildAudioIndex(MAN);
    const rKanjiKi = A2.resolveAudioEntry(idx,"kanji","木");
    const rWordKi  = A2.resolveAudioEntry(idx,"word","木");
    // 20 çapraz çakışma: kanji ve word ayrı entry'ye, doğru kategoriye
    const collide = MAN.entries.filter(e=>e.kategori==="kanji").map(e=>e.metin)
      .filter(m => MAN.entries.some(e=>e.kategori==="word"&&e.metin===m));
    const uniq=[...new Set(collide)];
    const allSplit = uniq.every(m=>{
      const k=A2.resolveAudioEntry(idx,"kanji",m), w=A2.resolveAudioEntry(idx,"word",m);
      return k.status==="found"&&k.entry.kategori==="kanji" && w.status==="found"&&w.entry.kategori==="word" && k.entry.id!==w.entry.id;
    });
    return { kanjiKi:{st:rKanjiKi.status,id:rKanjiKi.entry&&rKanjiKi.entry.id}, wordKiCat:rWordKi.entry&&rWordKi.entry.kategori,
             collideCount:uniq.length, allSplit };
  });
  console.log("=== çözüm (gerçek manifest) ===");
  A("1) kanji+木 → kanji kaydı (id kanji_*)", R.kanjiKi.st==="found" && /^kanji_/.test(R.kanjiKi.id), R.kanjiKi.id);
  A("2) word+木 → word kaydı (kanji'ye gitmez)", R.wordKiCat==="word");
  A("3) 20 çapraz çakışmanın tümü doğru kategoriye ayrışır", R.collideCount>=20 && R.allSplit, R.collideCount+" çakışma");

  // 4) duplicate → ilk seçilmez (sentetik index)
  const dup = await p.evaluate(()=>{
    const A2=window.__audio2;
    const man={entries:[{id:"x1",kategori:"word",metin:"力",durum:"recorded",ses_dosyasi:"audio/word/a.mp3"},
                        {id:"x2",kategori:"word",metin:"力",durum:"recorded",ses_dosyasi:"audio/word/b.mp3"}]};
    const idx=A2.buildAudioIndex(man);
    const res=A2.resolveAudioEntry(idx,"word","力");
    return { status:res.status, ids:res.ids, devAct:A2.decideAudioAction(res,"development","fixed"),
             relAct:A2.decideAudioAction(res,"release","fixed") };
  });
  A("4) duplicate tespit + İLK SEÇİLMEZ (dev tts/release silent, diagnostic)",
    dup.status==="duplicate" && dup.devAct.action==="tts" && dup.relAct.action==="silent" && dup.devAct.diagnostic.includes("duplicate"));

  // 5-7) not-found ayrımı: sabit vs dinamik vs kategorisiz
  const nf = await p.evaluate(()=>{
    const A2=window.__audio2, idx=A2.buildAudioIndex(AUDIO_MANIFEST);
    const notFound=A2.resolveAudioEntry(idx,"kanji","絶");     // manifestte yok
    const noCat=A2.resolveAudioEntry(idx,"","森");             // kategori yok → çözmez
    return {
      fixed: A2.decideAudioAction(notFound,"development","fixed"),
      dynDev: A2.decideAudioAction(notFound,"development","dynamic"),
      dynRel: A2.decideAudioAction(notFound,"release","dynamic"),
      noCatStatus: noCat.status,
      legacyRel: A2.decideAudioAction(noCat,"release","dynamic"),   // kategorisiz + release → TTS YAPMAZ
      legacyDev: A2.decideAudioAction(noCat,"development","dynamic")
    };
  });
  console.log("=== not-found ayrımı ===");
  A("5) sabit yüzey not-found → diagnostic (fixed-not-found)", nf.fixed.diagnostic.includes("fixed-not-found"));
  A("6) dinamik not-found → dev tts / release silent", nf.dynDev.action==="tts" && nf.dynRel.action==="silent");
  A("7) kategorisiz legacy → çözülmez; dev tts (kırılmaz), release SILENT (TTS kaçağı yok)",
    nf.noCatStatus==="not-found" && nf.legacyDev.action==="tts" && nf.legacyRel.action==="silent");

  // qa-pending + delegate (adım-5 çekirdeği tekrar test EDİLMEZ, yalnız yeni qa dalı + birkaç delege)
  const qa = await p.evaluate(()=>{
    const A2=window.__audio2;
    const pending={status:"found",entry:{durum:"recorded",ses_dosyasi:"audio/kana/ki.mp3",dogrulanmali:true}};
    const approved={status:"found",entry:{durum:"recorded",ses_dosyasi:"audio/word/x.mp3"}};      // dogrulanmali yok
    const noFile={status:"found",entry:{durum:"recorded",ses_dosyasi:null,dogrulanmali:true}};
    const tts={status:"found",entry:{durum:"tts",ses_dosyasi:null}};
    return {
      pendDev:A2.decideAudioAction(pending,"development","fixed"), pendRel:A2.decideAudioAction(pending,"release","fixed"),
      apprDev:A2.decideAudioAction(approved,"development","fixed").action, apprRel:A2.decideAudioAction(approved,"release","fixed").action,
      noFileDev:A2.decideAudioAction(noFile,"development","fixed").action, noFileRel:A2.decideAudioAction(noFile,"release","fixed").action,
      ttsRel:A2.decideAudioAction(tts,"release","fixed").action
    };
  });
  console.log("=== qa-onay + delege ===");
  A("qa-pending recorded → dev:file+diagnostic, release:SILENT (onaysız oynatma yok)",
    qa.pendDev.action==="file" && qa.pendDev.diagnostic.includes("qa-pending") && qa.pendRel.action==="silent");
  A("approved recorded → file/file (delege)", qa.apprDev==="file" && qa.apprRel==="file");
  A("recorded-no-file (pending olsa da) → dev tts/release silent", qa.noFileDev==="tts" && qa.noFileRel==="silent");
  A("tts → release silent (delege)", qa.ttsRel==="silent");

  // 11) saf + deterministik + state değişmez
  const pure = await p.evaluate(()=>{
    const A2=window.__audio2, idx=A2.buildAudioIndex(AUDIO_MANIFEST);
    const sb=JSON.stringify(window.JYA.state);
    const r1=JSON.stringify(A2.resolveAudioEntry(idx,"kanji","木")), r2=JSON.stringify(A2.resolveAudioEntry(idx,"kanji","木"));
    A2.decideAudioAction({status:"found",entry:{durum:"tts"}},"release","fixed");
    return { det:r1===r2, state:sb===JSON.stringify(window.JYA.state) };
  });
  A("11) resolver saf + deterministik + state değişmez", pure.det && pure.state);

  // entegrasyon YOK (speak değişmedi, tüketici yok)
  const src=fs.readFileSync("/home/claude/apps-deploy/kanji-atlas/index.html","utf-8");
  const callCount=(f)=>(src.match(new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"))||[]).length;
  A("6a: resolver speak()'e bağlı DEĞİL (çağrı-sözdizimi = yalnız tanım, çağıran yok)",
    callCount("buildAudioIndex(")===1 && callCount("resolveAudioEntry(")===1 && callCount("decideAudioAction(")===1);
  A("runtime fetch yok", !/fetch[^;\n]{0,80}manifest/i.test(src));
  A("yeni JS exception yok", errs.length===0, errs.slice(0,2).join(" | "));

  await b.close();
  console.log(fail===0?"\n✅ 6a RESOLVER SMOKE GEÇTİ":"\n❌ "+fail+" başarısız");
  process.exit(fail===0?0:1);
})().catch(e=>{console.error("HATA:",e.message);process.exit(2);});
