/* P0-5B-5 · Entegrasyon regresyonu — uçtan uca gerçek reload yolculukları. */
const { chromium } = require("/home/claude/.npm-global/lib/node_modules/playwright");
const URL = "file:///home/claude/apps-deploy/kanji-atlas/index.html";
(async () => {
  let fail=0; const A=(n,ok,x)=>{console.log((ok?"  ✓ ":"  ✗ ")+n+(x?" — "+x:""));if(!ok)fail++;};
  const b=await chromium.launch({headless:true}); const p=await b.newPage();
  const perr=[]; p.on("pageerror",e=>perr.push(String(e.message||e)));
  const boot=async()=>{ await p.waitForFunction(()=>window.JYA!==undefined&&window.STORE!==undefined,{timeout:15000}); };
  await p.goto(URL,{waitUntil:"domcontentloaded"}); await boot();

  // ================= A: v1 kullanıcı yolculuğu (migrate → aktivite → reload) =================
  console.log("— A: legacy v1 → migrate → aktivite → reload —");
  const v1 = { schemaVersion:1, kana:{"あ":true,"い":true},
    srs:{ ichi:{correct:3,wrong:0,mastery:2,last:100,next:200}, "ZZZ_bad":{correct:1,wrong:0,mastery:1} },
    learned:{ichi:true}, status:{ichi:"soon"}, userHints:{ichi:"kanji notu","あ":"kana notu"} };
  await p.evaluate(v=>localStorage.setItem("kana_state",JSON.stringify(v)), v1);
  await p.reload({waitUntil:"domcontentloaded"}); await boot();
  let R = await p.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem("kana_state"));
    return { ro:window.STORE.readOnly, ver:s.schemaVersion, aSeed:s.srs["あ"], ichi:s.srs.ichi,
      quar:!!(s._migrationQuarantine&&s._migrationQuarantine.srs&&s._migrationQuarantine.srs["ZZZ_bad"]),
      badGone:!s.srs["ZZZ_bad"], uh_ichi:s.userHints.ichi, uh_a:s.userHints["あ"], bak:!!localStorage.getItem("kana_state.bak.v1") };
  });
  A("A1 migrate: v2, readOnly=false", R.ver===2 && R.ro===false);
  A("A1 あ SEED (kana, m1, last/next null)", R.aSeed&&R.aSeed.type==="kana"&&R.aSeed.mastery===1&&R.aSeed.last===null);
  A("A1 ichi kanji + mastery korundu", R.ichi&&R.ichi.type==="kanji"&&R.ichi.mastery===2);
  A("A1 ZZZ_bad quarantine, canonical temiz", R.quar&&R.badGone);
  A("A1 userHints (ichi + あ) korundu", R.uh_ichi==="kanji notu"&&R.uh_a==="kana notu");
  A("A1 hash'li backup yazıldı", R.bak);
  // aktivite: yeni kana doğru, yeni kanji yanlış, word-known
  await p.evaluate(()=>{ srsRecord("う",true); srsRecord("ni",false); srsRecord(DATA.words[0].id,true,{known:true}); save(); });
  await p.reload({waitUntil:"domcontentloaded"}); await boot();
  R = await p.evaluate(()=>{
    const s=JSON.parse(localStorage.getItem("kana_state"));
    let valid=false; try{ valid=validateV2Shape(s); }catch(e){}
    return { ro:window.STORE.readOnly, ver:s.schemaVersion, valid, u:s.srs["う"], ni:s.srs.ni, w:s.srs[DATA?"":""]||s.srs[Object.keys(s.srs).find(k=>s.srs[k].type==="word")],
      uh:s.userHints.ichi, kanaLearnedCount: (window.JYA? null:null) };
  });
  A("A2 aktivite+reload: recovery YOK (v2, valid)", R.ver===2 && R.ro===false && R.valid);
  A("A2 yeni kana う (type kana, seen≥1)", R.u&&R.u.type==="kana"&&R.u.seen>=1);
  A("A2 yeni kanji ni (type kanji, wrong≥1)", R.ni&&R.ni.type==="kanji"&&R.ni.wrong>=1);
  A("A2 word-known kaydı (type word, mastery2)", R.w&&R.w.type==="word"&&R.w.mastery===2);
  A("A2 userHints hâlâ korundu", R.uh==="kanji notu");

  // ================= B: reset yolları (5B sonrası) =================
  console.log("— B: reset yolları —");
  // progress-only: userHints KORUNUR
  let Rb = await p.evaluate(()=>{
    state.userHints={ichi:"korunmalı"}; state.srs={ichi:{type:"kanji",correct:1,wrong:0,mastery:1,seen:1,write:0,last:null,next:null}}; state.kana={"あ":true}; save();
    clearProgressData(); save();
    const s=JSON.parse(localStorage.getItem("kana_state"));
    let valid=false; try{valid=validateV2Shape(s);}catch(e){}
    return { srsEmpty:Object.keys(s.srs).length===0, kanaEmpty:Object.keys(s.kana).length===0, uh:s.userHints.ichi, valid };
  });
  A("B1 progress-only: srs+kana temiz, userHints KORUNDU, v2-valid", Rb.srsEmpty&&Rb.kanaEmpty&&Rb.uh==="korunmalı"&&Rb.valid);
  await p.reload({waitUntil:"domcontentloaded"}); await boot();
  A("B1 reload sonrası recovery YOK", (await p.evaluate(()=>window.STORE.readOnly))===false);
  // full reset: resetCanonical → temiz, userHints temizlenir
  let Rb2 = await p.evaluate(()=>{
    state.userHints={ichi:"silinmeli"}; state.srs={ichi:{type:"kanji",correct:1,wrong:0,mastery:1,seen:1,write:0,last:null,next:null}}; save();
    const res=STORE.resetCanonical();
    const s=JSON.parse(localStorage.getItem("kana_state"));
    let valid=false; try{valid=validateV2Shape(s);}catch(e){}
    return { ok:res.ok, srsEmpty:Object.keys(s.srs).length===0, uhEmpty:Object.keys(s.userHints).length===0, ver:s.schemaVersion, valid, bakGone:localStorage.getItem("kana_state.bak.v1")===null };
  });
  A("B2 full reset: temiz v2, srs boş, userHints SİLİNDİ, .bak temizlendi", Rb2.ok&&Rb2.srsEmpty&&Rb2.uhEmpty&&Rb2.ver===2&&Rb2.valid&&Rb2.bakGone);

  // ================= C: §9 completion denkliği (userStage kaynağı) =================
  console.log("— C: §9 denklik (canlı userStage/kanaLearned) —");
  let Rc = await p.evaluate(()=>{
    const all=DATA.hiragana.flat().filter(x=>x&&x.character).map(x=>x.character);
    const chosen=all.slice(0,20);
    state.kana={}; state.srs={};
    chosen.forEach(c=>{ state.kana[c]=true; state.srs[c]={type:"kana",correct:0,wrong:0,mastery:1,seen:1,write:0,last:null,next:null}; });
    const perChar=chosen.every(c=>kanaLearned(c)===(state.kana[c]===true));
    const oldCount=all.filter(c=>state.kana[c]===true).length;
    const newCount=all.filter(c=>kanaLearned(c)).length;
    return { perChar, eq: oldCount===newCount };
  });
  A("C1 §9 her karakter kanaLearned==boolean (migrated SEED)", Rc.perChar && Rc.eq);

  // ================= E: kana review zamanlama =================
  console.log("— E: kana review zamanlama —");
  let Re = await p.evaluate(()=>{
    const NOW=2000000000;
    state.srs={ "あ":{type:"kana",correct:0,wrong:0,mastery:1,seen:1,write:0,last:null,next:null},  // SEED
               "い":{type:"kana",correct:1,wrong:0,mastery:1,seen:1,write:0,last:NOW-1000,next:NOW-500} }; // due
    const seedDue = window.__srs.buildKanaReviewQueue(state, NOW).includes("あ");
    const realDue = window.__srs.buildKanaReviewQueue(state, NOW).includes("い");
    return { seedDue, realDue };
  });
  A("E1 SEED kana (next:null) due DEĞİL", Re.seedDue===false);
  A("E1 gerçek-cevap kana (next geçmiş) due", Re.realDue===true);

  A("Genel: boot/işlem hatasız", perr.filter(e=>!/ERR_TUNNEL|Failed to load resource/.test(e)).length===0, perr.join("|"));
  await b.close();
  console.log("\n5B-5 ENTEGRASYON: "+(fail?("✗ "+fail+" kaldı"):"tümü geçti"));
  process.exit(fail?1:0);
})().catch(e=>{console.error("HATA:",e.message);process.exit(2)});
