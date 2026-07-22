const { chromium } = require("/home/claude/.npm-global/lib/node_modules/playwright");
const URL = "file:///home/claude/apps-deploy/kanji-atlas/index.html";
(async () => {
  let fail=0; const A=(n,ok,x)=>{console.log((ok?"  ✓ ":"  ✗ ")+n+(x?" — "+x:""));if(!ok)fail++;};
  const b=await chromium.launch({headless:true}); const p=await b.newPage();
  const perr=[]; p.on("pageerror",e=>perr.push(e.message));
  await p.goto(URL,{waitUntil:"domcontentloaded"}); await p.waitForFunction(()=>window.STORE!==undefined,{timeout:15000});

  const R = await p.evaluate(()=>{
    const NOW = 1000000000;
    const K = (type,next,mastery)=>({type,correct:1,wrong:0,mastery:mastery==null?1:mastery,seen:1,write:0,last:next==null?null:next-100,next});
    state.srs = {
      "あ": K("kana", NOW-5000, 1),      // due kana (eski)
      "い": K("kana", NOW-1000, 2),      // due kana (yeni) — sıralamada sonra
      "う": K("kana", NOW+100000, 1),    // gelecek kana → due değil
      "え": K("kana", null, 1),          // SEED kana next:null → due değil
      "ichi": K("kanji", NOW-9000, 1),   // due kanji → kana kuyruğunda OLMAMALI
    };
    const kana = window.__srs.buildKanaReviewQueue(state, NOW);
    const kanji = window.__srs.buildKanjiReviewQueue(state, DATA, NOW);
    const kanaCount = window.__srs.kanaDueCount(NOW);
    return { kana, kanji, kanaCount };
  });

  A("kana kuyruğu yalnız due kana (あ,い)", JSON.stringify(R.kana)===JSON.stringify(["あ","い"]));
  A("sıralama: en eski next önce (あ<い)", R.kana[0]==="あ" && R.kana[1]==="い");
  A("gelecek kana (う) due DEĞİL", !R.kana.includes("う"));
  A("SEED next:null (え) due DEĞİL", !R.kana.includes("え"));
  A("kanji (ichi) kana kuyruğunda YOK", !R.kana.includes("ichi"));
  A("kanaDueCount=2", R.kanaCount===2);
  A("REGRESYON: kanji kuyruğu yalnız due kanji (ichi)", JSON.stringify(R.kanji)===JSON.stringify(["ichi"]));
  A("REGRESYON: kanji kuyruğunda kana YOK", !R.kanji.some(x=>["あ","い","う","え"].includes(x)));
  A("boot/işlem hatasız", perr.length===0, perr.join("|"));

  await b.close();
  console.log("\n5B-2 FIXTURES: "+(fail?("✗ "+fail):"tümü geçti"));
  process.exit(fail?1:0);
})().catch(e=>{console.error("HATA:",e.message);process.exit(2)});
